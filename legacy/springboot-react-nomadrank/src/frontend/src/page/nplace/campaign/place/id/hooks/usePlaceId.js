import { useState, useEffect } from 'react';
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useNavigate } from 'react-router-dom';

export const usePlaceId = ({id, type}) => {
  const navigate = useNavigate();
  const [placeData, setPlaceData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const [isLoading, setIsLoading] = useState(true);

  const [fetchPlaceData] = usePendingFunction(async () => {
    const response = await fetch(`/v1/nplace/reward/place/shop/${id}`);
    const dto = await response.json();
    
    if (dto.code !== 0) {
      alert(dto.message);
      return false;
    }

    setPlaceData(dto.data);
    if (dto.data.nplaceRewardShop.nplaceRewardShopKeywordList.length > 0) {
      setSelectedKeywordIndex(0);
    }
    setIsLoading(false);
    return true;
  });

  const [fetchPriceData] = usePendingFunction(async () => {
    const response = await fetch(`/v1/nplace/reward/place/${type}`);
    const dto = await response.json();
    
    if (dto.code !== 0) {
      alert(dto.message);
      return false;
    }
    setPriceData(dto.data);
    return true;
  });

  useEffect(() => {
    fetchPlaceData();
    fetchPriceData();
  }, [id]);

  const handleKeywordSelect = (index) => {
    setSelectedKeywordIndex(index);
  };

  const handleKeywordDelete = async (keywordId, keyword, index) => {
    const confirmMessage = 
      `키워드를 삭제하시려면 해당 키워드(${keyword})를 입력해주세요.\n` +
      `삭제 후 다시 등록할 경우 과거 데이터는 복구되지 않습니다.`;
    
    if (prompt(confirmMessage) !== keyword) return;

    const response = await fetch(`/v1/nplace/reward/keyword/${keywordId}`, {
      method: "DELETE"
    });
    const dto = await response.json();

    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }

    if (selectedKeywordIndex === index) {
      setSelectedKeywordIndex(null);
    }
    fetchPlaceData();
    alert(`${keyword} 키워드를 삭제했습니다.`);
  };

  const handlePlaceDelete = async () => {
    // 삭제 로직 구현
    if (!confirm(`정말로 플레이스를 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 데이터는 복구되지 않습니다.`)) {
      return;
    }
    const dto = await fetch(`/v1/nplace/reward/shop/${id}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("플레이스를 삭제했습니다.");
    navigate(`/nplace/reward/place/${type}`, { replace: true });
  };

  const handleRegister = async (registerData) => {
    // 등록 로직 구현
    const dto = await fetch(`/v1/nplace/reward/place/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("유저 유입을 신청했습니다.");
    fetchPlaceData();
  };

  return {
    placeData,
    priceData,
    selectedKeywordIndex,
    isLoading,
    modalState,
    setModalState,
    handleKeywordSelect,
    handleKeywordDelete,
    handlePlaceDelete,
    handleRegister
  };
};