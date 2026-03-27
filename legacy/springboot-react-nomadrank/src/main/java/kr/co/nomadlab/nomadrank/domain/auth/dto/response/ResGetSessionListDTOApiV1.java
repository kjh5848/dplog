package kr.co.nomadlab.nomadrank.domain.auth.dto.response;

import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResGetSessionListDTOApiV1 {

    private List<Session> sessionList;

    public static ResGetSessionListDTOApiV1 of(Map<String, HttpSession> activeSessions) {
        return ResGetSessionListDTOApiV1.builder()
                .sessionList(Session.fromMap(activeSessions))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Session {
        private String username;
        private String creationTime;
        private String lastAccessedTime;

        public static List<Session> fromMap(Map<String, HttpSession> activeSessions) {
            List<Session> sessionList = new ArrayList<>();
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

            for (Map.Entry<String, HttpSession> entry : activeSessions.entrySet()) {
                sessionList.add(Session.builder()
                                .username(entry.getKey())
                                .creationTime(dateFormat.format(new Date(entry.getValue().getCreationTime())))
                                .lastAccessedTime(dateFormat.format(new Date(entry.getValue().getLastAccessedTime())))
                                .build());
            }

            return sessionList;
        }
    }
}
