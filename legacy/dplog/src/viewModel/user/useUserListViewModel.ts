"user Client"

import UserRepository from "@/src/model/UserRepository";
import {
  User,
  UserListResponse,
  UserCompleteDto,
  UserWithdrawDto,
  UserUpdateDto,
  UserUpdateDistributorDto,
  UserAuthorityUpdateDto,
  MembershipListRequestDto,
  SaveUserMembershipDto,
  UserCreateDto,
  UserCreateRequest,
} from "@/src/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api";
import { logInfo, logError, logApiResponse, logUserAction } from "@/src/utils/logger";

export const useUserListViewModel = () => {
  const queryClient = useQueryClient();

  logInfo("사용자 관리 ViewModel 초기화", { component: "useUserListViewModel" });

  // 사용자 목록 조회
  const {
    data: userListResult,
    error,
    isLoading,
    refetch,
  } = useQuery<ApiResponse<UserListResponse>>({
    queryKey: ["userList"],
    queryFn: async () => {
      logInfo("사용자 목록 조회 시작", { operation: "getUserList" });
      const response = await UserRepository.getUserList();
      logApiResponse("사용자 목록 조회", response, { operation: "getUserList" });
      return response;
    },
  });

  // 사용자 등록 - 새로 추가
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useMutation<ApiResponse<any>, Error, UserCreateRequest>({
      mutationFn: async (userData) => {
        const dto: UserCreateDto = {
          user: {
            userName: userData.userName,
            password: userData.password,
            companyName: userData.companyName,
            companyNumber: userData.companyNumber,
            tel: userData.tel,
          }
        };
        return await UserRepository.createUser(dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("사용자 등록 성공 - 목록 새로고침 완료", { operation: "createUser" });
      },
      onError: (error) => {
        logError("사용자 등록 중 오류", error, { operation: "createUser" });
      },
    });

  // 사용자 승인 - 백엔드 API 형태에 맞게 수정
  const { mutateAsync: completeUser, isPending: isCompletingUser } =
    useMutation<ApiResponse<any>, Error, { user: User }>({
      mutationFn: async ({ user }) => {
        const dto: UserCompleteDto = {
          user: {
            userName: user.username
          }
        };
        return await UserRepository.completeUser(dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("사용자 승인 성공 - 목록 새로고침 완료", { operation: "completeUser" });
      },
      onError: (error) => {
        logError("사용자 승인 중 오류", error, { operation: "completeUser" });
      },
    });

  // 사용자 정지/탈퇴 - 백엔드 API 형태에 맞게 수정
  const { mutateAsync: withdrawUser, isPending: isWithdrawingUser } =
    useMutation<ApiResponse<any>, Error, { user: User }>({
      mutationFn: async ({ user }) => {
        const dto: UserWithdrawDto = {
          user: {
            userName: user.username
          }
        };
        return await UserRepository.withdrawUser(dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("사용자 정지/탈퇴 성공 - 목록 새로고침 완료", { operation: "withdrawUser" });
      },
      onError: (error) => {
        logError("사용자 정지/탈퇴 중 오류", error, { operation: "withdrawUser" });
      },
    });

  // 사용자 정보 수정 - 백엔드 DTO 형태에 맞게 수정
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useMutation<ApiResponse<any>, Error, { userId: number; username: string; companyName: string; tel: string; status: string }>({
      mutationFn: async ({ userId, username, companyName, tel, status }) => {
        const dto: UserUpdateDto = {
          user: {
            userId,
            username,
            companyName,
            tel,
            status,
          }
        };
        return await UserRepository.updateUser(dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("사용자 정보 수정 성공 - 목록 새로고침 완료", { operation: "updateUser" });
      },
      onError: (error) => {
        logError("사용자 정보 수정 중 오류", error, { operation: "updateUser" });
      },
    });

  // 사용자 권한 변경
  const { mutateAsync: updateUserAuthority, isPending: isUpdatingAuthority } =
    useMutation<ApiResponse<any>, Error, { userId: number; authority: string }>({
      mutationFn: async ({ userId, authority }) => {
        const dto: UserAuthorityUpdateDto = { authority };
        return await UserRepository.updateUserAuthority(userId, dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("사용자 권한 변경 성공 - 목록 새로고침 완료", { operation: "updateUserAuthority" });
      },
      onError: (error) => {
        logError("사용자 권한 변경 중 오류", error, { operation: "updateUserAuthority" });
      },
    });

  // 사용자 판매점 변경 - 원본 API 형태에 맞춤
  const { mutateAsync: updateDistributor, isPending: isUpdatingDistributor } =
    useMutation<ApiResponse<any>, Error, { userId: number; distributorId: number }>({
      mutationFn: async ({ userId, distributorId }) => {
        const dto: UserUpdateDistributorDto = {
          user: {
            userId,
            distirbutorId: distributorId  // 원본 API의 오타 그대로 유지
          }
        };
        return await UserRepository.updateDistributor(dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        logInfo("판매점 변경 성공 - 목록 새로고침 완료", { operation: "updateDistributor" });
      },
      onError: (error) => {
        logError("판매점 변경 중 오류", error, { operation: "updateDistributor" });
      },
    });

  // 멤버십 목록 조회
  const { mutateAsync: getMembershipList, isPending: isLoadingMembershipList } =
    useMutation<ApiResponse<any>, Error, { userAuthoritySort: string }>({
      mutationFn: async ({ userAuthoritySort }) => {
        const dto: MembershipListRequestDto = { userAuthoritySort };
        return await UserRepository.getMembershipList(dto);
      },
      onError: (error) => {
        logError("멤버십 목록 조회 중 오류", error, { operation: "getMembershipList" });
      },
    });

  // 사용자 멤버십 추가
  const { mutateAsync: saveUserMembership, isPending: isSavingMembership } =
    useMutation<ApiResponse<any>, Error, { userId: number; membershipId: number; startDate: string; endDate: string }>({
      mutationFn: async ({ userId, membershipId, startDate, endDate }) => {
        const dto: SaveUserMembershipDto = {
          membership: {
            membershipId,
            startDate,
            endDate,
          }
        };
        return await UserRepository.saveUserMembership(userId, dto);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        await queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
        logInfo("멤버십 추가 성공 - 목록 새로고침 완료", { operation: "saveUserMembership" });
      },
      onError: (error) => {
        logError("멤버십 추가 중 오류", error, { operation: "saveUserMembership" });
      },
    });

  // 사용자 멤버십 토글
  const { mutateAsync: toggleUserMembership, isPending: isTogglingMembership } =
    useMutation<ApiResponse<any>, Error, { userId: number; membershipUserId: number }>({
      mutationFn: async ({ userId, membershipUserId }) => {
        return await UserRepository.toggleUserMembership(userId, membershipUserId);
      },
      onSuccess: async () => {
        // 사용자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["userList"] });
        await queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
        logInfo("멤버십 토글 성공 - 목록 새로고침 완료", { operation: "toggleUserMembership" });
      },
      onError: (error) => {
        logError("멤버십 토글 중 오류", error, { operation: "toggleUserMembership" });
      },
    });

  // 사용자 목록 가져오기 (정렬된)
  const getUserList = (): User[] => {
    if (!userListResult?.data?.userList) return [];

    // 최근 로그인 순으로 정렬 (로그인한 적 없는 사용자는 맨 뒤)
    const userList = [...userListResult.data.userList];
    return userList.sort((a, b) => {
      if (!a.lastLoginDate && !b.lastLoginDate) return 0;
      if (!a.lastLoginDate) return 1;
      if (!b.lastLoginDate) return -1;
      return (
        new Date(b.lastLoginDate).getTime() -
        new Date(a.lastLoginDate).getTime()
      );
    });
  };

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString: string | null): string => {
    if (!dateTimeString) return "-";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  // 상태별 사용자 수 계산
  const getUserStats = () => {
    const users = getUserList();
    return {
      total: users.length,
      completion: users.filter(user => user.status === "COMPLETION").length,
      stop: users.filter(user => user.status === "STOP").length,
      waiting: users.filter(user => user.status === "WAITING").length,
      withdraw: users.filter(user => user.status === "WITHDRAW").length,
    };
  };

  // 멤버십 상태 텍스트 가져오기
  const getMembershipStatusText = (status: string) => {
    switch (status) {
      case "ACTIVATE":
        return "활성화";
      case "EXPIRED":
        return "만료";
      case "STOP":
        return "정지";
      case "READY":
        return "준비";
      default:
        return status;
    }
  };

  // 사용자 상태 텍스트 가져오기
  const getUserStatusText = (status: string) => {
    switch (status) {
      case "COMPLETION":
        return "승인";
      case "STOP":
        return "정지";
      case "WAITING":
        return "대기";
      case "WITHDRAW":
        return "탈퇴";
      default:
        return status;
    }
  };

  // 사용자 상태 색상 가져오기
  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETION":
        return "bg-green-100 text-green-800";
      case "STOP":
        return "bg-red-100 text-red-800";
      case "WAITING":
        return "bg-yellow-100 text-yellow-800";
      case "WITHDRAW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 페이지네이션 유틸리티 함수들
  const getPaginatedUsers = (users: User[], currentPage: number, itemsPerPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const getPageNumbers = (currentPage: number, totalPages: number, maxVisible: number = 5) => {
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return {
    // 데이터
    userList: getUserList(),
    isLoading,
    error,

    // 액션
    refetch,
    createUser,
    isCreatingUser,
    completeUser,
    isCompletingUser,
    withdrawUser,
    isWithdrawingUser,
    updateUser,
    isUpdatingUser,
    updateUserAuthority,
    isUpdatingAuthority,
    updateDistributor,
    isUpdatingDistributor,
    getMembershipList,
    isLoadingMembershipList,
    saveUserMembership,
    isSavingMembership,
    toggleUserMembership,
    isTogglingMembership,

    // 유틸리티
    formatDateTime,
    getUserStats,
    getMembershipStatusText,
    getUserStatusText,
    getUserStatusColor,

    // 페이지네이션 유틸리티
    getPaginatedUsers,
    getTotalPages,
    getPageNumbers,
  };
};
