import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Loading from './Loading'

interface Article {
  id: number
  title: string
  content: string
  created_at: string
}

interface GroupedArticles {
  [year: string]: {
    [month: string]: Article[]
  }
}

export default function DateBrowser() {
  const [articles, setArticles] = useState<Article[]>([])
  const [groupedArticles, setGroupedArticles] = useState<GroupedArticles>({})
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles()
  }, [])

  useEffect(() => {
    const grouped = articles.reduce((acc: GroupedArticles, article) => {
      const date = new Date(article.created_at)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      
      if (!acc[year]) acc[year] = {}
      if (!acc[year][month]) acc[year][month] = []
      
      acc[year][month].push(article)
      return acc
    }, {})

    // 排序年份和月份
    const sortedGrouped: GroupedArticles = {}
    Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .forEach(year => {
        sortedGrouped[year] = {}
        Object.keys(grouped[year])
          .sort((a, b) => Number(b) - Number(a))
          .forEach(month => {
            sortedGrouped[year][month] = grouped[year][month].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          })
      })

    setGroupedArticles(sortedGrouped)
  }, [articles])

  async function getArticles() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setArticles(data)
    } catch (error: any) {
      alert(error.message || '獲取文章失敗')
    } finally {
      setLoading(false)
    }
  }

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
      // 關閉該年份下所有月份
      const newExpandedMonths = new Set(expandedMonths)
      Object.keys(groupedArticles[year]).forEach(month => {
        newExpandedMonths.delete(`${year}-${month}`)
      })
      setExpandedMonths(newExpandedMonths)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  const toggleMonth = (year: string, month: string) => {
    const key = `${year}-${month}`
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedMonths(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) return <Loading />

  return (
    <div className="container">
      <div className="date-browser">
        <h1 className="page-title archive">
          歸檔
          <span className="page-count">共 {articles.length} 篇文章</span>
        </h1>
        <div className="archive-tree">
          {Object.entries(groupedArticles).map(([year, months]) => (
            <div key={year} className="year-group">
              <button 
                className={`tree-toggle ${expandedYears.has(year) ? 'expanded' : ''}`}
                onClick={() => toggleYear(year)}
              >
                {year} 年
                <span className="count">({Object.values(months).flat().length})</span>
              </button>
              
              {expandedYears.has(year) && (
                <div className="month-list">
                  {Object.entries(months).map(([month, monthArticles]) => (
                    <div key={`${year}-${month}`} className="month-group">
                      <button 
                        className={`tree-toggle ${expandedMonths.has(`${year}-${month}`) ? 'expanded' : ''}`}
                        onClick={() => toggleMonth(year, month)}
                      >
                        {month} 月
                        <span className="count">({monthArticles.length})</span>
                      </button>
                      
                      {expandedMonths.has(`${year}-${month}`) && (
                        <div className="article-list">
                          {monthArticles.map(article => (
                            <div key={article.id} className="article-item">
                              <time>{formatDate(article.created_at)}</time>
                              <h3>{article.title}</h3>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 