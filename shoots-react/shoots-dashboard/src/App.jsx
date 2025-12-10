import { useState } from 'react'
import './App.css'
import Nav from './components/Nav'
import DashboardHeader from './components/DashboardHeader'
import DashboardGrid from './components/DashboardGrid'

function App() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
    setIsHovering(false)
  }

  return (
    <div className="app">
      <Nav 
        isExpanded={isExpanded}
        isHovering={isHovering}
        setIsHovering={setIsHovering}
        toggleSidebar={toggleSidebar}
      />
      <main className={`main-content ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="container">
          <DashboardHeader 
            userName="Damien" 
            isExpanded={isExpanded}
            isHovering={isHovering}
            toggleSidebar={toggleSidebar}
          />
          <DashboardGrid />
        </div>
      </main>
    </div>
  )
}

export default App
