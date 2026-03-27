---
description: "API 테스트" 백엔드 API를 curl로 자동 테스트하는 워크플로우 (Dev 토큰 자동 발급 + Phase별 엔드포인트 검증)
---

# API 자동 테스트 워크플로우

이 워크플로우는 백엔드 서버가 기동된 상태에서 모든 API를 순차적으로 curl 테스트합니다.
Dev 환경에서만 동작하며, 테스트 멤버 JWT 토큰을 자동 발급받아 사용합니다.

> 참조: Swagger UI로도 테스트 가능 — `http://localhost:8080/swagger-ui.html`

// turbo-all

## 0. 사전 조건 확인

서버가 기동 중인지 확인:

```bash
curl -s http://localhost:8080/health | head -5
```

서버가 기동되지 않았으면:

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/backend && ./gradlew bootRun &
sleep 10
```

## 1. Dev 토큰 발급

```bash
DEV_RESPONSE=$(curl -s -X POST http://localhost:8080/v1/auth/dev/login)
echo "$DEV_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$DEV_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
echo "TOKEN=$TOKEN"
```

## 2. Store API 테스트

### 2.1 가게 등록

```bash
STORE_RESPONSE=$(curl -s -X POST http://localhost:8080/v1/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트가게","category":"한식","address":"서울시 강남구 테헤란로 123","placeUrl":"https://naver.me/test","phone":"02-1234-5678"}')
echo "$STORE_RESPONSE" | python3 -m json.tool
STORE_ID=$(echo "$STORE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
echo "STORE_ID=$STORE_ID"
```

### 2.2 가게 조회

```bash
curl -s http://localhost:8080/v1/stores/$STORE_ID \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 2.3 가게 수정

```bash
curl -s -X PUT http://localhost:8080/v1/stores/$STORE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"수정된가게명","phone":"02-9999-8888"}' | python3 -m json.tool
```

### 2.4 내 가게 목록

```bash
curl -s http://localhost:8080/v1/stores/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## 3. KeywordSet API 테스트

### 3.1 키워드 세트 저장

```bash
curl -s -X POST http://localhost:8080/v1/stores/$STORE_ID/keyword-sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keywords":["강남맛집","한식맛집","점심메뉴","강남맛집","  "]}' | python3 -m json.tool
```

> 중복("강남맛집")과 공백 키워드("  ")가 자동 제거되는지 확인

### 3.2 키워드 세트 목록 조회

```bash
curl -s http://localhost:8080/v1/stores/$STORE_ID/keyword-sets \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## 4. 에러 케이스 테스트

### 4.1 인증 없이 요청 → 401

```bash
curl -s http://localhost:8080/v1/stores/1 | python3 -m json.tool
```

### 4.2 금칙어 포함 키워드 → 400

```bash
curl -s -X POST http://localhost:8080/v1/stores/$STORE_ID/keyword-sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keywords":["도박장맛집"]}' | python3 -m json.tool
```

### 4.3 존재하지 않는 가게 → 404

```bash
curl -s http://localhost:8080/v1/stores/99999 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 4.4 Validation 실패 (빈 이름) → 400

```bash
curl -s -X POST http://localhost:8080/v1/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"","category":"한식","address":"서울"}' | python3 -m json.tool
```
