# Nplace Reply – 프론트 요청 순서 & API 스펙

프런트엔드가 Nplace 댓글 제어 기능을 호출할 때의 전체 흐름과 각 API의 요청/응답 모양을 정리했습니다. 모든 엔드포인트는 `HttpSession`에 `authInfo`가 있어야 하며(로그인 필수), 응답은 공통 `ResDTO` 래퍼를 사용합니다.

---

## 1. 전체 호출 순서 (권장 플로우)
1. **세션 로그인** – 기존 Auth API로 로그인하여 `authInfo` 세션 값을 만든다.
2. **네이버 계정 등록 여부 조회**  
   `GET /v1/user/naver/status` → `exists=false` 면 계정이 없음.
3. **네이버 계정 등록/수정**  
   - 미등록: `POST /v1/user/naver`  
   - 수정: `PUT /v1/user/naver`
4. **현재 댓글 상태 조회**  
   `GET /v1/reply` → 저장된 place ID/활성화 여부 리스트 반환.
5. **댓글 ON/OFF 토글**  
   `POST /v1/reply` 로 placeId + active 값을 전달.
6. **댓글 제어 정보 삭제(선택)**  
   `DELETE /v1/reply` → Pumpingstore/DB 모두 비움.

각 단계 실패 시 `code != 0`과 메시지가 내려오므로 프런트는 메시지를 그대로 보여주거나 재로그인 유도하면 됩니다.

---

## 2. 네이버 계정 API

### 2.1 상태 조회 – `GET /v1/user/naver/status`
- Request Body: 없음
- Success Response
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "exists": true
  }
}
```

### 2.2 네이버 계정 조회 – `GET /v1/user/naver`
- Request Body: 없음
- Success Response (`ResUserNaverDTOApiV1`)
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userNaver": {
      "userId": 1,
      "naverId": "seller@example.com",
      "naverPw": "암호화된 상태이지만 서버에서 복호화되어 내려옴"
    }
  }
}
```
> 주의: 응답에 암호화된 PW가 복호화돼 포함되므로, 프런트에서는 바로 재사용하거나 사용자에게 노출하지 않는 것이 안전합니다.

### 2.3 네이버 계정 등록 – `POST /v1/user/naver`
- Request Body (`ReqUserNaverDTOApiV1`)
```json
{
  "userNaver": {
    "naverId": "seller@example.com",
    "naverPw": "plain-password"
  }
}
```
- Success Response
```json
{ "code": 0, "message": "success" }
```

### 2.4 네이버 계정 수정 – `PUT /v1/user/naver`
- Request Body: `POST`와 동일
- Success Response: `code = 0`

---

## 3. Nplace 댓글 제어 API

### 3.1 상태 조회 – `GET /v1/reply`
- Success Response (`ResNplaceReplyListDTOApiV1`)
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "nplaceReplyList": [
      { "id": 11, "placeId": "ChIJxxx", "active": true },
      { "id": 15, "placeId": "ChIJyyy", "active": false }
    ]
  }
}
```
> 주의: 여기서 내려오는 `placeId` 목록은 **이미 POST/DELETE로 저장·삭제한 내역**만 담은 로컬 DB 값입니다. Pumpingstore에서 자동 조회해오지 않으므로, 새 플레이스는 사용자가 직접 placeId를 입력해 POST로 등록해야 이후 GET에서 보입니다.

### 3.2 활성화/비활성화 – `POST /v1/reply`
- Request Body (`ReqNplaceReplyChangeNplaceReplyDTOApiV1`)
```json
{
  "nplaceReplyInfo": {
    "placeId": "ChIJxxx",
    "active": true
  }
}
```
- Success Response
```json
{ "code": 0, "message": "success" }
```
> 서버 내부에서 네이버 계정 확인 → Pumpingstore `post/put seller-nvid` 호출 → DB 저장/로그 기록까지 처리됩니다. 클라이언트는 단순 성공 여부만 확인하면 됩니다.

### 3.3 삭제 – `DELETE /v1/reply`
- Request Body: 없음
- Success Response
```json
{ "code": 0, "message": "success" }
```
> Pumpingstore `delete seller-nvid` 호출 후, 로컬 DB의 Reply/Log를 모두 삭제합니다.

---

## 4. 예외/에러 응답 패턴
- 세션 만료: `AuthenticationException` → `code != 0`, 메시지 예: `"재인증이 필요한 사용자입니다. 로그인 후 다시 시도해주세요."`
- 네이버 계정 없음: `"네이버 인증 정보가 없습니다."`  
  → 프런트에서 계정 등록 화면으로 유도.
- Pumpingstore 오류: `NomadscrapException` 메시지가 그대로 전달되므로, 사용자에게 안내하거나 다시 시도 옵션을 제공합니다.

---

## 5. 체크리스트
1. 모든 호출 전 세션 로그인되어 있는지 확인.
2. 댓글 토글 전 항상 `/v1/user/naver/status`로 계정 여부 확인.
3. 비밀번호는 프런트에서도 안전하게 다루고, 저장하지 않는다.
4. API 응답의 `code`가 0인지 먼저 확인하고, 실패 시 `message`를 사용자에게 안내.
5. 삭제 요청은 되돌릴 수 없으므로 사용자 확인 모달 권장.

이 문서를 기준으로 프런트에서 순서를 그대로 구현하면, 네이버 계정 등록부터 댓글 제어까지 전 과정을 일관되게 처리할 수 있습니다.

---

## 6. 사용자 시나리오 예시
- **처음 설정**: 로그인 → 네이버 계정 등록 → 사용자가 플레이스 ID를 직접 입력해 `POST /v1/reply`(active=true/false) → 이후 `GET /v1/reply`로 방금 등록한 placeId/상태가 표시됨.
- **상태 확인 후 수정**: `GET /v1/reply`로 현재 저장된 placeId/active 확인 → 특정 placeId에 대해 `POST /v1/reply`로 active 토글 → 변경 내역이 Pumpingstore와 DB 양쪽에 반영.
- **전체 해제**: `DELETE /v1/reply` 호출 → Pumpingstore 삭제 + 로컬 Reply/Log 비움 → `GET /v1/reply` 시 빈 리스트 반환.
