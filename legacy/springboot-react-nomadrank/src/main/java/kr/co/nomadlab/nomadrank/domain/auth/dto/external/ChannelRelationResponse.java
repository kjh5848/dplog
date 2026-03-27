package kr.co.nomadlab.nomadrank.domain.auth.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * 카카오톡 채널 관계 조회 응답 DTO (v2 기준 예시)
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChannelRelationResponse {

    @JsonProperty("user_id")
    private Long userId;                 // 앱 내 사용자 ID

    @JsonProperty("channels")
    private List<ChannelInfo> channels;  // 연결된 채널 관계 목록

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChannelInfo {
        @JsonProperty("channel_uuid")
        private String channelUuid;      // 채널 검색용 식별자

        @JsonProperty("channel_public_id")
        private String channelPublicId;  // 채널 public id (예: @yourchannel 또는 제공된 식별자)

        @JsonProperty("relation")
        private RelationStatus relation; // ADDED | BLOCKED | NONE

        @JsonProperty("created_at")
        private String createdAt;        // ISO-8601 Timestamp

        @JsonProperty("updated_at")
        private String updatedAt;        // ISO-8601 Timestamp
    }

    public enum RelationStatus {
        ADDED,
        BLOCKED,
        NONE
    }
}
