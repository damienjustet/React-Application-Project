import './Nav.css'

function Nav() {
  return (
    <nav className="sidebar">
      <ul className="nav-links">
        <li>
          <a href="#" className="nav-item home-item">
            <span className="logo-icon">🎋</span>
            <span>Home</span>
            <span className="add-btn">+</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-item">
            <span className="icon">🔍</span>
            <span>Savings</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-item">
            <span className="icon">📅</span>
            <span>Recurring</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-item">
            <span className="icon">📋</span>
            <span>Spending</span>
          </a>
        </li>
        <li>
          <a href="#" className="nav-item">
            <span className="icon">💼</span>
            <span>Budget</span>
          </a>
        </li>
        <li className="settings-item">
          <a href="#" className="nav-item">
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
