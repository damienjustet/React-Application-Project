import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import DashboardHeader from './components/DashboardHeader'
import DashboardGrid from './components/DashboardGrid'
import SpendingPage from './pages/SpendingPage'

function App() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
    setIsHovering(false)
  }

  return (
    <Router>
      <div className="app">
        <Nav 
          isExpanded={isExpanded}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          toggleSidebar={toggleSidebar}
        />
        <main className={`main-content ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <Routes>
            <Route path="/" element={
              <div className="container">
                <DashboardHeader 
                  userName="Damien" 
                  isExpanded={isExpanded}
                  isHovering={isHovering}
                  toggleSidebar={toggleSidebar}
                />
                <DashboardGrid />
              </div>
            } />
            <Route path="/spending" element={
              <SpendingPage 
                isExpanded={isExpanded}
                isHovering={isHovering}
                toggleSidebar={toggleSidebar}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
