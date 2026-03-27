"use client";

import React, { useState } from "react";
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { UserCreateRequest } from "@/src/types/user";
import { useUserListViewModel } from "@/src/viewModel/user/useUserListViewModel";
import { logError } from '@/src/utils/logger';
import { toast } from 'react-hot-toast';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserAddModal: React.FC<UserAddModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { createUser, isCreatingUser } = useUserListViewModel();
  
  const [formData, setFormData] = useState<UserCreateRequest>({
    userName: "",
    password: "",
    companyName: "",
    companyNumber: "",
    tel: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      password: "",
      companyName: "",
      companyNumber: "",
      tel: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.userName.trim()) {
      toast.error("아이디를 입력해주세요.");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error("업체명을 입력해주세요.");
      return;
    }

    if (!formData.companyNumber.trim()) {
      toast.error("사업자등록번호를 입력해주세요.");
      return;
    }

    if (!formData.tel.trim()) {
      toast.error("연락처를 입력해주세요.");
      return;
    }

    try {
      await createUser(formData);
      toast.success("등록되었습니다.");
      resetForm();
      onUpdate();
      onClose();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("사용자 등록 중 오류 발생", errorObj, { operation: 'createUser' });
      toast.error("등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="유저 등록"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디 *
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
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
              사업자등록번호 *
            </label>
            <input
              type="text"
              name="companyNumber"
              value={formData.companyNumber}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="사업자등록번호를 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 *
            </label>
            <input
              type="tel"
              name="tel"
              value={formData.tel}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="연락처를 입력하세요"
              required
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                등록 안내
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>등록된 사용자는 대기 상태로 생성됩니다.</li>
                  <li>관리자의 승인 후 사용 가능합니다.</li>
                  <li>모든 필수 항목을 입력해주세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreatingUser}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingUser ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default UserAddModal; 