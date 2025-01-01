import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CreateArticle from './CreateArticle'
import AdvancedSearch from './AdvancedSearch'
import EditArticle from './EditArticle'
import DateFilter from './DateFilter'
import Loading from './Loading'
import { useNavigate } from 'react-router-dom'

interface Article {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
  slug?: string
}

interface SearchFilters {
  title: string
  content: string
  dateFrom: string
  dateTo: string
}

interface ArticlesProps {
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
}

export default function Articles({ showCreateModal, setShowCreateModal }: ArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 6
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    title: '',
    content: '',
    dateFrom: '',
    dateTo: ''
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getArticles()
  }, [currentPage])

  useEffect(() => {
    let filtered = articles

    // 先按日期過濾
    if (selectedDate) {
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.created_at).toISOString().split('T')[0]
        return articleDate === selectedDate
      })
    }

    // 再按搜尋詞過濾
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredArticles(filtered)
  }, [searchTerm, articles, selectedDate])

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  async function getArticles() {
    try {
      setLoading(true)
      // 獲取總數
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })

      if (count) {
        setTotalCount(count)
        setTotalPages(Math.ceil(count / PAGE_SIZE))
      }

      // 獲取當前頁的文章
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)

      if (error) throw error
      if (data) setArticles(data)
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message || '獲取文章失敗')
      } else {
        alert('獲取文章失敗')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setSearchFilters(filters)
    const filtered = articles.filter(article => {
      const articleDate = new Date(article.created_at)
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null
      
      return (
        (!filters.title || article.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.content || article.content.toLowerCase().includes(filters.content.toLowerCase())) &&
        (!fromDate || articleDate >= fromDate) &&
        (!toDate || articleDate <= toDate)
      )
    })
    
    setFilteredArticles(filtered)
    setShowAdvancedSearch(false)
  }

  const handleDelete = async (articleId: number) => {
    if (!window.confirm('確定要刪除這篇文章嗎？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

      if (error) {
        console.error('刪除錯誤:', error)
        throw error
      }

      // 更新文章列表
      setArticles(articles.filter(article => article.id !== articleId))
      setFilteredArticles(filteredArticles.filter(article => article.id !== articleId))
      
      // 更新總數
      setTotalCount(prev => prev - 1)
      setTotalPages(Math.ceil((totalCount - 1) / PAGE_SIZE))
      
      // 如果當前頁沒有文章了，且不是第一頁，則回到上一頁
      if (filteredArticles.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        // 否則重新獲取當前頁的文章
        getArticles()
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error('刪除失敗:', error)
        alert(error.message || '刪除文章失敗')
      } else {
        alert('刪除文章失敗')
      }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="main-layout">
      <main className="main-content">
        <div className="header">
          <div className="container">
            <div className="header-content">
              <h1 className="page-title articles">
                列表
                <span className="page-count">共 {totalCount} 篇文章</span>
              </h1>
            </div>
            <div className="header-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="搜尋文章..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              <br/>
            </div>
            <div>
              
              <button 
                className="advanced-search-button"
                onClick={() => setShowAdvancedSearch(true)}
              >
                進階搜尋
              </button>
            </div>
          </div>
        </div>

        <div className="articles-container">
          {filteredArticles.map((article) => (
            <article key={article.id} className="blog-post">
              <div className="blog-post-header">
                <h2 className="blog-post-title">{article.title}</h2>
              </div>
              
              <div className="blog-post-info">
                <div className="blog-post-meta">
                  <time className="blog-post-date">
                    {formatDate(article.created_at)}
                  </time>
                </div>
                <div className="article-actions">
                  <button 
                    onClick={() => navigate(`/article/${article.id}`)}
                    className="view-detail-button"
                  >
                    檢視
                  </button>
                  {currentUserId === article.user_id && (
                    <>
                      <button 
                        onClick={() => setEditingArticle(article)}
                        className="edit-button"
                      >
                        編輯
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="delete-button"
                      >
                        刪除
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="blog-post-content">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                  className="article-content"
                />
              </div>
            </article>
          ))}
          {filteredArticles.length === 0 && (
            <div className="no-results">
              找不到符合
              {searchTerm ? `「${searchTerm}」` : ''}
              {searchFilters.title ? `標題含「${searchFilters.title}」` : ''}
              {searchFilters.content ? `內容含「${searchFilters.content}」` : ''}
              {searchFilters.dateFrom ? `從 ${searchFilters.dateFrom}` : ''}
              {searchFilters.dateTo ? `到 ${searchFilters.dateTo}` : ''}
              的文章
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="page-button"
            >
              上一頁
            </button>
            <span className="page-info">
              第 {currentPage} 頁，共 {totalPages} 頁
            </span>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="page-button"
            >
              下一頁
            </button>
          </div>
        )}

        <div className="date-filter-section">
          <DateFilter
            articles={articles}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
      </main>

      {showCreateModal && (
        <CreateArticle
          onCreated={() => {
            setShowCreateModal(false)
            getArticles()
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          initialFilters={searchFilters}
        />
      )}

      {editingArticle && (
        <EditArticle
          article={editingArticle}
          onEdited={() => {
            setEditingArticle(null)
            getArticles()
          }}
          onCancel={() => setEditingArticle(null)}
        />
      )}
    </div>
  )
} 