import { Link, useLocation } from 'react-router-dom'
import './Nav.css'
import shootsLogo from '../assets/shootsLogo1.svg'

function Nav({ isExpanded, isHovering, setIsHovering, toggleSidebar }) {
  const location = useLocation()

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
                <i className="fa-solid fa-plus add-btn"></i>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-magnifying-glass icon"></i>
                <span>Savings</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-calendar icon"></i>
                <span>Recurring</span>
              </a>
            </li>
            <li>
              <Link to="/spending" className={`nav-item ${location.pathname === '/spending' ? 'active' : ''}`}>
                <i className="fa-solid fa-clipboard icon"></i>
                <span>Spending</span>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-wallet icon"></i>
                <span>Budget</span>
              </a>
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
                  <i className="fa-solid fa-angles-left collapse-btn" onClick={toggleSidebar}></i>
                  <i className="fa-solid fa-plus add-btn"></i>
                </div>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-magnifying-glass icon"></i>
                <span>Savings</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-calendar icon"></i>
                <span>Recurring</span>
              </a>
            </li>
            <li>
              <Link to="/spending" className={`nav-item ${location.pathname === '/spending' ? 'active' : ''}`}>
                <i className="fa-solid fa-clipboard icon"></i>
                <span>Spending</span>
              </Link>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fa-solid fa-wallet icon"></i>
                <span>Budget</span>
              </a>
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

export default Nav
