import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GroupRepository, { ReqSaveGroupDTO, ReqDeleteGroupDTO } from "@/model/GroupRepository";
import { ApiResponse } from "@/types/api";

// 그룹 관련 ViewModel
export const useNplaceGroupViewModel = () => {
  const queryClient = useQueryClient();

  // 그룹 목록 조회
  const {
    data: groupListResult,
    error: groupListError,
    isLoading: isGroupListLoading,
    refetch: refetchGroupList,
  } = useQuery<ApiResponse<{ groupList: any[] }>>({
    queryKey: ["groupList"],
    queryFn: () => GroupRepository.getGroupList(),
  });

  // 그룹 추가(생성)
  const {
    mutateAsync: addGroup,
    isPending: isAddingGroup,
    error: addGroupError,
  } = useMutation({
    mutationFn: async (data: ReqSaveGroupDTO) => {
      const res = await GroupRepository.saveGroup(data);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groupList"] });
    },
  });

  // 그룹 수정 (주석 해제 및 구현 필요)
  // const {
  //   mutateAsync: updateGroup,
  //   isPending: isUpdatingGroup,
  //   error: updateGroupError,
  // } = useMutation({
  //   mutationFn: async (data: ReqUpdateGroupDTO) => {
  //     const res = await GroupRepository.updateGroup(data);
  //     return res;
  //   },
  //   onSuccess: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ["groupList"] });
  //   },
  // });

  // 그룹 삭제
  const {
    mutateAsync: deleteGroup,
    isPending: isDeletingGroup,
    error: deleteGroupError,
  } = useMutation({
    mutationFn: async (data: ReqDeleteGroupDTO) => {
      const res = await GroupRepository.deleteGroup(data);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groupList"] });
    },
  });

  return {
    // 그룹 목록
    groupList: groupListResult?.data?.groupList ?? [],
    isGroupListLoading,
    groupListError,
    refetchGroupList,
    // 그룹 추가
    addGroup,
    isAddingGroup,
    addGroupError,
    // 그룹 삭제
    deleteGroup,
    isDeletingGroup,
    deleteGroupError,
    // 그룹 수정 (주석 해제 시)
    // updateGroup,
    // isUpdatingGroup,
    // updateGroupError,
  };
};
