package kr.co.nomadlab.nomadrank.domain.distributor.dto.response;

import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResDistributorListDTOApiV1 {

    private List<Distributor> distributorList;

    public static ResDistributorListDTOApiV1 of(
            List<UserEntity> userEntityList
    ) {
        return ResDistributorListDTOApiV1.builder()
                .distributorList(Distributor.fromUserEntityList(userEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Distributor {
        private Long userId;
        private Long distributorId;
        private String companyName;
        private String username;
        private String tel;
        private String email;
        private String deposit;
        private String accountNumber;
        private String bankName;
        private String googleSheetUrl;
        private String googleCredentialJson;
        private String memo;

        public static List<Distributor> fromUserEntityList(List<UserEntity> userEntityList) {
            return userEntityList.stream()
                    .map(Distributor::fromUserEntity)
                    .toList();
        }

        public static Distributor fromUserEntity(UserEntity userEntity) {
            return Distributor.builder()
                    .userId(userEntity.getId())
                    .distributorId(userEntity.getDistributorEntity().getId())
                    .companyName(userEntity.getCompanyName())
                    .username(userEntity.getUsername())
                    .tel(userEntity.getTel())
                    .email(userEntity.getDistributorEntity().getEmail())
                    .deposit(userEntity.getDistributorEntity().getDeposit())
                    .accountNumber(userEntity.getDistributorEntity().getAccountNumber())
                    .bankName(userEntity.getDistributorEntity().getBankName())
                    .googleSheetUrl(userEntity.getDistributorEntity().getGoogleSheetUrl())
                    .googleCredentialJson(userEntity.getDistributorEntity().getGoogleCredentialJson())
                    .memo(userEntity.getDistributorEntity().getMemo())
                    .build();
        }
    }

}
