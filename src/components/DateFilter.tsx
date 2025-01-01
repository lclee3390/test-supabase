import { useState, useEffect } from 'react'

interface DateFilterProps {
  articles: Array<{
    created_at: string
  }>
  onSelectDate: (date: string | null) => void
  selectedDate: string | null
}

export default function DateFilter({ articles, onSelectDate, selectedDate }: DateFilterProps) {
  const [dates, setDates] = useState<string[]>([])

  useEffect(() => {
    // 獲取所有不重複的日期
    const uniqueDates = [...new Set(articles.map(article => {
      return new Date(article.created_at).toISOString().split('T')[0]
    }))].sort().reverse()
    
    setDates(uniqueDates)
  }, [articles])

  return (
    <div className="date-filter">
      <h3>依日期篩選</h3>
      <div className="date-list">
        {selectedDate && (
          <button 
            className="date-tag clear-date" 
            onClick={() => onSelectDate(null)}
          >
            顯示全部
          </button>
        )}
        {dates.map(date => (
          <button
            key={date}
            className={`date-tag ${selectedDate === date ? 'active' : ''}`}
            onClick={() => onSelectDate(date === selectedDate ? null : date)}
          >
            {new Date(date).toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </button>
        ))}
      </div>
    </div>
  )
} 