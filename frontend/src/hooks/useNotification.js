import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showSuccess = (message) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 3000);
  };

  const showError = (message) => {
    setNotification({ type: 'error', message });
    setTimeout(() => setNotification(null), 5000);
  };

  const showInfo = (message) => {
    setNotification({ type: 'info', message });
    setTimeout(() => setNotification(null), 3000);
  };

  return { notification, showSuccess, showError, showInfo };
};
