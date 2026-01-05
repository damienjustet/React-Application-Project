import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import './Nav.css'

// Inline Shoots logo component that can use currentColor
const ShootsLogo = () => (
  <svg className="mobile-nav-logo" width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.275 27V30H4.725V27H25.275ZM27 25.275V4.725C27 3.77231 26.2277 3 25.275 3H4.725C3.77231 3 3 3.77231 3 4.725V25.275C3 26.2277 3.77231 27 4.725 27V30C2.11546 30 0 27.8845 0 25.275V4.725C4.60302e-07 2.13585 2.08252 0.0330711 4.66392 0.000366211L4.725 0H25.275L25.3361 0.000366211C27.9175 0.0330715 30 2.13585 30 4.725V25.275L29.9996 25.3361C29.9669 27.9175 27.8642 30 25.275 30V27C26.2277 27 27 26.2277 27 25.275Z" fill="currentColor"/>
    <path d="M23.9116 10.3675L28.8084 13.647C29.8753 14.3616 30.1609 15.8057 29.4464 16.8726L27.2762 20.113L20.4476 15.5397L23.9116 10.3675Z" fill="currentColor"/>
    <path d="M16.7541 5.57609L23.1133 9.83506L19.6493 15.0072L13.2901 10.7483L16.7541 5.57609Z" fill="currentColor"/>
    <path d="M23.8571 10.3557C24.1221 9.95992 24.6579 9.85396 25.0536 10.119C25.4494 10.3841 25.5554 10.9198 25.2903 11.3156L21.8516 16.4501C21.5865 16.8458 21.0508 16.9518 20.655 16.6867C20.2593 16.4217 20.1533 15.8859 20.4184 15.4902L23.8571 10.3557Z" fill="currentColor"/>
    <path d="M16.1299 5.18061C16.395 4.78482 16.9307 4.67886 17.3265 4.94393C17.7223 5.20899 17.8283 5.74472 17.5632 6.1405L14.1245 11.275C13.8594 11.6707 13.3237 11.7767 12.9279 11.5116C12.5321 11.2466 12.4262 10.7108 12.6912 10.3151L16.1299 5.18061Z" fill="currentColor"/>
    <path d="M5.62333 20.1444L2.00557 17.7264C0.576422 16.7712 0.192222 14.8383 1.14744 13.4091L2.87701 10.8214L9.08248 14.969L5.62333 20.1444Z" fill="currentColor"/>
    <path d="M11.9289 24.3567L7.07396 21.1118L10.5331 15.9364L15.3881 19.1813L11.9289 24.3567Z" fill="currentColor"/>
    <path d="M6.18843 20.6133C5.92373 21.0093 5.3881 21.1158 4.99207 20.8511C4.59605 20.5864 4.48958 20.0508 4.75428 19.6547L8.18819 14.5171C8.45289 14.121 8.98851 14.0146 9.38454 14.2793C9.78057 14.544 9.88704 15.0796 9.62234 15.4756L6.18843 20.6133Z" fill="currentColor"/>
    <path d="M12.5534 24.7516C12.2887 25.1477 11.7531 25.2541 11.3571 24.9894C10.961 24.7247 10.8546 24.1891 11.1193 23.7931L14.5532 18.6554C14.8179 18.2594 15.3535 18.1529 15.7495 18.4176C16.1456 18.6823 16.252 19.2179 15.9873 19.614L12.5534 24.7516Z" fill="currentColor"/>
  </svg>
)

