import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Start', emoji: '🏠', path: '/' },
  { id: 'meals', label: 'Planer', emoji: '📅', path: '/meals' },
  { id: 'recipes', label: 'Rezepte', emoji: '🍳', path: '/recipes' },
  { id: 'shopping', label: 'Einkauf', emoji: '🛒', path: '/shopping' },
];

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeId, setActiveId] = useState(
    NAV_ITEMS.find((item) => item.path === location.pathname)?.id || 'dashboard'
  );

  const handleNavClick = (item) => {
    setActiveId(item.id);
    navigate(item.path);
  };

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeId === item.id ? styles.active : ''}`}
            onClick={() => handleNavClick(item)}
            aria-current={activeId === item.id ? 'page' : undefined}
          >
            <div className={styles.navIcon}>{item.emoji}</div>
            <div className={styles.navLabel}>{item.label}</div>
            {activeId === item.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${activeId === item.id ? styles.active : ''}`}
            onClick={() => handleNavClick(item)}
            title={item.label}
            aria-current={activeId === item.id ? 'page' : undefined}
          >
            <div className={styles.sidebarIcon}>{item.emoji}</div>
          </button>
        ))}
      </aside>
    </>
  );
}
