import './DashboardHeader.css'

function DashboardHeader({ userName = "Damien" }) {
  const getTimeSinceSync = () => {
    return "1 minute ago";
  };

  return (
    <header className="dashboard-header">
      <div className="top-bar">
        <span className="sync-status">Last Synced: {getTimeSinceSync()}</span>
        <button className="sync-btn">
          <span className="sync-icon">🔄</span>
          Sync Now
        </button>
        <button className="menu-btn" title="More options">⋯</button>
      </div>
      
      <div className="banner">
        <img 
          src="https://wallpapers.com/images/hd/ultrawide-forest-13q5t71bljg4rpw9.webp" 
          alt="Header Banner" 
          className="banner-image"
        />
        <img 
          src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRbCcz-0bRk8bJf8gE-0KH6XhbekBGIYhy8tIXAljBHEn_cRo94" 
          alt="Profile" 
          className="profile-picture"
        />
      </div>
    </header>
  )
}

export default DashboardHeader
