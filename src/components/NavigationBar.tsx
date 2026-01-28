import React, { useState, useEffect } from 'react'
import '../styles/guiasai-theme.css'

interface NavigationBarProps {
  activeTab: 'accommodations' | 'tours' | 'transports'
  onTabChange: (tab: 'accommodations' | 'tours' | 'transports') => void
  userInitials?: string
  userName?: string
  onProfileClick: () => void
  onLogout: () => void
  onLoginClick?: () => void
  isAuthenticated?: boolean
  quotationCount?: number
  onQuotationClick?: () => void
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  userInitials = 'AG',
  userName = 'Mi Agencia',
  onProfileClick,
  onLogout,
  onLoginClick,
  isAuthenticated = false,
  quotationCount = 0,
  onQuotationClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`premium-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="brand-section">
          <a href="#" className="logo-premium">
            <div className="logo-icon">
              <img src="/LOGO GUIASAI.png" alt="GuiaSAI Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <span className="logo-title">GuiaSAI</span>
              <span className="logo-subtitle">Business Hub</span>
            </div>
          </a>
        </div>
        
        <nav className="nav-premium">
          <a 
            href="#alojamientos" 
            className={`nav-link-premium ${activeTab === 'accommodations' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onTabChange('accommodations')
            }}
          >
            <span>🏨 Alojamientos</span>
          </a>
          <a 
            href="#tours" 
            className={`nav-link-premium ${activeTab === 'tours' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onTabChange('tours')
            }}
          >
            <span>🚤 Tours</span>
          </a>
          <a 
            href="#transportes" 
            className={`nav-link-premium ${activeTab === 'transports' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onTabChange('transports')
            }}
          >
            <span>✈️ Transportes</span>
          </a>
        </nav>
        
        <div className="header-actions">
          {quotationCount > 0 && (
            <div className="quote-indicator" onClick={onQuotationClick}>
              <span>Mi Cotización</span>
              <div className="quote-badge">{quotationCount}</div>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="user-avatar" onClick={onProfileClick}>
              {userInitials}
            </div>
          ) : (
            <button className="user-avatar" onClick={onLoginClick}>
              {userInitials}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}