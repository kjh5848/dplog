package kr.co.nomadlab.nomadrank.domain.distributor.dto.response;

import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResDistributorDTOApiV1 {

    private Distributor distributor;

    public static ResDistributorDTOApiV1 of(
            UserEntity userEntity
    ) {
        return ResDistributorDTOApiV1.builder()
                .distributor(Distributor.fromUserEntity(userEntity))
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
        private String memo;

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
                    .memo(userEntity.getDistributorEntity().getMemo())
                    .build();
        }
    }

}
