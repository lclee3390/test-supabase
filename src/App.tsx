import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Articles from './components/Articles'
import DateBrowser from './components/DateBrowser'
import { Session } from '@supabase/supabase-js'
import ArticleDetail from './pages/ArticleDetail'
import './styles/base/index.css';
import './styles/components/auth.css';
import './styles/components/article.css';
import './styles/components/nav.css';
import './styles/components/logo.css';
import './styles/components/card.css';

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = 'LC Blog'
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      alert('登出失敗')
    }
  }

  if (!session) {
    return <Auth />
  }

  return (
    <Router>
      <div>
        <nav className="nav-menu">
          <div className="nav-links">
            <Link to="/" className="nav-link">列表</Link>
            <Link to="/archive" className="nav-link">歸檔</Link>
          </div>
          <div className="nav-actions">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="nav-create-button"
            >
              ✍️ 新增文章
            </button>
            <button onClick={handleLogout} className="nav-logout">
              登出
            </button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Articles showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} />} />
          <Route path="/archive" element={<DateBrowser />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
