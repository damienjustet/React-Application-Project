import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import './UpcomingTransactionsWidget.css'

// Import company brand icons from react-icons
import { SiNetflix, SiSpotify, SiYoutube, SiApplemusic, SiApple, SiAmazon } from 'react-icons/si'
import { FaHome, FaWifi, FaDumbbell, FaDollarSign, FaMoneyBillWave, FaTv, FaFilm, FaPlay, FaWeightHanging, FaChevronRight } from 'react-icons/fa'

// Keyword-to-icon mapping for intelligent matching
const iconKeywordMap = [
  { keywords: ['netflix'], icon: SiNetflix },
  { keywords: ['spotify'], icon: SiSpotify },
  { keywords: ['disney', 'disney+', 'disneyplus'], icon: FaFilm },
  { keywords: ['crunchyroll'], icon: FaTv },
  { keywords: ['youtube', 'yt'], icon: SiYoutube },
  { keywords: ['amazon prime', 'prime video', 'amazon'], icon: SiAmazon },
  { keywords: ['hulu'], icon: FaPlay },
  { keywords: ['hbo', 'hbo max', 'max'], icon: FaTv },
  { keywords: ['apple music'], icon: SiApplemusic },
  { keywords: ['apple', 'icloud'], icon: SiApple },
  { keywords: ['rent', 'rental', 'apartment', 'house'], icon: FaHome },
  { keywords: ['internet', 'wifi', 'broadband', 'xfinity', 'comcast', 'verizon'], icon: FaWifi },
  { keywords: ['gym', 'fitness', 'membership', 'planet fitness', 'la fitness'], icon: FaWeightHanging },
  { keywords: ['payroll', 'salary', 'wage', 'income'], icon: FaDollarSign }
]

// Get icon component for a service with intelligent keyword matching
const getServiceIcon = (name) => {
  if (!name) return FaMoneyBillWave
  
  const nameLower = name.toLowerCase().trim()
  
  // Try to find a matching icon by checking keywords
  for (const { keywords, icon } of iconKeywordMap) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return icon
    }
  }
  
  // Default to money icon if no match found
  return FaMoneyBillWave
}

// Calculate days until next occurrence based on due date
const getDaysUntil = (dueDate) => {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  let dueDayNum = parseInt(dueDate, 10)
  
  // Calculate next occurrence
  let nextDate = new Date(currentYear, currentMonth, dueDayNum)
  
  // If due date has passed this month, move to next month
  if (dueDayNum <= currentDay) {
    nextDate = new Date(currentYear, currentMonth + 1, dueDayNum)
  }
  
  // Calculate difference in days
  const diffTime = nextDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// Format days until text
const formatDaysUntil = (days) => {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

function UpcomingTransactionsWidget({ isFeatured = false }) {
  const { recurringBills } = useData()
  const navigate = useNavigate()
  
  // Process and sort upcoming transactions - show all for featured view
  const upcomingItems = useMemo(() => {
    return recurringBills
      .map(bill => ({
        ...bill,
        daysUntil: getDaysUntil(bill.dueDate),
        IconComponent: getServiceIcon(bill.name)
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [recurringBills])

  const handleSeeMore = () => {
    navigate('/recurring')
  }

  if (upcomingItems.length === 0) {
    return (
      <div className={`upcoming-transactions-widget ${isFeatured ? 'featured' : ''}`}>
        <div className="upcoming-empty">
          <i className="fa-solid fa-calendar-xmark"></i>
          <span>No upcoming transactions</span>
        </div>
      </div>
    )
  }

  // Featured view - full width, horizontal scroll with "See More" at end
  if (isFeatured) {
    return (
      <div className="upcoming-transactions-featured">
        <div className="upcoming-featured-header">
          <h3 className="upcoming-featured-title">Upcoming</h3>
        </div>
        <div className="upcoming-featured-scroll">
          <div className="upcoming-featured-tiles">
            {upcomingItems.map(item => {
              const IconComponent = item.IconComponent
              return (
                <div key={item.id} className="upcoming-tile">
                  <div className="tile-header">
                    <span className="tile-name">{item.name}</span>
                    <span className="tile-countdown">{formatDaysUntil(item.daysUntil)}</span>
                  </div>
                  <div className="tile-icon">
                    <IconComponent />
                  </div>
                </div>
              )
            })}
            {/* See More Button - same size as tiles */}
            <div className="upcoming-tile see-more-tile" onClick={handleSeeMore}>
              <div className="tile-header">
                <span className="tile-name">See More</span>
                <span className="tile-countdown">View all</span>
              </div>
              <div className="tile-icon">
                <FaChevronRight />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard grid view (legacy - limited to 5 items)
  return (
    <div className="upcoming-transactions-widget">
      <div className="upcoming-tiles">
        {upcomingItems.slice(0, 5).map(item => {
          const IconComponent = item.IconComponent
          return (
            <div key={item.id} className="upcoming-tile">
              <div className="tile-header">
                <span className="tile-name">{item.name}</span>
                <span className="tile-countdown">{formatDaysUntil(item.daysUntil)}</span>
              </div>
              <div className="tile-icon">
                <IconComponent />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(UpcomingTransactionsWidget)
