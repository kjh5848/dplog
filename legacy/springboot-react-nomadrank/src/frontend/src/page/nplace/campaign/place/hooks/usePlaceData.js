import { useState } from 'react';
import { useAuthStore } from "/src/store/StoreProvider.jsx";

export const usePlaceData = (type) => {
  const { loginUser } = useAuthStore();
  const [placeList, setPlaceList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlaceList = async () => {
    if (!loginUser) return;
    
    const response = await fetch(`/v1/nplace/reward/place/shop/${type}`, {
      method: "GET"
    });
    const dto = await response.json();
    
    if (dto.code === 0) {
      setPlaceList(dto.data.nplaceRewardShopList);
    }
  };

  const fetchNotification = async () => {
    const response = await fetch(`/v1/nplace/reward/place/notification`);
    const dto = await response.json();
    
    if (dto.code === 0) {
      setNotification(dto.data.nplaceRewardNotificationList);
    }
  };

  const handlePlaceRegister = async (placeData) => {
    const response = await fetch(`/v1/nplace/reward/place/shop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(placeData)
    });
    
    const dto = await response.json();
    if (dto.code === 0) {
      await fetchPlaceList();
      return true;
    }
    return false;
  };

  return {
    placeList,
    notification,
    isModalOpen,
    handleModalOpen: () => setIsModalOpen(true),
    handleModalClose: () => setIsModalOpen(false),
    handlePlaceRegister,
    fetchData: () => {
      fetchPlaceList();
      fetchNotification();
    }
  };
};