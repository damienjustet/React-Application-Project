import { useEffect, useRef } from 'react'
import './DashboardHeader.css'
import { useTheme } from '../context/ThemeContext'

// Profile picture URL - shared with favicon
export const PROFILE_PICTURE_URL = "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRbCcz-0bRk8bJf8gE-0KH6XhbekBGIYhy8tIXAljBHEn_cRo94"

const LAST_SYNC_TIME = "1 minute ago"

function DashboardHeader({ userName = "Damien", isExpanded, toggleSidebar, onToggleWidgetLibrary }) {
  const { bannerUrl, updateBanner } = useTheme()
  const fileInputRef = useRef(null)

  // Update favicon to match profile picture with circular crop
  useEffect(() => {
    const createCircularFavicon = (imageUrl) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 128
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        
        // Draw circular clip
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        
        // Draw image centered and cover
        const scale = Math.max(size / img.width, size / img.height)
        const x = (size / 2) - (img.width / 2) * scale
        const y = (size / 2) - (img.height / 2) * scale
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        
        // Set as favicon
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'icon'
        link.href = canvas.toDataURL()
        document.head.appendChild(link)
      }
      img.src = imageUrl
    }
    
    createCircularFavicon(PROFILE_PICTURE_URL)
  }, [])

  const handleBannerClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBanner(event.target.result); // Set banner to data URL
      };
      reader.readAsDataURL(file);
    }
  };

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
        <button className="menu-btn" onClick={onToggleWidgetLibrary} title="Open Widget Library">
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>
      <div className="banner" onClick={handleBannerClick} style={{ cursor: 'pointer' }} title="Click to upload your own banner image">
        <img 
          src={bannerUrl}
          alt="Header Banner" 
          className="banner-image"
          crossOrigin="anonymous"
        />
        <img 
          src={PROFILE_PICTURE_URL}
          alt="Profile" 
          className="profile-picture"
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </header>
  )
}

export default DashboardHeader
