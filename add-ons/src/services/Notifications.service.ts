import { useState, useRef, useEffect } from 'react';
import createContainer from 'constate';

import { Notification } from '../types';
import { NOTIFICATION_SHOW_TIME } from '../constants';

const useNotifications = () => {
  const [notification, setNotification] = useState<Notification>(
    {} as Notification,
  );
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [timer] = useState<number>(0);
  const timerRef = useRef(timer);

  useEffect(() => {
    if (!notification) {
      return;
    }
    if (!Object.keys(notification).length) {
      return;
    }

    setShowNotification(true);
    timerRef.current = setTimeout(
      () => setShowNotification(false),
      NOTIFICATION_SHOW_TIME,
    );
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [notification]);

  const hideNotification = () => {
    setShowNotification(false);
    clearTimeout(timerRef.current);
  };

  const successNotification = (
    title: string,
    content: string | React.ReactNode,
  ) => {
    setNotification({
      title,
      content,
      color: '#359c46',
      icon: 'accept',
    });
  };

  const errorNotification = (
    title: string,
    content: string | React.ReactNode,
  ) => {
    setNotification({
      title,
      content,
      color: '#359c46',
      icon: 'accept',
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    successNotification,
    errorNotification,
  };
};

const { Provider, Context } = createContainer(useNotifications);
export { Provider as NotificationsProvider, Context as NotificationsService };
