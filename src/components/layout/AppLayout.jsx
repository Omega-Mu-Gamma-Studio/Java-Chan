import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import BottomBar from '../ui/BottomBar';
import JavaChan from '../character/JavaChan';
import './AppLayout.css';

/**
 * AppLayout.jsx
 * 
 * The master shell. Always visible on every page.
 * Structure:
 *   - Sidebar (overlay, controlled by hamburger)
 *   - TopBar (hamburger + app title)
 *   - Main content area (rendered by React Router via <Outlet>)
 *   - BottomBar (XP, progress)
 *   - JavaChan (bottom-right, always present)
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top bar */}
      <header className="topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open lesson menu"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="topbar-title">
          <span className="topbar-title-main">Java</span>
          <span className="topbar-title-accent">chan</span>
        </span>
      </header>

      {/* Main content — React Router renders pages here */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom bar */}
      <BottomBar />

      {/* Java-chan character — always visible */}
      <JavaChan />
    </div>
  );
};

export default AppLayout;
