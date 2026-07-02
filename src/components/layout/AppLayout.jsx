import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import SiblingsPanel from '../ui/SiblingsPanel';
import BottomBar from '../ui/BottomBar';
import MusicPlayer from '../ui/MusicPlayer';
import JavaChan from '../character/JavaChan';
import AnimatedBg from './AnimatedBg';
import { useProgress } from '../../hooks/useProgress';
import { getShopItem } from '../../data/shopItems';
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
  const [siblingsOpen, setSiblingsOpen] = useState(false);
  const { equippedWallpaper } = useProgress();
  const wallpaper = getShopItem(equippedWallpaper);
  const themeClass = wallpaper?.themeClass || '';

  // Shop wallpapers are CSS gradients until real art is added —
  // see src/data/shopItems.js for how to swap in imageSrc later.
  const wallpaperStyle = wallpaper?.imageSrc
    ? { backgroundImage: `url(${wallpaper.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className={`app-layout ${themeClass}`}>
      <AnimatedBg />
      {/* Sidebar overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sisters overlay */}
      <SiblingsPanel isOpen={siblingsOpen} onClose={() => setSiblingsOpen(false)} />

      {/* Overlay backdrop */}
      {(sidebarOpen || siblingsOpen) && (
        <div
          className="sidebar-backdrop"
          onClick={() => {
            setSidebarOpen(false);
            setSiblingsOpen(false);
          }}
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

        <div className="topbar-actions">
          <MusicPlayer />
          <button
            className="siblings-open-btn"
            onClick={() => setSiblingsOpen(true)}
            aria-label="Meet my sisters"
            title="Meet my sisters"
          >
            👯‍♀️
          </button>
        </div>
      </header>

      {/* Main content — React Router renders pages here */}
      <main className="main-content" style={wallpaperStyle}>
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