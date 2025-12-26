import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/auth/Login/Login'
import Register from './components/auth/Register/Register'
import OAuthRedirect from './components/auth/OAuthRedirect'
import Kanban from './components/tasks/Kanban/Kanban'
import ImageGalleryEditor from './components/images/ImageGalleryEditor/ImageGalleryEditor'
import Profile from './components/profile/Profile/Profile'
import Chat from './components/chat/Chat/Chat'
import Sidebar from './components/common/Sidebar/Sidebar'
import WelcomePanel from './components/common/WelcomePanel/WelcomePanel'
import ProfileWarningModal from './components/common/ProfileWarningModal/ProfileWarningModal'
import Portfolio from './components/portfolio/Portfolio/Portfolio'
import { getProfile } from './services/profileService'

function App() {
  const [currentView, setCurrentView] = useState('welcome')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showProfileWarning, setShowProfileWarning] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    // Handle Portfolio (public page - no auth needed)
    if (window.location.pathname === '/portfolio') {
      setCurrentView('portfolio')
      setCheckingAuth(false)
      return
    }

    // Handle OAuth redirect (special case - needs URL)
    if (window.location.pathname === '/oauth2/redirect') {
      setCurrentView('oauth-redirect')
      setCheckingAuth(false)
      return
    }

    const token = localStorage.getItem('token')
    
    // No token - show login
    if (!token) {
      setIsAuthenticated(false)
      setCurrentView('login')
      setCheckingAuth(false)
      return
    }

    // Has token - verify profile
    const result = await getProfile()
    
    if (result.success) {
      setUser(result.data)
      
      // Profile incomplete - show warning modal
      if (!result.data.isCompleted) {
        setShowProfileWarning(true)
      }
      
      // Authenticated
      setIsAuthenticated(true)
      setCurrentView('welcome')
    } else {
      // Token invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      setCurrentView('login')
    }
    
    setCheckingAuth(false)
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setCurrentView('login')
  }

  const handleLoginSuccess = async () => {
    await checkAuthentication()
  }

  const handleGoToProfile = () => {
    setShowProfileWarning(false)
    setCurrentView('profile')
  }

  const handleCloseProfileWarning = () => {
    setShowProfileWarning(false)
  }

  // Render loading state
  if (checkingAuth) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
        </div>
      </div>
    )
  }

  // Render OAuth redirect (special case)
  if (currentView === 'oauth-redirect') {
    return <OAuthRedirect />
  }

  // Render Portfolio (public page)
  if (currentView === 'portfolio') {
    return <Portfolio />
  }

  // Render auth views (login/register)
  if (!isAuthenticated) {
    return (
      <>
        {currentView === 'login' ? (
          <Login 
            onSwitchToRegister={() => setCurrentView('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Register 
            onSwitchToLogin={() => setCurrentView('login')}
            onRegisterSuccess={handleLoginSuccess}
          />
        )}
      </>
    )
  }

  // Render main app layout with sidebar
  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        user={user}
        onLogout={handleLogout}
        onViewProfile={() => setCurrentView('profile')}
      />
      
      <main className="app-main">
        <div className="app-content">
          {currentView === 'welcome' && <WelcomePanel userName={user?.username} />}
          {currentView === 'chat' && <Chat />}
          {currentView === 'editor' && <ImageGalleryEditor />}
          {currentView === 'kanban' && <Kanban />}
          {currentView === 'profile' && <Profile />}
        </div>
      </main>

      {showProfileWarning && (
        <ProfileWarningModal 
          onGoToProfile={handleGoToProfile}
          onClose={handleCloseProfileWarning}
        />
      )}
    </div>
  )
}

export default App
