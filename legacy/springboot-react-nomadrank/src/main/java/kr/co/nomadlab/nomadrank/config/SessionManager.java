package kr.co.nomadlab.nomadrank.config;

import jakarta.servlet.http.HttpSession;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionManager {

    // 사용자별로 현재 활성 세션 관리
    private final Map<String, HttpSession> activeSessions = new ConcurrentHashMap<>();

    // 새로운 세션 추가
    public synchronized void addSession(String username, HttpSession session) {
        HttpSession oldSession = activeSessions.get(username);

        // 이미 등록된 세션이 있고, 그 세션이 이번 요청과 다른 경우에만 무효화
        if (oldSession != null && !oldSession.getId().equals(session.getId())) {
            try {
                oldSession.invalidate();
            } catch (IllegalStateException ignored) {
                // 이미 무효화된 상태면 무시
            }
        }

        if (!username.equals("testuser") && !username.equals("richmanager")) {
            activeSessions.put(username, session);
        }
    }

    // 세션 제거
    public synchronized void removeSession(String username) {
        HttpSession oldSession = activeSessions.get(username);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        activeSessions.remove(username);
    }

    public Map<String, HttpSession> getActiveSessions() {
        return activeSessions;
    }

    // 특정 사용자 세션 가져오기
    public HttpSession getSession(String username) {
        return activeSessions.get(username);
    }

    public boolean existsSession(String username) {
        return activeSessions.containsKey(username);
    }

    // 12시간이 지난 세션 자동 종료
    @Scheduled(cron = "0 * * * * ?")
    public void cleanupExpiredSessions() {
        Iterator<Map.Entry<String, HttpSession>> iterator = activeSessions.entrySet().iterator();
        long currentTime = System.currentTimeMillis();

        while (iterator.hasNext()) {
            Map.Entry<String, HttpSession> entry = iterator.next();
            HttpSession session = entry.getValue();
            if (session != null) {
                try {
                    long lastAccessedTime = session.getLastAccessedTime();
                    // 12시간 = 12 * 60 * 60 * 1000 밀리초
                    if (currentTime - lastAccessedTime > 12 * 60 * 60 * 1000L) {
                        session.invalidate();
                        iterator.remove();
                    }
                } catch (IllegalStateException e) {
                    // 이미 무효화된 세션은 즉시 제거
                    iterator.remove();
                }
            }
        }
    }
}
