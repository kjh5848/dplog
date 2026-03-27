import DistributorRepository from "@/src/model/DistributorRepository";
import {
  Distributor,
  DistributorListResponse,
  DistributorResponse,
  DistributorCreateRequest,
  DistributorCreateDto,
  DistributorUpdateRequest,
  DistributorUpdateDto,
} from "@/src/types/distributor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api";
import { logInfo, logError, logApiResponse } from "@/src/utils/logger";

export const useDistributorViewModel = () => {
  const queryClient = useQueryClient();

  logInfo("관리자 관리 ViewModel 초기화");

  // 관리자 목록 조회
  const {
    data: distributorListResult,
    error: distributorListError,
    isLoading: isLoadingDistributorList,
    refetch: refetchDistributorList,
  } = useQuery<ApiResponse<DistributorListResponse>>({
    queryKey: ["distributorList"],
    queryFn: async () => {
      logInfo("관리자 목록 조회 시작");
      const response = await DistributorRepository.getDistributorList();
      logApiResponse("관리자 목록 조회", response);
      return response;
    },
  });

  // 현재 관리자 정보 조회
  const {
    data: distributorResult,
    error: distributorError,
    isLoading: isLoadingDistributor,
    refetch: refetchDistributor,
  } = useQuery<ApiResponse<DistributorResponse>>({
    queryKey: ["distributor"],
    queryFn: async () => {
      logInfo("관리자 정보 조회 시작");
      const response = await DistributorRepository.getDistributor();
      logApiResponse("관리자 정보 조회", response);
      return response;
    },
  });

  // 관리자 등록
  const { mutateAsync: createDistributor, isPending: isCreatingDistributor } =
    useMutation<ApiResponse<any>, Error, DistributorCreateRequest>({
      mutationFn: async (distributorData) => {
        const dto: DistributorCreateDto = {
          distributor: {
            companyName: distributorData.companyName,
            userName: distributorData.userName,
            password: distributorData.password,
            tel: distributorData.tel,
            email: distributorData.email,
            deposit: distributorData.deposit,
            accountNumber: distributorData.accountNumber,
            bankName: distributorData.bankName,
            googleSheetUrl: distributorData.googleSheetUrl,
            memo: distributorData.memo,
          }
        };
        return await DistributorRepository.createDistributor(dto);
      },
      onSuccess: async () => {
        // 관리자 목록 새로고침
        await queryClient.invalidateQueries({ queryKey: ["distributorList"] });
        logInfo("관리자 등록 성공 - 목록 새로고침 완료");
      },
      onError: (error) => {
        logError("관리자 등록 중 오류", error, { operation: "createDistributor" });
      },
    });

  // 관리자 정보 수정
  const { mutateAsync: updateDistributor, isPending: isUpdatingDistributor } =
    useMutation<ApiResponse<any>, Error, DistributorUpdateRequest>({
      mutationFn: async (distributorData) => {
        const dto: DistributorUpdateDto = {
          distributor: distributorData
        };
        return await DistributorRepository.updateDistributor(dto);
      },
      onSuccess: async () => {
        // 관리자 목록 및 현재 관리자 정보 새로고침
        await queryClient.invalidateQueries({ queryKey: ["distributorList"] });
        await queryClient.invalidateQueries({ queryKey: ["distributor"] });
        logInfo("관리자 정보 수정 성공 - 목록 새로고침 완료");
      },
      onError: (error) => {
        logError("관리자 정보 수정 중 오류", error, { operation: "updateDistributor" });
      },
    });

  // 관리자 목록 가져오기 (mutation으로 즉시 호출 가능)
  const { mutateAsync: getDistributorList, isPending: isGettingDistributorList } =
    useMutation<ApiResponse<DistributorListResponse>, Error>({
      mutationFn: async () => {
        return await DistributorRepository.getDistributorList();
      },
      onError: (error) => {
        logError("관리자 목록 조회 중 오류", error, { operation: "getDistributorList" });
      },
    });

  // 관리자 목록 가져오기 (정렬된)
  const getDistributorListData = (): Distributor[] => {
    if (!distributorListResult?.data?.distributorList) return [];
    return [...distributorListResult.data.distributorList];
  };

  // 현재 관리자 정보 가져오기
  const getCurrentDistributor = (): Distributor | null => {
    if (!distributorResult?.data?.distributor) return null;
    return distributorResult.data.distributor;
  };

  return {
    // 데이터
    distributorList: getDistributorListData(),
    currentDistributor: getCurrentDistributor(),
    isLoadingDistributorList,
    isLoadingDistributor,
    distributorListError,
    distributorError,

    // 액션
    refetchDistributorList,
    refetchDistributor,
    createDistributor,
    isCreatingDistributor,
    updateDistributor,
    isUpdatingDistributor,
    getDistributorList,
    isGettingDistributorList,
  };
};
