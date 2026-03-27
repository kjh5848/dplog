"use client";

import React from "react";
import { User } from "@/src/types/user";

interface UserCardProps {
  user: User;
  onUserClick: (user: User) => void;
  getUserStatusText: (status: string) => string;
  getUserStatusColor: (status: string) => string;
  formatDateTime: (dateTime: string | null) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onUserClick,
  getUserStatusText,
  getUserStatusColor,
  formatDateTime,
}) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onUserClick(user)}
    >
      {/* 헤더 - 아이디와 상태 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-gray-900">
            {user.username}
          </div>
          <span className="text-xs text-gray-500">
            ID: {user.userId}
          </span>
        </div>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getUserStatusColor(user.status)}`}>
          {getUserStatusText(user.status)}
        </span>
      </div>

      {/* 업체 정보 */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">
          {user.companyName}
        </div>
        <div className="text-xs text-gray-500">
          판매점 ID: {user.distributorId}
        </div>
      </div>

      {/* 연락처와 최근 로그인 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{user.tel || "-"}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate max-w-24">
            {formatDateTime(user.lastLoginDate)}
          </span>
        </div>
      </div>

      {/* 터치 안내 */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-blue-600 text-center">
          터치하여 관리 메뉴 열기
        </div>
      </div>
    </div>
  );
};

export default UserCard; 