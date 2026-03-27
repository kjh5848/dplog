"use client";

import React, { useState, useEffect, useCallback } from "react";
import { logError } from '@/src/utils/logger';
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { User } from "@/src/types/user";
import { Distributor } from "@/src/types/distributor";
import { useUserListViewModel } from "@/src/viewModel/user/useUserListViewModel";
import { useDistributorViewModel } from "@/src/viewModel/distributor/useDistributorViewModel";
import { toast } from 'react-hot-toast';

interface AdminChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

const AdminChangeModal: React.FC<AdminChangeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const { updateDistributor, isUpdatingDistributor } = useUserListViewModel();
  const { getDistributorList, isGettingDistributorList } = useDistributorViewModel();
  const [distributorList, setDistributorList] = useState<Distributor[]>([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState<number>(user.distributorId || 0);
  
  const fetchDistributorList = useCallback(async () => {
    try {
      const result = await getDistributorList();
      if (result?.data?.distributorList) {
        setDistributorList(result.data.distributorList);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("관리자 목록 조회 실패", errorObj, { operation: 'fetchDistributorList' });
      toast.error("관리자 목록을 불러오는데 실패했습니다.");
    }
  }, [getDistributorList]);
  
  useEffect(() => {
    if (isOpen) {
      fetchDistributorList();
    }
  }, [isOpen, fetchDistributorList]);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedDistributorId(user.distributorId || 0);
    }
  }, [isOpen, user]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDistributorId) {
      toast.error("관리자를 선택해주세요.");
      return;
    }

    if (selectedDistributorId === user.distributorId) {
      toast.error("현재와 동일한 관리자입니다.");
      return;
    }

    const selectedDistributor = distributorList.find(d => d.distributorId === selectedDistributorId);
    if (
      confirm(
        `${user.username}님의 관리자를 "${selectedDistributor?.username}"로 변경하시겠습니까?`
      )
    ) {
      try {
        await updateDistributor({ 
          userId: user.userId, 
          distributorId: selectedDistributorId 
        });
        toast.success("관리자가 성공적으로 변경되었습니다.");
        onUpdate();
        onClose();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError("관리자 변경 중 오류 발생", errorObj, { userId: user.userId, operation: 'updateDistributor' });
        toast.error("관리자 변경에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const currentDistributor = distributorList.find(d => d.distributorId === user.distributorId);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`관리자 변경 - ${user.username}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 현재 관리자 정보 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-2">현재 관리자 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>사용자 ID:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span>업체명:</span>
              <span className="font-medium">{user.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span>현재 관리자:</span>
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                {currentDistributor?.username || `ID: ${user.distributorId}`}
              </span>
            </div>
          </div>
        </div>

        {/* 관리자 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            새로운 관리자 선택
          </label>
          
          {isGettingDistributorList ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">관리자 목록을 불러오는 중...</span>
            </div>
          ) : (
            <select
              value={selectedDistributorId}
              onChange={(e) => setSelectedDistributorId(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">관리자를 선택하세요</option>
              {distributorList.map((distributor) => (
                <option key={distributor.distributorId} value={distributor.distributorId}>
                  {distributor.username} (ID: {distributor.distributorId})
                </option>
              ))}
            </select>
          )}
          
          {distributorList.length === 0 && !isGettingDistributorList && (
            <p className="mt-2 text-sm text-red-600">
              사용 가능한 관리자가 없습니다.
            </p>
          )}
        </div>

        {/* 변경 예정 정보 */}
        {selectedDistributorId && selectedDistributorId !== user.distributorId && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  관리자 변경 예정
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {currentDistributor?.username || `ID: ${user.distributorId}`} → {distributorList.find(d => d.distributorId === selectedDistributorId)?.username}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isUpdatingDistributor || !selectedDistributorId || selectedDistributorId === user.distributorId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingDistributor ? "변경 중..." : "변경하기"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AdminChangeModal; 

function userCallback(arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}
