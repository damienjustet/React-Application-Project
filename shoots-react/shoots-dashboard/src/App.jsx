import './App.css'
import Nav from './components/Nav'
import DashboardHeader from './components/DashboardHeader'
import DashboardGrid from './components/DashboardGrid'

function App() {
  return (
    <div className="app">
      <Nav />
      <main className="main-content">
        <div className="container">
          <DashboardHeader userName="Damien" />
          <DashboardGrid />
        </div>
      </main>
    </div>
  )
}

export default App
