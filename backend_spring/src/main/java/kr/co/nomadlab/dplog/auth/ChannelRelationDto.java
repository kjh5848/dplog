package kr.co.nomadlab.dplog.auth;

import java.time.Instant;

public record ChannelRelationDto(
        String channelPublicId,
        ChannelRelationStatus relation,
        boolean scopeGranted,
        Instant checkedAt
) {
    public static ChannelRelationDto from(KakaoChannelRelation relation) {
        if (relation == null) {
            return null;
        }
        return new ChannelRelationDto(
                relation.getChannelPublicId(),
                relation.getRelation(),
                relation.isScopeGranted(),
                relation.getCheckedAt()
        );
    }
}
