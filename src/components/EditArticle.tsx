import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Article {
  id: number
  title: string
  content: string
}

interface EditArticleProps {
  article: Article
  onEdited: () => void
  onCancel: () => void
}

export default function EditArticle({ article, onEdited, onCancel }: EditArticleProps) {
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('articles')
        .update({ title, content })
        .eq('id', article.id)

      if (error) throw error
      onEdited()
    } catch (error: any) {
      alert(error.message || '更新文章失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-article-modal">
      <div className="modal-content">
        <h2>編輯文章</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入標題"
              required
            />
          </div>
          <div className="form-group">
            <label>內容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請輸入內容"
              rows={6}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 