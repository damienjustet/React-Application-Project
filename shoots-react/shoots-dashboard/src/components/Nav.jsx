import './Nav.css'
import shootsLogo from '../assets/shootsLogo1.svg'

function Nav() {
  return (
    <nav className="sidebar">
      <ul className="nav-links">
        <li>
          <a href="#" className="nav-item home-item">
            <img src={shootsLogo} className="logo-icon" alt="Logo" />
            <span>Home</span>
            <i className="fa-solid fa-plus add-btn"></i>
          </a>
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
          <a href="#" className="nav-item">
            <i className="fa-solid fa-clipboard icon"></i>
            <span>Spending</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-item">
            <i className="fa-solid fa-wallet icon"></i>
            <span>Budget</span>
          </a>
        </li>
        <li className="settings-item">
          <a href="#" className="nav-item">
            <i className="fa-solid fa-gear icon"></i>
            <span>Settings</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
