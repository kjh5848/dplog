"use client";

import { useState } from "react";
import GroupAddModal from "@/components/group/GroupAddModal";
import { useNplaceGroupViewModel } from "@/viewModel/group/nplaceGroupViewMode";
import GroupEditModal from "@/src/components/group/GroupEditModal";
import { TrackGroup, GroupChangeData } from "@/types/group";
import toast from "react-hot-toast";

interface TrackFilterProps {
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  groupList: TrackGroup[];
  handleGroupChangeModalShow: () => void;
  setIsTrackableModalShow: (show: boolean) => void;
  isGroupChangeModalShow: boolean;
  handleChangeGroupModalClose: () => void;
  onChangeGroupModalSubmit: (data: GroupChangeData) => void;
}

export default function TrackFilter({
  selectedGroup,
  setSelectedGroup,
  groupList,
  handleGroupChangeModalShow,
  setIsTrackableModalShow,
  isGroupChangeModalShow,
  handleChangeGroupModalClose,
  onChangeGroupModalSubmit,
}: TrackFilterProps) {
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isGroupEditModalOpen, setGroupEditModalOpen] = useState(false);

  
    
  const handleGroupChangeModalClose = () => setGroupModalOpen(false);

  // 그룹 추가 관련 뷰모델
  const { addGroup, isAddingGroup, addGroupError, refetchGroupList } =
    useNplaceGroupViewModel();



  // 그룹 추가 함수 분리
  const handleAddGroup = async (groupName: string, memo: string) => {
    try {
      await addGroup({
        group: {
          serviceSort: "NPLACE_RANK_TRACK",
          groupName,
          memo,
        },
      });
      await refetchGroupList();
      handleGroupChangeModalClose();
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error('Unknown error occurred');
      toast.error(error.message || "그룹 추가에 실패했습니다.");
    }
  };

  const handleGroupAddModalShow = () => {
    setGroupModalOpen(true);
  };

  return (
    <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="focus:outline-hiddenfocus:ring-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:ring-blue-500 sm:w-36"
        >
          <option value="all">전체</option>
          <option value="기본">기본</option>
          {groupList?.map((group) => (
            <option key={group.id} value={group.groupName}>
              {group.groupName}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleGroupChangeModalShow()}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white shadow-md hover:shadow-lg sm:w-auto"
        >
          그룹 변경
        </button>
        <GroupEditModal
          isOpen={isGroupChangeModalShow}
          onClose={handleChangeGroupModalClose}
          onSubmit={onChangeGroupModalSubmit}
          groupList={groupList}
        />

        <button
          onClick={handleGroupAddModalShow}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white shadow-md hover:shadow-lg sm:w-auto"
        >
          그룹 추가
        </button>
        <GroupAddModal
          open={isGroupModalOpen}
          onClose={handleGroupChangeModalClose}
          onSave={handleAddGroup}
          isLoading={isAddingGroup}
          error={addGroupError}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => setIsTrackableModalShow(true)}
          className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-white shadow-md hover:shadow-lg sm:w-auto"
        >
          추적가능 플레이스 검색
        </button>
      </div>
    </div>
  );
}
