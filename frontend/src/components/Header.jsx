import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>🥘</div>
        <div className={styles.title}>
          <span className={styles.family}>Family</span>
          <span className={styles.meal}>Meal</span>
          <span>Planner</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={`${styles.iconBtn} secondary`} aria-label="Search">
          🔍
        </button>
        <button className={`${styles.iconBtn} secondary`} aria-label="Notifications">
          🔔
        </button>
        <button
          className={styles.avatar}
          onClick={logout}
          title="Click to logout"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
