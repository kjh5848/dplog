# Nplace Keyword – 프런트 요청 순서 & API 스펙

Nplace 키워드 기능(일반 키워드 조회 + 연관 키워드 조회)을 프런트에서 호출할 때 필요한 순서와 요청/응답 모양을 정리했습니다. 모든 API는 세션 기반 인증(`authInfo`가 HttpSession에 존재) 상태에서만 사용할 수 있으며, 응답은 공통 `ResDTO` 포맷(`code`, `message`, `data`)을 따릅니다.

---

## 공통 전제
1. **로그인 완료 상태**  
   기존 Auth API로 로그인하여 `authInfo` 세션 값을 생성해야 합니다. 없으면 `AuthenticationException`으로 `code != 0` 응답이 내려옵니다.
2. **일일 사용량 제한**  
   - 키워드 조회: `ServiceSort.NPLACE_KEYWORD`
   - 연관 키워드 조회: `ServiceSort.NPLACE_KEYWORD_RELATION`  
   플랜별 제한을 초과하면 `"해당 기능은 현재 플랜에서 사용할 수 없습니다."` 또는 `"N회 사용횟수를 모두 사용하였습니다."` 메시지가 내려오므로 프런트에서 그대로 안내하세요.
3. **응답 구조**  
   `data.keywordToolList` 배열 내부는 `relKeyword`, `monthlyPcQcCnt`, `compIdx` 등 Naver SearchAd Keywords Tool 값을 그대로 변환한 것입니다.

---

## 1. 키워드 조회 (다중 키워드 입력 → 개별 통계)

### 요청 플로우
1. 로그인 세션 확보
2. 사용자 입력 키워드를 개행 문자(`\n`)로 연결한 단일 문자열 생성
3. `POST /v1/nplace/keyword/nsearchad/keywordstool` 호출
4. `data.keywordToolList`를 UI에 표시

### Request
`POST /v1/nplace/keyword/nsearchad/keywordstool`

```json
{
  "nplaceKeywordNsearchadKeywordstoolKeyword": {
    "keywordString": "플라워샵\n꽃배달\n서울 꽃집"
  }
}
```
- `keywordString`은 개행 문자 기준으로 분리됩니다.
- 서버는 각 키워드마다 Naver SearchAd Keyword Tool을 호출하여 첫 번째 결과만 추출합니다.

### Success Response (`code = 0`)
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "keywordToolList": [
      {
        "relKeyword": "플라워샵",
        "monthlyPcQcCnt": 1200,
        "monthlyMobileQcCnt": 3400,
        "monthlyAvePcClkCnt": 23.4,
        "monthlyAveMobileClkCnt": 51.2,
        "monthlyAvePcCtr": 1.2,
        "monthlyAveMobileCtr": 1.7,
        "plAvgDepth": 2,
        "compIdx": "높음"
      },
      {
        "relKeyword": "꽃배달",
        "monthlyPcQcCnt": 980,
        "...": "..."
      }
    ]
  }
}
```

### 에러 예시
- 세션 없음 → `code != 0`, `"재인증이 필요한 사용자입니다. 로그인 후 다시 시도해주세요."`
- 사용량 초과 → `"N회 사용횟수를 모두 사용하였습니다."`
- 빈 키워드 → `"키워드가 비어있습니다."`

---

## 2. 연관 키워드 조회 (키워드 조합 / RELATION 모드)

### 요청 플로우
1. 로그인 세션 확보
2. 사용자가 입력한 1~5개의 키워드를 배열로 준비
3. `requestType` 파라미터 설정
   - `RELATION`: 첫 번째 키워드 기준 연관 키워드 20개 내외 반환
   - `TRACK`: 입력한 키워드를 `,`로 연결해 SearchAd API에 전달 (키워드 추적용)
4. `GET /v1/nplace/keyword/nsearchad/keywordstool/relation` 호출
5. `data.keywordToolList` 결과를 UI에 표시

### Request
`GET /v1/nplace/keyword/nsearchad/keywordstool/relation`

Query Parameters
- `keywordList`: 1~5개의 키워드. 예) `keywordList=카페&keywordList=디저트`
- `requestType`: `RELATION` 또는 `TRACK`

예시:
```
/v1/nplace/keyword/nsearchad/keywordstool/relation?keywordList=플라워샵&keywordList=꽃배달&requestType=RELATION
```

### Success Response (`code = 0`)
구조는 키워드 조회와 동일하게 `data.keywordToolList` 배열로 내려옵니다. `RELATION` 모드에서는 SearchAd API가 반환한 연관 키워드 목록 전체가 전달되고, `TRACK` 모드에서는 요청한 키워드 수만큼 상위 결과가 반환됩니다.

### 에러 예시
- 세션 없음 → `AuthenticationException`
- 사용량 초과 → `"해당 기능은 현재 플랜에서 사용할 수 없습니다."` / `"N회 사용횟수를 모두 사용하였습니다."`
- `keywordList`에 빈 문자열 포함 → `"키워드가 비어있습니다."`

---

## 3. (옵션) 블로그 검색 정보
`GET /v1/nplace/keyword/nblog/search/info?keyword=플라워샵`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "result": {
      "searchDisplayInfo": { "keyword": "플라워샵" },
      "totalCount": 12345,
      "isAdultUser": false
    }
  }
}
```
세션 없이 호출 가능하며, 특정 키워드의 Naver Blog 검색량을 빠르게 확인할 때 사용합니다.

---

## 4. 프런트 체크리스트
1. **항상 로그인 세션 확인**: 세션 만료 시 재로그인을 유도하세요.
2. **요청 파라미터 검증**: 빈 키워드가 넘어가지 않도록 전처리하고, `keywordList`는 최대 5개로 제한합니다.
3. **사용량 제한 메시지 그대로 노출**: 서버에서 내려준 메시지를 안내하면 플랜 업그레이드 유도에 도움이 됩니다.
4. **결과 캐싱 고려**: 동일한 키워드 조합을 반복해서 호출 시 프런트 캐시/History를 적용하면 사용자 경험이 좋아집니다.
5. **에러 공통 처리**: `code != 0`이면 `message`를 토스트/다이얼로그로 보여주고, 필요 시 로그아웃 → 로그인 흐름을 안내하세요.

이 문서를 기준으로 프런트에서는 “키워드 조회”와 “연관 키워드 조회” 기능을 일관된 방식으로 연동할 수 있습니다.
