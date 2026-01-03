import './DashboardHeader.css'
import { useTheme } from '../context/ThemeContext'

const LAST_SYNC_TIME = "1 minute ago"

function SpendingHeader({ isExpanded, toggleSidebar }) {
  const { bannerUrl } = useTheme()

  return (
    <header className="dashboard-header">
      <div className="top-bar">
        {!isExpanded && (
          <i className="fa-solid fa-bars hamburger-icon" onClick={toggleSidebar}></i>
        )}
        <span className="sync-status">Last Synced: {LAST_SYNC_TIME}</span>
        <button className="sync-btn">
          <i className="fa-solid fa-arrows-rotate sync-icon"></i>
          Sync Now
        </button>
      </div>
      
      <div className="banner">
        <img 
          src={bannerUrl}
          alt="Header Banner" 
          className="banner-image"
          crossOrigin="anonymous"
        />
      </div>
    </header>
  )
}

export default SpendingHeader
