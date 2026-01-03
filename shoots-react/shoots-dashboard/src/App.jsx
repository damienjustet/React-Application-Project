import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import DashboardHeader from './components/DashboardHeader'
import DashboardGrid from './components/DashboardGrid'
import SpendingPage from './pages/SpendingPage'
import SavingsPage from './pages/SavingsPage'
import RecurringPage from './pages/RecurringPage'
import BudgetPage from './pages/BudgetPage'
import SearchModal from './components/SearchModal'
import WidgetLibrary from './components/WidgetLibrary'
import { DataProvider } from './context/DataContext'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import { ThemeProvider } from './context/ThemeContext'

function AppContent() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)

  const { undo, redo } = useDashboard()

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
    setIsHovering(false)
  }

  const openSearch = () => {
    setIsSearchOpen(true)
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
  }

  const toggleWidgetLibrary = () => {
    setIsWidgetLibraryOpen(!isWidgetLibraryOpen)
  }

  const closeWidgetLibrary = () => {
    setIsWidgetLibraryOpen(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K / Cmd+K - Open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }

      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Y / Cmd+Shift+Z - Redo
      if (((e.ctrlKey && e.key === 'y') || (e.metaKey && e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <Router>
      <div className="app">
        <Nav 
          isExpanded={isExpanded}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          toggleSidebar={toggleSidebar}
          onSearchClick={openSearch}
        />
        <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
        <WidgetLibrary isOpen={isWidgetLibraryOpen} onClose={closeWidgetLibrary} />
        <main className={`main-content ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <Routes>
              <Route path="/" element={
                <div className="container">
                  <DashboardHeader 
                    userName="Damien" 
                    isExpanded={isExpanded}
                    isHovering={isHovering}
                    toggleSidebar={toggleSidebar}
                    onToggleWidgetLibrary={toggleWidgetLibrary}
                  />
                  <DashboardGrid />
                </div>
              } />
              <Route path="/savings" element={
                <SavingsPage 
                  isExpanded={isExpanded}
                  isHovering={isHovering}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/recurring" element={
                <RecurringPage 
                  isExpanded={isExpanded}
                  isHovering={isHovering}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/spending" element={
                <SpendingPage 
                  isExpanded={isExpanded}
                  isHovering={isHovering}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/budget" element={
                <BudgetPage 
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

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <DashboardProvider>
          <AppContent />
        </DashboardProvider>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
