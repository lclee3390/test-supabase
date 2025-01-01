import { useState } from 'react'

interface SearchFilters {
  title: string
  content: string
  dateFrom: string
  dateTo: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClose: () => void
  initialFilters?: SearchFilters
}

export default function AdvancedSearch({ onSearch, onClose, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    title: '',
    content: '',
    dateFrom: '',
    dateTo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleClear = () => {
    const emptyFilters = {
      title: '',
      content: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(emptyFilters)
    onSearch(emptyFilters)
  }

  return (
    <div className="advanced-search-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>進階搜尋</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="search-filters">
            <div className="filter-group">
              <label>標題包含</label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                placeholder="搜尋標題..."
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>內容包含</label>
              <input
                type="text"
                value={filters.content}
                onChange={(e) => setFilters({ ...filters, content: e.target.value })}
                placeholder="搜尋內容..."
                className="search-input"
              />
            </div>
            <div className="filter-row">
              <div className="filter-group">
                <label>日期從</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="search-input"
                    max={filters.dateTo || undefined}
                  />
                </div>
              </div>
              <div className="filter-group">
                <label>到</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="search-input"
                    min={filters.dateFrom || undefined}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="clear-button" onClick={handleClear}>
              清除條件
            </button>
            <div className="action-buttons">
              <button type="button" className="cancel-button" onClick={onClose}>
                取消
              </button>
              <button type="submit" className="submit-button">
                搜尋
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 