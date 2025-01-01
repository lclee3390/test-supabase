import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Loading from '../components/Loading'

interface Article {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
}

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticle()
  }, [id])

  async function getArticle() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) setArticle(data)
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

  if (loading) return <Loading />
  if (!article) return <div>文章不存在</div>

  return (
    <div className="article-detail-container">
      <article className="article-detail">
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">
          <time>
            {new Date(article.created_at).toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
        </div>
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <button 
          onClick={() => window.history.back()}
          className="back-button"
        >
          返回文章列表
        </button>
      </article>
    </div>
  )
} 