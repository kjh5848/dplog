"use client";

import React, { useState, useEffect, useCallback } from "react";
import { logError } from "@/src/utils/logger";
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { User } from "@/src/types/user";
import { useUserListViewModel } from "@/src/viewModel/user/useUserListViewModel";
import { toast } from "react-hot-toast";

interface Membership {
  id: number;
  name: string;
}

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const {
    getMembershipList,
    isLoadingMembershipList,
    saveUserMembership,
    isSavingMembership,
    toggleUserMembership,
    isTogglingMembership,
  } = useUserListViewModel();

  const [membershipList, setMembershipList] = useState<Membership[]>([]);
  const [selectedMembership, setSelectedMembership] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  });

  // 현재 활성화된 멤버십 정보 가져오기
  const currentMembership =
    user.membershipList && user.membershipList.length > 0
      ? user.membershipList.find(
          (membership) => membership.membershipState === "ACTIVATE",
        ) || null
      : null;

  const fetchMembershipList = useCallback(async () => {
    try {
      // 하드코딩된 권한으로 테스트 (실제로는 loginUser에서 가져와야 함)
      const result = await getMembershipList({ userAuthoritySort: "ADMIN" });
      if (result?.data?.membershipList) {
        setMembershipList(result.data.membershipList);
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown error occurred");
      logError("멤버십 목록 조회 실패", errorObj, {
        operation: "fetchMembershipList",
      });
    }
  }, [getMembershipList]);

  useEffect(() => {
    if (isOpen) {
      fetchMembershipList();
    }
  }, [isOpen, fetchMembershipList]);

  const getMembershipStateText = (state: string) => {
    switch (state) {
      case "ACTIVATE":
        return "활성화";
      case "READY":
        return "준비";
      case "EXPIRED":
        return "만료";
      case "STOP":
        return "정지";
      default:
        return "알 수 없음";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMembership) {
      toast.error("멤버십을 선택해주세요.");
      return;
    }

    try {
      await saveUserMembership({
        userId: user.userId,
        membershipId: parseInt(selectedMembership),
        startDate,
        endDate,
      });

      toast.success("멤버십이 성공적으로 저장되었습니다.");
      onUpdate();
      onClose();
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown error occurred");
      logError("멤버십 저장 중 오류 발생", errorObj, {
        userId: user.userId,
        operation: "saveMembership",
      });
      toast.error("멤버십 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleToggleMembership = async (membership: any) => {
    if (
      membership.membershipState !== "ACTIVATE" &&
      membership.membershipState !== "EXPIRED"
    ) {
      toast.error("활성화 혹은 만료된 멤버십만 변경 가능합니다.");
      return;
    }

    if (
      confirm(
        `해당 멤버십을 ${
          membership.membershipState === "ACTIVATE" ? "비활성화" : "활성화"
        } 하시겠습니까?`,
      )
    ) {
      try {
        await toggleUserMembership({
          userId: user.userId,
          membershipUserId: membership.membershipUserId,
        });

        toast.success(
          `멤버십이 ${
            membership.membershipState === "ACTIVATE" ? "비활성화" : "활성화"
          } 되었습니다.`,
        );

        onUpdate();
        onClose();
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error occurred");
        logError("멤버십 변경 중 오류 발생", errorObj, {
          userId: user.userId,
          operation: "toggleMembership",
        });
        toast.error("멤버십 변경에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const statePriority = {
    ACTIVATE: 1,
    READY: 2,
    EXPIRED: 3,
    STOP: 4,
  };

  const sortedMembershipList = user.membershipList
    ? [...user.membershipList].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);

        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;

        const priorityA =
          statePriority[a.membershipState as keyof typeof statePriority] || 999;
        const priorityB =
          statePriority[b.membershipState as keyof typeof statePriority] || 999;

        return priorityA - priorityB;
      })
    : [];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`멤버십 관리 - ${user.username}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* 현재 멤버십 상태 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold text-gray-900">현재 멤버십 상태</h4>
          {currentMembership ? (
            <p className="text-sm text-gray-600">
              {currentMembership.name} ({currentMembership.startDate}~
              {currentMembership.endDate})
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              현재 활성화된 멤버십이 없습니다.
            </p>
          )}
        </div>

        {/* 멤버십 추가 */}
        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-semibold text-gray-900">새 멤버십 추가</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                멤버십 선택
              </label>
              <select
                value={selectedMembership}
                onChange={(e) => setSelectedMembership(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {membershipList.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {membership.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    // 시작일이 변경되면 종료일도 한 달 뒤로 자동 설정
                    const newEndDate = new Date(e.target.value);
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                    setEndDate(newEndDate.toISOString().split("T")[0]);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingMembership}
              className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingMembership ? "저장 중..." : "멤버십 추가"}
            </button>
          </form>
        </div>

        {/* 멤버십 이력 */}
        <div>
          <h4 className="mb-4 font-semibold text-gray-900">멤버십 이력</h4>
          <div className="space-y-3">
            {sortedMembershipList.length > 0 ? (
              sortedMembershipList.map((membership, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {membership.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {membership.startDate} ~ {membership.endDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex cursor-pointer rounded-full px-2 py-1 text-xs font-semibold ${
                        membership.membershipState === "ACTIVATE"
                          ? "bg-green-100 text-green-800"
                          : membership.membershipState === "READY"
                            ? "bg-blue-100 text-blue-800"
                            : membership.membershipState === "EXPIRED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                      onClick={() => handleToggleMembership(membership)}
                    >
                      {getMembershipStateText(membership.membershipState)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                멤버십 이력이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default MembershipModal;
function userCallback(arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}