function Nav({ isExpanded, isHovering, setIsHovering, toggleSidebar, onSearchClick }) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const resizeTimeoutRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events
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

  const handleSearchClick = useCallback((e) => {
    e.preventDefault()
    onSearchClick()
    setShowMoreMenu(false)
  }, [onSearchClick])

  const toggleMoreMenu = useCallback((e) => {
    e.preventDefault()
    setShowMoreMenu(prev => !prev)
  }, [])

  const closeMoreMenu = useCallback(() => {
    setShowMoreMenu(false)
  }, [])

  // Mobile bottom navigation bar (iOS-style)
  if (isMobile) {
    return (
      <>
        {/* More Menu Backdrop */}
        {showMoreMenu && (
          <div className="more-menu-backdrop" onClick={closeMoreMenu}></div>
        )}
        
        {/* More Menu Slide-up */}
        <div className={`more-menu ${showMoreMenu ? 'open' : ''}`}>
          <div className="more-menu-handle"></div>
          <div className="more-menu-content">
            <a href="#" className="more-menu-item" onClick={handleSearchClick}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Search</span>
            </a>
            <Link to="/recurring" className="more-menu-item" onClick={closeMoreMenu}>
              <i className="fa-solid fa-calendar"></i>
              <span>Recurring</span>
            </Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <ShootsLogo />
            <span>Dashboard</span>
          </Link>
          <Link to="/spending" className={`mobile-nav-item ${location.pathname === '/spending' ? 'active' : ''}`}>
            <i className="fa-solid fa-clipboard"></i>
            <span>Spending</span>
          </Link>
          <Link to="/savings" className={`mobile-nav-item ${location.pathname === '/savings' ? 'active' : ''}`}>
            <i className="fa-solid fa-piggy-bank"></i>
            <span>Savings</span>
          </Link>
          <Link to="/budget" className={`mobile-nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
            <i className="fa-solid fa-wallet"></i>
            <span>Budget</span>
          </Link>
          <a href="#" className="mobile-nav-item" onClick={toggleMoreMenu}>
            <i className="fa-solid fa-bars"></i>
            <span>More</span>
          </a>
        </nav>
      </>
    )
  }

  return (
    <>
      {/* Hover trigger edge for mini-sidebar */}
      {!isExpanded && !isHovering && (
        <div 
          className="hover-trigger"
          onMouseEnter={() => setIsHovering(true)}
        />
      )}

      {/* Mini sidebar on hover */}
      {!isExpanded && isHovering && (
        <nav 
          className="sidebar mini-sidebar"
          onMouseLeave={() => setIsHovering(false)}
        >
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-item home-item ${location.pathname === '/' ? 'active' : ''}`}>
                <img src={shootsLogo} className="logo-icon" alt="Logo" />
                <span>Home</span>
                <i className="fa-solid fa-plus add-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></i>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item" onClick={handleSearchClick}>
                <i className="fa-solid fa-magnifying-glass icon"></i>
                <span>Search</span>
              </a>
            </li>
            <li>
              <Link to="/savings" className={`nav-item ${location.pathname === '/savings' ? 'active' : ''}`}>
                <i className="fa-solid fa-piggy-bank icon"></i>
                <span>Savings</span>
              </Link>
            </li>
            <li>
              <Link to="/recurring" className={`nav-item ${location.pathname === '/recurring' ? 'active' : ''}`}>
                <i className="fa-solid fa-calendar icon"></i>
                <span>Recurring</span>
              </Link>
            </li>
            <li>
              <Link to="/spending" className={`nav-item ${location.pathname === '/spending' ? 'active' : ''}`}>
                <i className="fa-solid fa-clipboard icon"></i>
                <span>Spending</span>
              </Link>
            </li>
            <li>
              <Link to="/budget" className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
                <i className="fa-solid fa-wallet icon"></i>
                <span>Budget</span>
              </Link>
            </li>
          </ul>
          <div className="settings-item">
            <a href="#" className="nav-item">
              <i className="fa-solid fa-gear icon"></i>
              <span>Settings</span>
              <i className="fa-solid fa-circle-question help-icon"></i>
            </a>
          </div>
        </nav>
      )}

      {/* Full expanded sidebar */}
      {isExpanded && (
        <nav className="sidebar">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-item home-item ${location.pathname === '/' ? 'active' : ''}`}>
                <img src={shootsLogo} className="logo-icon" alt="Logo" />
                <span>Home</span>
                <div className="toggle-btn-wrapper">
                  <i className="fa-solid fa-angles-left collapse-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSidebar(); }}></i>
                  <i className="fa-solid fa-plus add-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></i>
                </div>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item" onClick={handleSearchClick}>
                <i className="fa-solid fa-magnifying-glass icon"></i>
                <span>Search</span>
              </a>
            </li>
            <li>
              <Link to="/savings" className={`nav-item ${location.pathname === '/savings' ? 'active' : ''}`}>
                <i className="fa-solid fa-piggy-bank icon"></i>
                <span>Savings</span>
              </Link>
            </li>
            <li>
              <Link to="/recurring" className={`nav-item ${location.pathname === '/recurring' ? 'active' : ''}`}>
                <i className="fa-solid fa-calendar icon"></i>
                <span>Recurring</span>
              </Link>
            </li>
            <li>
              <Link to="/spending" className={`nav-item ${location.pathname === '/spending' ? 'active' : ''}`}>
                <i className="fa-solid fa-clipboard icon"></i>
                <span>Spending</span>
              </Link>
            </li>
            <li>
              <Link to="/budget" className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
                <i className="fa-solid fa-wallet icon"></i>
                <span>Budget</span>
              </Link>
            </li>
          </ul>
          <div className="settings-item">
            <a href="#" className="nav-item">
              <i className="fa-solid fa-gear icon"></i>
              <span>Settings</span>
              <i className="fa-solid fa-circle-question help-icon"></i>
            </a>
          </div>
        </nav>
      )}
    </>
  )
}

export default memo(Nav)
