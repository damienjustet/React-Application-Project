import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import './styles/moulpali-font.css'
import Nav from './components/Nav'
import DashboardHeader from './components/DashboardHeader'
import DashboardGrid from './components/DashboardGrid'
import SpendingPage from './pages/SpendingPage'
import SavingsPage from './pages/SavingsPage'
import RecurringPage from './pages/RecurringPage'
import BudgetPage from './pages/BudgetPage'
import OnboardingPage from './pages/OnboardingPage'
import SearchModal from './components/SearchModal'
import WidgetLibrary from './components/WidgetLibrary'
import TransactionModal from './components/TransactionModal'
import { DataProvider } from './context/DataContext'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import { ThemeProvider } from './context/ThemeContext'

function AppContent() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [isMobileEditMode, setIsMobileEditMode] = useState(false)
  const location = useLocation()

  const { undo, redo } = useDashboard()

  // Check if we're on the onboarding page
  const isOnboardingPage = location.pathname === '/onboarding'

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
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // If on onboarding page, render without nav/chrome
  if (isOnboardingPage) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    )
  }

  return (
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
        <TransactionModal />
        <main className={`main-content ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <Routes>
              <Route path="/" element={
                <div className="container">
                  <DashboardHeader 
                    userName="Damien" 
                    isExpanded={isExpanded}
                    toggleSidebar={toggleSidebar}
                    onToggleWidgetLibrary={toggleWidgetLibrary}
                    isEditMode={isMobileEditMode}
                    onToggleEditMode={() => setIsMobileEditMode(!isMobileEditMode)}
                  />
                  <DashboardGrid isEditMode={isMobileEditMode} />
                </div>
              } />
              <Route path="/savings" element={
                <SavingsPage 
                  isExpanded={isExpanded}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/recurring" element={
                <RecurringPage 
                  isExpanded={isExpanded}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/spending" element={
                <SpendingPage 
                  isExpanded={isExpanded}
                  toggleSidebar={toggleSidebar}
                />
              } />
              <Route path="/budget" element={
                <BudgetPage 
                  isExpanded={isExpanded}
                  toggleSidebar={toggleSidebar}
                />
              } />
            </Routes>
          </main>
        </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <DashboardProvider>
          <Router>
            <AppContent />
          </Router>
        </DashboardProvider>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
