# Nplace Reply – Postman 테스트 가이드

댓글 제어 API(`/v1/reply`)를 Postman으로 재현할 때 필요한 환경 설정과 요청/응답 예시를 정리했습니다. 세션 기반 인증이므로 `JSESSIONID` 쿠키를 먼저 받아서 이후 요청에 함께 보내야 합니다.

## 0. 사전 준비
- 서버 실행: `./gradlew bootRun` (기본 `https://localhost:8443`). HTTP로 돌릴 경우 `PORT=8081 SSL_ENABLED=false ./gradlew bootRun`.
- Postman에서 **SSL certificate verification**을 끄거나(설정 → General), 개별 요청에서 `Disable SSL verification` 활성화.
- 변수 추천:
  - `base_url` = `https://localhost:8443` (또는 `http://localhost:8081`)
  - `JSESSIONID` = 로그인 이후 테스트 스크립트로 자동 저장

## 1. 로그인 후 세션 쿠키 저장
- **Request**: `POST {{base_url}}/v1/auth/login`
- Body (raw JSON):
```json
{
  "user": {
    "username": "your-username",
    "password": "your-password"
  }
}
```
- **Tests 탭**에 아래 스크립트를 추가하면 응답 쿠키를 자동 저장할 수 있습니다.
```javascript
const jsid = pm.response.cookies.get("JSESSIONID");
if (jsid) {
  pm.environment.set("JSESSIONID", jsid);
}
```
- 이후 요청 헤더에 `Cookie: JSESSIONID={{JSESSIONID}}`를 추가합니다. (Postman Cookies UI로 직접 추가해도 됩니다.)

## 2. 세션/권한 확인(옵션)
- `GET {{base_url}}/v1/auth/info`
- 성공 시 `code: 0`과 `data`에 `authInfo`가 내려오면 세션이 정상입니다. 실패 시 다시 로그인하세요.

## 3. 네이버 계정 상태 확인(필수)
댓글 제어는 네이버 계정이 있어야 합니다.
- `GET {{base_url}}/v1/user/naver/status`
- `exists: true`가 아니면 `POST /v1/user/naver`로 등록 후 진행하세요.

### 3-1. 네이버 계정 등록 – `POST {{base_url}}/v1/user/naver`
- Header: `Cookie: JSESSIONID={{JSESSIONID}}`
- Body (raw JSON):
```json
{
  "userNaver": {
    "naverId": "seller@example.com",
    "naverPw": "plain-password"
  }
}
```
- 기대 응답: `{"code":0,"message":"success"}`

### 3-2. 네이버 계정 수정 – `PUT {{base_url}}/v1/user/naver`
- Header: `Cookie: JSESSIONID={{JSESSIONID}}`
- Body: 등록과 동일
- 기대 응답: `{"code":0,"message":"success"}`

## 4. 댓글 상태 조회 – `GET {{base_url}}/v1/reply`
- Header: `Cookie: JSESSIONID={{JSESSIONID}}`
- 기대 응답:
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
- 참고: 여기서 내려오는 `placeId` 목록은 **로컬 DB(NplaceReplyEntity)**에 저장된 값입니다. 새 유저가 한 번도 댓글 제어를 설정하지 않았다면 배열이 빈 상태로 내려옵니다. Pumpingstore에서 자동 조회해오지 않으니, 먼저 5단계 POST로 placeId를 등록해야 합니다.

## 5. 댓글 ON/OFF 토글 – `POST {{base_url}}/v1/reply`
- Header: `Cookie: JSESSIONID={{JSESSIONID}}`
- Body (raw JSON):
```json
{
  "nplaceReplyInfo": {
    "placeId": "ChIJxxx",  // 네이버 플레이스 ID
    "active": true         // true = ON, false = OFF
  }
}
```
- 성공 시 `{"code":0,"message":"success"}`. 내부에서 Pumpingstore `post/put seller-nvid`까지 호출됩니다.

## 6. 댓글 제어 정보 삭제 – `DELETE {{base_url}}/v1/reply`
- Header: `Cookie: JSESSIONID={{JSESSIONID}}`
- Body: 없음
- 성공 시 `{"code":0,"message":"success"}`. Pumpingstore `delete seller-nvid` 호출 후 로컬 Reply/Log가 모두 삭제됩니다.

## 7. 자주 발생하는 실패 원인
- 세션 없음/만료: `AuthenticationException` → 다시 로그인 후 쿠키 갱신.
- 네이버 계정 미등록: `"네이버 인증 정보가 없습니다."` → 3단계에서 계정 등록.
- 멤버십 권한 부족: `"리뷰 답글 기능은 프리미엄 마스터 플랜에서만 사용할 수 있습니다."` → 마스터 플랜으로 로그인 필요.
- Pumpingstore 오류: 응답 `message`를 그대로 노출하니 메시지 확인 후 재시도.

위 순서대로 실행하면 Postman만으로 Reply API의 요청/응답을 빠르게 검증할 수 있습니다. 필요 시 `Tests` 스크립트에 추가 로깅을 넣어 응답 바디/헤더를 확인하세요.
