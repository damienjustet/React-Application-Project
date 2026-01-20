import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react'
import './DashboardHeader.css'
import { useTheme } from '../context/ThemeContext'

// Profile picture URL - shared with favicon
export const PROFILE_PICTURE_URL = "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRbCcz-0bRk8bJf8gE-0KH6XhbekBGIYhy8tIXAljBHEn_cRo94"

const LAST_SYNC_TIME = "1 minute ago"

function DashboardHeader({ userName = "Damien", isExpanded, toggleSidebar, onToggleWidgetLibrary, isEditMode, onToggleEditMode }) {
  const { bannerUrl, updateBanner } = useTheme()
  const bannerFileInputRef = useRef(null)
  const profileFileInputRef = useRef(null)
  const resizeTimeoutRef = useRef(null)
  const faviconCreatedRef = useRef(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [profilePictureUrl, setProfilePictureUrl] = useState(PROFILE_PICTURE_URL)

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768)
      }, 100)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [])

  // Update favicon to match profile picture with circular crop (run only once)
  useEffect(() => {
    if (faviconCreatedRef.current) return
    faviconCreatedRef.current = true
    
    // Run asynchronously to not block initial render
    requestIdleCallback(() => {
      const createCircularFavicon = (imageUrl) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const size = 64 // Reduced from 128 for faster processing
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d', { alpha: true }) // Enable alpha for transparency
          
          // Clear canvas with transparency
          ctx.clearRect(0, 0, size, size)
          
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
          link.href = canvas.toDataURL('image/png', 0.8) // Compress slightly
          if (!link.parentNode) document.head.appendChild(link)
        }
        img.src = imageUrl
      }
      
      createCircularFavicon(PROFILE_PICTURE_URL)
    }, { timeout: 2000 })
  }, [])

  const handleBannerClick = useCallback(() => {
    if (bannerFileInputRef.current) bannerFileInputRef.current.click();
  }, []);

  const handleProfileClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (profileFileInputRef.current) profileFileInputRef.current.click();
  }, []);

  const handleBannerFileChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBanner(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, [updateBanner]);

  const handleProfileFileChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePictureUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <header className="dashboard-header">
      {isMobile ? (
        // Mobile Header
        <>
          <div className="mobile-header-banner" onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
            <div className="banner-gradient-overlay"></div>
            <img 
              src={bannerUrl}
              alt="Header Banner" 
              className="banner-image"
              crossOrigin="anonymous"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
            <img 
              src={profilePictureUrl}
              alt="Profile" 
              className="profile-picture"
              loading="eager"
              decoding="async"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
              title="Click to change profile picture"
            />
          </div>
          <div className="mobile-greeting">
            <h1>Welcome back, {userName}</h1>
          </div>
          <div className="mobile-header-buttons">
            <button className="mobile-settings-btn" onClick={() => {}}>
              <i className="fa-solid fa-gear"></i>
            </button>
            <button className="mobile-notification-btn" onClick={() => {}}>
              <i className="fa-solid fa-bell"></i>
            </button>
            <button 
              className={`mobile-edit-btn ${isEditMode ? 'active' : ''}`} 
              onClick={onToggleEditMode}
            >
              <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-pen-to-square'}`}></i>
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={bannerFileInputRef}
            onChange={handleBannerFileChange}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={profileFileInputRef}
            onChange={handleProfileFileChange}
          />
        </>
      ) : (
        // Desktop Header
        <>
          <div className={`top-bar ${isExpanded ? 'sidebar-expanded' : ''}`}>
            {!isExpanded && (
              <i className="fa-solid fa-bars hamburger-icon" onClick={toggleSidebar}></i>
            )}
            <span className="sync-status">Last Synced: {LAST_SYNC_TIME}</span>
            <button className="sync-btn">
              <i className="fa-solid fa-arrows-rotate sync-icon"></i>
              Sync Now
            </button>
            <button className="notification-icon-btn" onClick={() => {}} title="Notifications">
              <i className="fa-solid fa-bell"></i>
            </button>
            <button className="menu-btn" onClick={onToggleWidgetLibrary} title="Open Widget Library">
              <i className="fa-solid fa-ellipsis"></i>
            </button>
          </div>
          <div className="top-bar-spacer"></div>
          <div className="banner" onClick={handleBannerClick} style={{ cursor: 'pointer' }} title="Click to upload your own banner image">
            <img 
              src={bannerUrl}
              alt="Header Banner" 
              className="banner-image"
              crossOrigin="anonymous"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <img 
              src={profilePictureUrl}
              alt="Profile" 
              className="profile-picture"
              loading="eager"
              decoding="async"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
              title="Click to change profile picture"
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={bannerFileInputRef}
              onChange={handleBannerFileChange}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={profileFileInputRef}
              onChange={handleProfileFileChange}
            />
          </div>
        </>
      )}
    </header>
  )
}

export default memo(DashboardHeader)
