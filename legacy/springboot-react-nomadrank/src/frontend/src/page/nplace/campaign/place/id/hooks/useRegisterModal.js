import { useRef, useState } from 'react';

export const useRegisterModal = ({ placeData, onClose, onSubmit }) => {
  const [isPending, setIsPending] = useState(false);
  
  // Form refs
  const refs = {
    startDate: useRef(),
    endDate: useRef(),
    search: useRef(),
    url: useRef(),
    shopName: useRef(),
    goal: useRef()
  };

  const validateForm = () => {
    const startDateValue = refs.startDate.current.value;
    const endDateValue = refs.endDate.current.value;
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // 시작일 검증
    if (!startDateValue) {
      alert("시작일을 입력해주세요.");
      refs.startDate.current.focus();
      return false;
    }

    const startDate = new Date(`${startDateValue} 00:00:00`);
    
    // 주말 검증
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert("주말은 시작일로 지정할 수 없습니다.");
      refs.startDate.current.focus();
      return false;
    }

    // 시작일 기준 검증
    if (currentHour < 13) {
      if (startDate <= currentDate) {
        alert("시작일자는 오늘일자보다 같거나 이전일 수 없습니다.");
        refs.startDate.current.focus();
        return false;
      }
    }

    // 종료일 검증
    if (!endDateValue) {
      alert("종료일을 입력해주세요.");
      refs.endDate.current.focus();
      return false;
    }

    const endDate = new Date(`${endDateValue} 23:59:59`);

    if (endDate < startDate) {
      alert("종료일은 시작일보다 작을 수 없습니다.");
      refs.endDate.current.focus();
      return false;
    }

    // 작업기간 검증 (5일 이내)
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 5);

    if (endDate > maxEndDate) {
      alert("종료일은 시작일부터 5일 이내여야 합니다.");
      refs.endDate.current.focus();
      return false;
    }

    // 검색어 검증
    if (!refs.search.current.value) {
      alert("검색어를 입력해주세요.");
      refs.search.current.focus();
      return false;
    }

    // URL 검증
    if (!refs.url.current.value) {
      alert("플레이스 URL을 입력해주세요.");
      refs.url.current.focus();
      return false;
    }

    // 업체명 검증
    if (!refs.shopName.current.value) {
      alert("업체명을 입력해주세요.");
      refs.shopName.current.focus();
      return false;
    }

    // 목표 검증
    const goalValue = Number(refs.goal.current.value);
    if (!goalValue) {
      alert("일 유입 목표를 입력해주세요.");
      refs.goal.current.focus();
      return false;
    }

    if (goalValue < 100) {
      alert("일 유입 목표는 최소 100개 이상 입력해주세요.");
      refs.goal.current.focus();
      return false;
    }

    return true;
  };

  const resetForm = () => {
    Object.values(refs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsPending(true);

      const registerData = {
        nplaceRewardShopKeywordRegister: {
          startDate: refs.startDate.current.value,
          endDate: refs.endDate.current.value,
          search: refs.search.current.value,
          url: refs.url.current.value,
          shopName: refs.shopName.current.value,
          goal: Number(refs.goal.current.value),
          shopId: placeData?.nplaceRewardShop.shopId,
          nplaceRewardShopId: placeData?.nplaceRewardShop.id
        }
      };

      await onSubmit(registerData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Register submission error:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  // 초기값 설정 함수
  const setInitialValues = (values) => {
    Object.entries(values).forEach(([key, value]) => {
      if (refs[key]?.current) {
        refs[key].current.value = value;
      }
    });
  };

  // URL과 업체명 자동 설정
  if (placeData && refs.url.current && refs.shopName.current) {
    const shop = placeData.nplaceRewardShop;
    refs.url.current.value = `https://m.place.naver.com/place/${shop.shopId}`;
    refs.shopName.current.value = shop.shopName;
  }

  return {
    refs,
    isPending,
    validateForm,
    handleSubmit,
    resetForm,
    setInitialValues
  };
};