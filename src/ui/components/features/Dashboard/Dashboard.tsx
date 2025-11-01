import React, { useCallback, useState } from 'react'
import addStock from '../../../assets/add-stock.svg'
import logo from '../../../assets/logo.png'
import logout from '../../../assets/logout.svg'
import pos from '../../../assets/pos.svg'
import stock from '../../../assets/stock.svg'
import { AddStockView } from '../AddStock'
import { Products } from '../Products'
import './Dashboard.css'
import { PosView } from './PosView'

type DashboardView = 'pos' | 'all-stock' | 'add-stock'

type MenuItem = {
  id: DashboardView
  label: string
  icon: string
}

const menuItems: MenuItem[] = [
  { id: 'pos', label: 'POS', icon: pos },
  { id: 'all-stock', label: 'All Stock', icon: stock },
  { id: 'add-stock', label: 'Add Stock', icon: addStock },
]

interface DashboardProps {
  user: AuthToken
  onLogout: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<DashboardView>('pos')
  const [syncRequestId, setSyncRequestId] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState('')

  const handleMenuClick = useCallback((view: DashboardView) => {
    setActiveView(view)
  }, [])

  const handleSyncClick = useCallback(() => {
    if (activeView !== 'all-stock') {
      return
    }
    setSyncRequestId((prev) => prev + 1)
  }, [activeView])

  const handleSyncStatusChange = useCallback((status: { isSyncing: boolean; lastSync: string }) => {
    setIsSyncing(status.isSyncing)
    setLastSync(status.lastSync ?? '')
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await window.electron.logout()
      onLogout()
    } catch (error) {
      console.error('logout failed:', error)
      alert('unable to logout. please try again.')
    }
  }, [onLogout])

  const renderContent = () => {
    switch (activeView) {
      case 'pos':
        return <PosView />
      case 'add-stock':
        return <AddStockView />
      case 'all-stock':
        return (
          <Products
            user={user}
            syncRequestId={syncRequestId}
            onSyncStatusChange={handleSyncStatusChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeView === item.id ? 'is-active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
              aria-label={item.label}
            >
              <img className="sidebar-icon" src={item.icon} alt="" />
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => {
            const confirmLogout = window.confirm('Are you sure you want to logout?')
            if (confirmLogout) {
              handleLogout()
            }
          }}
          aria-label="Logout"
        >
          <img className="sidebar-icon" src={logout} alt="" />
          <span>Log-out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  )
}
