import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface CreateArticleProps {
  onCreated: () => void
  onCancel: () => void
}

export default function CreateArticle({ onCreated, onCancel }: CreateArticleProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('標題和內容不能為空')
      return
    }

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('未登入')

      const { error } = await supabase
        .from('articles')
        .insert([{ 
          title, 
          content,
          user_id: user.id 
        }])

      if (error) throw error
      
      onCreated()
      setTitle('')
      setContent('')
    } catch (error: any) {
      alert(error.message || '新增文章失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-article-modal">
      <div className="modal-content">
        <h2>新增文章</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">標題</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入標題"
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">內容</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請輸入內容"
              rows={6}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              取消
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? '發布中...' : '發布文章'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 