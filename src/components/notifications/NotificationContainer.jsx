import React from 'react';
import { useNotification } from './NotificationContext';
import Notification from './Notification';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
