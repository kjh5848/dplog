import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);


  const fetchNotification = async () => {
    const response = await fetch(`/v1/nplace/reward/place/notification`);
    const dto = await response.json();
    
    if (dto.code === 0) {
      setNotification(dto.data.nplaceRewardNotificationList);
    }
  };

  return {
    notification,
    fetchNotification: () => {
      fetchNotification();
    }
  };
};