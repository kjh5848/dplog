"use client";

import React from "react";
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { User } from "@/src/types/user";

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAction: (action: string) => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  isOpen,
  onClose,
  user,
  onAction,
}) => {
  const handleAction = (action: string) => {
    onAction(action);
    onClose();
  };

  const getActionButtons = () => {
    const buttons = [
      {
        key: "membership",
        label: "멤버십관리",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      },
      {
        key: "userInfo",
        label: "회원변경",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
      {
        key: "adminChange",
        label: "관리자변경",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
        color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      },
    ];

    // 상태별 액션 버튼 추가
    if (user.status === "WAITING") {
      buttons.unshift({
        key: "approve",
        label: "승인",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: "bg-green-50 text-green-700 hover:bg-green-100",
      });
    } else if (user.status === "COMPLETION") {
      buttons.unshift(
        {
          key: "stop",
          label: "정지",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "bg-orange-50 text-orange-700 hover:bg-orange-100",
        },
        {
          key: "withdraw",
          label: "탈퇴",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          ),
          color: "bg-red-50 text-red-700 hover:bg-red-100",
        }
      );
    } else if (user.status === "STOP" || user.status === "WITHDRAW") {
      buttons.unshift({
        key: "restore",
        label: "복구",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        color: "bg-green-50 text-green-700 hover:bg-green-100",
      });
    }

    return buttons;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${user.username} 관리`}
      size="sm"
    >
      <div className="space-y-4">
        {/* 사용자 정보 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>아이디:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span>업체명:</span>
              <span className="font-medium">{user.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span>상태:</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                user.status === "COMPLETION" ? "bg-green-100 text-green-800" :
                user.status === "WAITING" ? "bg-yellow-100 text-yellow-800" :
                user.status === "STOP" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {user.status === "COMPLETION" ? "승인" :
                 user.status === "WAITING" ? "대기" :
                 user.status === "STOP" ? "정지" :
                 user.status === "WITHDRAW" ? "탈퇴" : user.status}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">관리 작업 선택</h4>
          <div className="grid grid-cols-1 gap-2">
            {getActionButtons().map((button) => (
              <button
                key={button.key}
                onClick={() => handleAction(button.key)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${button.color}`}
              >
                {button.icon}
                <span className="font-medium">{button.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 취소 버튼 */}
        <div className="pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserActionModal; 