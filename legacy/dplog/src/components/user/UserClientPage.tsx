"use client";

import React, { useState, useEffect } from "react";
import { useUserListViewModel } from "@/src/viewModel/user/useUserListViewModel";
import { logInfo, logError } from '@/src/utils/logger';
import { User } from "@/src/types/user";
import { useAuthGuard, useAuthStatus } from "@/src/utils/auth";
import { loadingUtils } from "@/src/utils/loading";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import { useRouter } from "next/navigation";
import AdminChangeModal from "./modals/AdminChangeModal";
import MembershipModal from "./modals/MembershipModal";
import UserInfoModal from "./modals/UserInfoModal";
import UserAddModal from "./modals/UserAddModal";
import UserActionModal from "./modals/UserActionModal";
import { useIsMobile } from "@/src/hooks/useMediaQuery";
import UserCard from "./UserCard";
import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";

export default function UserClientPage() {
  const router = useRouter();
  const { loginUser } = useAuthStatus();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const isMobile = useIsMobile();

  // 모달 상태 관리
  const [adminChangeModal, setAdminChangeModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [membershipModal, setMembershipModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [userInfoModal, setUserInfoModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [userAddModal, setUserAddModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });
  const [userActionModal, setUserActionModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  const {
    userList,
    error,
    refetch,
    completeUser,
    isCompletingUser,
    withdrawUser,
    isWithdrawingUser,
    updateUser,
    isUpdatingUser,
    formatDateTime,
    getUserStats,
    getUserStatusText,
    getUserStatusColor,
    getMembershipStatusText,
    getPaginatedUsers,
    getTotalPages,
  } = useUserListViewModel();

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 게스트 사용자 처리
  useEffect(() => {
    if (mounted && isGuest && !isLogoutPending) {
      router.push('/login');
    }
  }, [mounted, isGuest, isLogoutPending, router]);

  // 인증 상태 확인
  // const authResult = checkAuth(); // 제거
  
  // 권한 체크 - ADMIN만 접근 가능 (loginUser가 확정된 후에만 실행)
  useEffect(() => {
    if (mounted && loginUser !== undefined && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      logInfo('[UserClientPage] 권한 체크', { loginUser, authority: loginUser?.authority });
      
      if (!loginUser) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      
      const hasAdminAuth = loginUser.authority?.includes('ADMIN');
      if (!hasAdminAuth) {
        toast.error('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }

      // 권한 체크 완료 후 사용자 목록 강제 새로고침
      logInfo('[UserClientPage] 권한 체크 완료 - 사용자 목록 새로고침');
      refetch();
    }
  }, [mounted, loginUser, hasCheckedAuth, router, refetch]);

  const stats = getUserStats();

  // 모달 핸들러들
  const openAdminChangeModal = (user: User) => {
    setAdminChangeModal({ isOpen: true, user });
  };

  const closeAdminChangeModal = () => {
    setAdminChangeModal({ isOpen: false, user: null });
  };

  const openMembershipModal = (user: User) => {
    setMembershipModal({ isOpen: true, user });
  };

  const closeMembershipModal = () => {
    setMembershipModal({ isOpen: false, user: null });
  };

  const openUserInfoModal = (user: User) => {
    setUserInfoModal({ isOpen: true, user });
  };

  const closeUserInfoModal = () => {
    setUserInfoModal({ isOpen: false, user: null });
  };

  const openUserAddModal = () => {
    setUserAddModal({ isOpen: true });
  };

  const closeUserAddModal = () => {
    setUserAddModal({ isOpen: false });
  };

  const openUserActionModal = (user: User) => {
    setUserActionModal({ isOpen: true, user });
  };

  const closeUserActionModal = () => {
    setUserActionModal({ isOpen: false, user: null });
  };

  const handleModalUpdate = () => {
    refetch();
  };

  // 사용자 상세 정보 토글
  const toggleUserDetails = (userId: number) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 모의 상태 변경 히스토리 생성 (실제로는 백엔드에서 가져와야 함)
  const getUserStatusHistory = (user: User) => {
    // 실제 구현시에는 백엔드 API에서 상태 변경 로그를 가져와야 합니다
    const mockHistory = [
      {
        date: user.createdDate || new Date().toISOString(),
        status: "WAITING",
        statusText: "대기",
        reason: "신규 회원 가입",
        admin: "시스템",
      },
    ];

    if (user.status !== "WAITING") {
      mockHistory.push({
        date: user.lastLoginDate || new Date().toISOString(),
        status: user.status,
        statusText: getUserStatusText(user.status),
        reason: user.status === "COMPLETION" ? "관리자 승인" : 
                user.status === "STOP" ? "정지 처리" : 
                user.status === "WITHDRAW" ? "탈퇴 처리" : "상태 변경",
        admin: "관리자",
      });
    }

    return mockHistory.reverse(); // 최신순으로 정렬
  };

  // 2. 권한 체크 (ADMIN만 접근)
  if (!mounted || loginUser === undefined || !hasCheckedAuth) {
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (!loginUser) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  if (!loginUser.authority?.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600">권한이 없습니다.</div>
          <p className="text-gray-600 mt-2">관리자 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  // 검색 및 필터링
  const filteredUsers = userList.filter((user) => {
    const matchesSearch = 
      user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.tel && user.tel.includes(searchTerm));
    
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 페이지네이션 계산
  const totalPages = getTotalPages(filteredUsers.length, itemsPerPage);
  const paginatedUsers = getPaginatedUsers(filteredUsers, currentPage, itemsPerPage);

  // 페이지 변경 시 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 모바일에서 맨 위로 스크롤
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 페이지당 아이템 수 변경 시 처리
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  // 필터 변경 시 첫 페이지로 리셋
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  // 사용자 선택/해제
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.userId));
    }
  };

  // 사용자 승인 처리
  const handleCompleteUser = async (userId: number) => {
    const selectedUser = userList.find(user => user.userId === userId);
    if (!selectedUser) {
      toast.error("사용자를 찾을 수 없습니다.");
      return;
    }

    try {
      await completeUser({ user: selectedUser });
      toast.success("사용자가 승인되었습니다.");
    } catch (error) {
      toast.error("사용자 승인 중 오류가 발생했습니다.");
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('사용자 승인 실패', errorObj, { userId });
    }
  };

  // 사용자 정지 처리
  const handleStopUser = async (userId: number) => {
    const selectedUser = userList.find(user => user.userId === userId);
    if (!selectedUser) {
      toast.error("사용자를 찾을 수 없습니다.");
      return;
    }

    if (confirm("정말로 이 사용자를 정지하시겠습니까?")) {
      try {
        await withdrawUser({ user: selectedUser });
        toast.success("사용자가 정지되었습니다.");
      } catch (error) {
        toast.error("사용자 정지 중 오류가 발생했습니다.");
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('사용자 정지 실패', errorObj, { userId });
      }
    }
  };

  // 사용자 탈퇴 처리
  const handleWithdrawUser = async (userId: number) => {
    const selectedUser = userList.find(user => user.userId === userId);
    if (!selectedUser) {
      toast.error("사용자를 찾을 수 없습니다.");
      return;
    }

    if (confirm("정말로 이 사용자를 탈퇴 처리하시겠습니까?")) {
      try {
        await withdrawUser({ user: selectedUser });
        toast.success("사용자가 탈퇴 처리되었습니다.");
      } catch (error) {
        toast.error("사용자 탈퇴 처리 중 오류가 발생했습니다.");
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('사용자 탈퇴 처리 실패', errorObj, { userId });
      }
    }
  };

  // 액션 메뉴에서 액션 선택 시 처리
  const handleUserAction = (action: string, user: User) => {
    switch (action) {
      case "membership":
        openMembershipModal(user);
        break;
      case "userInfo":
        openUserInfoModal(user);
        break;
      case "adminChange":
        openAdminChangeModal(user);
        break;
      case "approve":
        handleCompleteUser(user.userId);
        break;
      case "stop":
        handleStopUser(user.userId);
        break;
      case "withdraw":
        handleWithdrawUser(user.userId);
        break;
      case "restore":
        handleCompleteUser(user.userId);
        break;
    }
  };

  // 모바일에서 아이디 클릭 핸들러
  const handleUserIdClick = (user: User) => {
    if (isMobile) {
      openUserActionModal(user);
    }
  };

  // 1. 인증/로딩/게스트 처리
  if (isLoading) {
    if (isLogoutPending) {
      return <LoadingFallback config={loadingUtils.logoutAuth()} />;
    }
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (isGuest) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">사용자 목록을 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/* 페이지 헤더 */}
        <div>
          <DplogHeader title="N-PLACE" message="회원 관리" />
        </div>
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600">
            시스템에 등록된 사용자들을 관리할 수 있습니다.
          </p>
        </div>

        {/* 상태별 필터링 버튼 */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 빠른 필터</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusFilterChange("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              전체 ({stats.total})
            </button>
            <button
              onClick={() => handleStatusFilterChange("COMPLETION")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "COMPLETION"
                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              승인 완료 ({stats.completion})
            </button>
            <button
              onClick={() => handleStatusFilterChange("WAITING")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "WAITING"
                  ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              대기 중 ({stats.waiting})
            </button>
            <button
              onClick={() => handleStatusFilterChange("STOP")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "STOP"
                  ? "bg-red-100 text-red-700 border-2 border-red-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              정지됨 ({stats.stop})
            </button>
            <button
              onClick={() => handleStatusFilterChange("WITHDRAW")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "WITHDRAW"
                  ? "bg-gray-100 text-gray-700 border-2 border-gray-400"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              탈퇴 ({stats.withdraw})
            </button>
          </div>
        </div>

        {/* 회원 상태 요약 로그 */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">회원 상태 현황</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">승인 회원</p>
                  <p className="text-2xl font-bold text-green-700">{stats.completion}</p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">정상적으로 서비스를 이용 중인 회원</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-900">대기 회원</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.waiting}</p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">승인 대기 중인 신규 회원</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">정지 회원</p>
                  <p className="text-2xl font-bold text-red-700">{stats.stop}</p>
                </div>
                <div className="text-red-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-red-600 mt-2">일시적으로 정지된 회원</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">탈퇴 회원</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.withdraw}</p>
                </div>
                <div className="text-gray-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">탈퇴 처리된 회원</p>
            </div>
          </div>

          {/* 상태 변경 요약 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">상태별 관리 안내</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>대기 → 승인: 신규 회원 승인 처리</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>승인 → 정지: 임시 서비스 중단</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span>승인 → 탈퇴: 완전 탈퇴 처리</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>정지/탈퇴 → 복구: 서비스 재개</span>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="회사명, 사용자명, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">전체 상태</option>
                <option value="COMPLETION">승인</option>
                <option value="STOP">정지</option>
                <option value="WAITING">대기</option>
                <option value="WITHDRAW">탈퇴</option>
              </select>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                새로고침
              </button>
              <button
                onClick={openUserAddModal}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                유저 등록
              </button>
            </div>
          </div>
        </div>

        {/* 사용자 테이블/카드 뷰 */}
        {isMobile ? (
          /* 모바일 카드 뷰 */
          <div className="space-y-4">
            {paginatedUsers.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                onUserClick={openUserActionModal}
                getUserStatusText={getUserStatusText}
                getUserStatusColor={getUserStatusColor}
                formatDateTime={formatDateTime}
              />
            ))}
            
            {paginatedUsers.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4m-12 0h4m8 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  사용자가 없습니다
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  검색 조건을 변경해보세요.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* 데스크톱 테이블 뷰 */
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === paginatedUsers.length &&
                          paginatedUsers.length > 0
                        }
                        onChange={toggleAllSelection}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      아이디
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      업체명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      최근 로그인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedUsers.map((user) => (
                    <React.Fragment key={user.userId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.userId)}
                            onChange={() => toggleUserSelection(user.userId)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm font-medium text-gray-900"
                          >
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            판매점 ID: {user.distributorId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.tel || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getUserStatusColor(user.status)}`}
                          >
                            {getUserStatusText(user.status)}
                          </span>
                          <button
                            onClick={() => toggleUserDetails(user.userId)}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {expandedUsers.includes(user.userId) ? "히스토리 숨기기" : "히스토리 보기"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatDateTime(user.lastLoginDate)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          {/* 데스크톱에서는 관리 버튼들 표시 */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* 멤버십 관리 버튼 */}
                            <button
                              onClick={() => openMembershipModal(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 hover:border-indigo-300 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              멤버십관리
                            </button>

                            {/* 사용자 상태별 관리 버튼 */}
                            {user.status === "WAITING" && (
                              <button
                                onClick={() => handleCompleteUser(user.userId)}
                                disabled={isCompletingUser}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {isCompletingUser ? "승인중..." : "승인"}
                              </button>
                            )}

                            {user.status === "COMPLETION" && (
                              <>
                                <button
                                  onClick={() => handleStopUser(user.userId)}
                                  disabled={isWithdrawingUser}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {isWithdrawingUser ? "정지중..." : "정지"}
                                </button>
                                <button
                                  onClick={() => handleWithdrawUser(user.userId)}
                                  disabled={isWithdrawingUser}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                  </svg>
                                  {isWithdrawingUser ? "탈퇴중..." : "탈퇴"}
                                </button>
                              </>
                            )}

                            {(user.status === "STOP" || user.status === "WITHDRAW") && (
                              <button
                                onClick={() => handleCompleteUser(user.userId)}
                                disabled={isCompletingUser}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {isCompletingUser ? "복구중..." : "복구"}
                              </button>
                            )}

                            {/* 회원 정보 변경 버튼 */}
                            <button
                              onClick={() => openUserInfoModal(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              회원변경
                            </button>

                            {/* 관리자 변경 버튼 */}
                            <button
                              onClick={() => openAdminChangeModal(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                              관리자변경
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 상태 변경 히스토리 확장 행 */}
                      {expandedUsers.includes(user.userId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="max-w-4xl">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                {user.username}님의 상태 변경 히스토리
                              </h4>
                              <div className="space-y-3">
                                {getUserStatusHistory(user).map((history, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                                    <div className="flex-shrink-0">
                                      <div className={`w-3 h-3 rounded-full ${
                                        history.status === "COMPLETION" ? "bg-green-400" :
                                        history.status === "WAITING" ? "bg-yellow-400" :
                                        history.status === "STOP" ? "bg-red-400" :
                                        history.status === "WITHDRAW" ? "bg-gray-400" : "bg-blue-400"
                                      }`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            history.status === "COMPLETION" ? "bg-green-100 text-green-800" :
                                            history.status === "WAITING" ? "bg-yellow-100 text-yellow-800" :
                                            history.status === "STOP" ? "bg-red-100 text-red-800" :
                                            history.status === "WITHDRAW" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
                                          }`}>
                                            {history.statusText}
                                          </span>
                                          <span className="text-sm text-gray-900">{history.reason}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(history.date).toLocaleString('ko-KR')}
                                        </div>
                                      </div>
                                      <div className="mt-1 text-xs text-gray-600">
                                        처리자: {history.admin}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* 멤버십 정보 */}
                              {user.membershipList && user.membershipList.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h5 className="text-sm font-semibold text-gray-900 mb-2">보유 멤버십</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {user.membershipList.map((membership, idx) => (
                                      <span
                                        key={idx}
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                          membership.membershipState === "ACTIVATE" ? "bg-green-100 text-green-800" :
                                          membership.membershipState === "EXPIRED" ? "bg-red-100 text-red-800" :
                                          membership.membershipState === "STOP" ? "bg-orange-100 text-orange-800" :
                                          "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {membership.name} ({getMembershipStatusText(membership.membershipState)})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 모달들 */}
      {adminChangeModal.user && (
        <AdminChangeModal
          isOpen={adminChangeModal.isOpen}
          onClose={closeAdminChangeModal}
          user={adminChangeModal.user}
          onUpdate={handleModalUpdate}
        />
      )}

      {membershipModal.user && (
        <MembershipModal
          isOpen={membershipModal.isOpen}
          onClose={closeMembershipModal}
          user={membershipModal.user}
          onUpdate={handleModalUpdate}
        />
      )}

      {userInfoModal.user && (
        <UserInfoModal
          isOpen={userInfoModal.isOpen}
          onClose={closeUserInfoModal}
          user={userInfoModal.user}
          onUpdate={handleModalUpdate}
        />
      )}

      {userAddModal.isOpen && (
        <UserAddModal
          isOpen={userAddModal.isOpen}
          onClose={closeUserAddModal}
          onUpdate={handleModalUpdate}
        />
      )}

      {userActionModal.user && (
        <UserActionModal
          isOpen={userActionModal.isOpen}
          onClose={closeUserActionModal}
          user={userActionModal.user}
          onAction={(action) => handleUserAction(action, userActionModal.user!)}
        />
      )}
    </>
  );
};
