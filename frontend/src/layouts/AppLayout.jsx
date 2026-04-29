import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.container}>
      <Header />
      <Navigation />

      <main className={styles.content}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
