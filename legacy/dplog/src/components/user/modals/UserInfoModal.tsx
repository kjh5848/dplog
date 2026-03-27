"use client";

import React, { useState } from "react";
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { User } from "@/src/types/user";
import { useUserListViewModel } from "@/src/viewModel/user/useUserListViewModel";
import { logError } from '@/src/utils/logger';
import { toast } from 'react-hot-toast';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const { updateUser, isUpdatingUser } = useUserListViewModel();
  const [formData, setFormData] = useState({
    username: user.username || "",
    companyName: user.companyName || "",
    tel: user.tel || "",
    email: user.email || "",
    status: user.status || "WAITING",
  });

  const statusOptions = [
    { value: "COMPLETION", label: "승인", color: "bg-green-100 text-green-800" },
    { value: "STOP", label: "정지", color: "bg-red-100 text-red-800" },
    { value: "WAITING", label: "대기", color: "bg-yellow-100 text-yellow-800" },
    { value: "WITHDRAW", label: "탈퇴", color: "bg-gray-100 text-gray-800" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("사용자 ID를 입력해주세요.");
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error("업체명을 입력해주세요.");
      return;
    }

    try {
      await updateUser({
        userId: user.userId,
        username: formData.username,
        companyName: formData.companyName,
        tel: formData.tel,
        status: formData.status,
      });

      toast.success("사용자 정보가 성공적으로 수정되었습니다.");
      onUpdate();
      onClose();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("사용자 정보 수정 중 오류 발생", errorObj, { userId: user.userId, operation: 'updateUser' });
      toast.error("사용자 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const hasChanges = () => {
    return (
      formData.username !== user.username ||
      formData.companyName !== user.companyName ||
      formData.tel !== (user.tel || "") ||
      formData.email !== (user.email || "") ||
      formData.status !== user.status
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`회원 정보 수정 - ${user.username}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-4">기본 정보</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 ID *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="사용자 ID를 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업체명 *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="업체명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="전화번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 상태 정보 */}
        <div className="rounded-lg border p-4">
          <h4 className="font-semibold text-gray-900 mb-4">상태 관리</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 상태
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">현재 상태:</span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  statusOptions.find(opt => opt.value === user.status)?.color || "bg-gray-100 text-gray-800"
                }`}
              >
                {statusOptions.find(opt => opt.value === user.status)?.label || user.status}
              </span>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-4">추가 정보</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">사용자 ID (시스템):</span>
              <span className="font-medium">{user.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">판매점 ID:</span>
              <span className="font-medium">{user.distributorId || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">최근 로그인:</span>
              <span className="font-medium">
                {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString('ko-KR') : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">가입일:</span>
              <span className="font-medium">
                {user.createdDate ? new Date(user.createdDate).toLocaleString('ko-KR') : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* 변경 사항 알림 */}
        {hasChanges() && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  변경사항이 있습니다
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  수정된 정보를 저장하려면 저장 버튼을 클릭하세요.
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
            disabled={isUpdatingUser || !hasChanges()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingUser ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default UserInfoModal; 