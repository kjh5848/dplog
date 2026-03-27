# Nplace Reply & Pumpingstore Integration – File Roles

새로 추가된 네이버 계정 관리와 Nplace 댓글 제어 기능의 구성요소를 파일 단위로 정리했습니다. 각 파일이 어떤 책임을 가지는지와 주요 상호작용을 한눈에 파악할 수 있도록 역할과 특이사항을 요약했습니다.

## Security & Credential Encryption
- **New** `src/main/java/kr/co/nomadlab/nomadrank/config/security/EncryptionProperties.java`  
  `encryption.*` 프로퍼티를 바인딩해 활성화된 키 ID와 다중 키 정보를 제공합니다. 키 회전을 고려해 패스워드/솔트를 여러 버전으로 관리합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/config/security/EncryptionConfig.java`  
  `EncryptionProperties`를 기반으로 Spring Security `TextEncryptor` 맵을 구성하고 `EncryptionService` 빈을 노출합니다. PBKDF2+AES 조합으로 문자열 암복호화를 수행합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/config/security/EncryptionService.java`  
  키 버전을 프리픽스로 포함한 `vX:cipher` 형식으로 암호화/복호화를 수행하는 서비스입니다. 활성 키를 이용해 암호화하고, 복호화 시에는 프리픽스로 해당 키를 찾아 사용합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/config/security/TextEncryptorAttributeConverter.java`  
  JPA `AttributeConverter`를 통해 엔티티 필드와 DB 컬럼 간 문자열을 자동으로 암·복호화합니다. `UserNaverEntity.naverPw` 등에 적용됩니다.

## User Naver Credential APIs
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/user/naver/controller/UserNaverControllerApiV1.java`  
  세션 인증 사용자에 대해 네이버 계정 등록/조회/수정/존재여부 확인 API를 제공합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/user/naver/dto/request/ReqUserNaverDTOApiV1.java`  
  네이버 ID/PW를 감싼 요청 DTO. `UserNaverEntity`로 변환하는 헬퍼를 제공해 서비스 단의 보일러플레이트를 줄입니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/user/naver/dto/response/ResUserNaverDTOApiV1.java`  
  저장된 네이버 계정 정보를 응답 구조에 맞춰 변환합니다. 클라이언트가 현재 등록된 계정을 확인할 때 사용합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/user/naver/dto/response/ResUserNaverStatusDTOApiV1.java`  
  사용자의 네이버 계정 등록 여부(`exists`)만 필요한 가벼운 조회 응답을 정의합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/user/naver/service/UserNaverServiceApiV1.java`  
  사용자 검증, 중복 등록 차단, DTO ↔ 엔티티 매핑, 응답 래핑을 담당하는 서비스 계층입니다. 저장 시 암호화 컨버터가 적용된 `UserNaverEntity`를 사용합니다.

## User Naver Persistence
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/user/naver/entity/UserNaverEntity.java`  
  사용자와 1:N 관계로 네이버 계정 정보를 보관하는 엔티티입니다. `TextEncryptorAttributeConverter`를 통해 `naverPw`를 암호화 저장하며, 생성/수정 시각을 자동 기록합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/user/naver/repository/UserNaverRepository.java`  
  네이버 계정 CRUD를 위한 JPA 리포지토리입니다. 사용자 ID 기반 조회/존재 여부 체크 메서드를 제공합니다.
- **Updated** `src/main/java/kr/co/nomadlab/nomadrank/model/user/entity/UserEntity.java`  
  사용자 엔티티에 Hibernate `@Comment`를 추가해 스키마 주석을 명확히 하고, 새 네이버 계정 기능에서 연관관계의 기준이 됩니다.

## Nplace Reply Feature
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/nplace/reply/controller/NplaceReplyControllerApiV1.java`  
  세션 기반 인증을 확인한 뒤 댓글 ON/OFF 제어, 목록 조회, 삭제 요청을 서비스에 위임하는 REST 컨트롤러입니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/nplace/reply/dto/request/ReqNplaceReplyChangeNplaceReplyDTOApiV1.java`  
  댓글 토글 요청 정보를 보관하고 `NplaceReplyEntity` 및 Pumpingstore 연동 DTO(`ReqPumpingstorePost/PutSellerNvidDTO`)로 변환하는 역할을 수행합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/nplace/reply/dto/response/ResNplaceReplyListDTOApiV1.java`  
  사용자별 등록된 Nplace 댓글 상태 목록을 단순한 리스트 구조로 직렬화하는 응답 DTO입니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/domain/nplace/reply/service/NplaceReplyServiceApiV1.java`  
  사용자/네이버 계정 검증, Pumpingstore API 호출, 엔티티 영속화, 상태 변경 로그 기록 및 삭제 시 정리 작업을 트랜잭션으로 처리합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reply/entity/NplaceReplyEntity.java`  
  사용자-플레이스 댓글 제어 상태를 보관하는 엔티티입니다. `toNplaceReplyLogEntity`로 변경 로그 생성을 돕습니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reply/entity/NplaceReplyLogEntity.java`  
  댓글 활성화 상태 변화 이력을 남기는 감사 로그 엔티티입니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reply/repository/NplaceReplyRepository.java`  
  사용자 ID 기준으로 댓글 제어 엔티티를 조회하는 리포지토리입니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reply/repository/NplaceReplyLogRepository.java`  
  댓글 로그 삭제/저장을 담당하며, Nplace Reply 삭제 시 연관 로그를 정리합니다.

## Pumpingstore Integration Layer
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model_external/pumpingstore/dto/request/ReqPumpingstorePostSellerNvidDTO.java` / `ReqPumpingstorePutSellerNvidDTO.java` / `ReqPumpingstoreDeleteSellerNvidDTO.java`  
  Pumpingstore 서버와 연동하기 위한 요청 VO들입니다. 네이버 아이디·비밀번호·플레이스 ID·활성화 여부 등을 API 스펙에 맞춰 직렬화합니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model_external/pumpingstore/dto/response/ResPumpingstorePostSellerNvidDTO.java` / `ResPumpingstorePutSellerNvidDTO.java` / `ResPumpingstoreDeleteSellerNvidDTO.java`  
  Pumpingstore 응답(JSON)을 그대로 반영하여 상태 코드, 메시지, `sellerNvid` 결과를 담습니다.
- **New** `src/main/java/kr/co/nomadlab/nomadrank/model_external/pumpingstore/repository/PumpingstoreReplyRepository.java`  
  Pumpingstore REST API 호출을 담당하는 어댑터입니다. 서버 IP/API 키를 주입받아 등록/수정/삭제 엔드포인트를 호출하며, 오류 코드를 Nomadscrap 예외로 변환합니다.

## Domain Adjustments
- **Updated** `src/main/java/kr/co/nomadlab/nomadrank/domain/nplace/rank/service/NplaceServiceApiV1.java`  
  Nomadscrap 트랙 삭제 시 이미 삭제된 추적 정보를 Graceful 하게 처리하도록 `NomadscrapException` 메시지를 검사하고, DB 정리 로직을 추가했습니다.
- **Updated** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reward/place/entity/NplaceRewardShopKeywordRegisterEntity.java`  
  사용하지 않는 import를 제거하고 표준 JPA/Hibernate 애노테이션 정렬을 맞춰 스키마 정의를 명확히 했습니다.
- **Updated** `src/main/java/kr/co/nomadlab/nomadrank/model/nplace/reward/place/entity/NplaceRewardShopKeywordRegisterStatusLogEntity.java`  
  위와 동일하게 import/애노테이션 구성을 정리해 엔티티 정의를 일관성 있게 유지합니다.

## Configuration
- **Updated** `src/main/resources/application.yml`  
  `encryption.active-key`와 키 정보를 추가해 암호화 서비스가 사용할 키 버전을 설정합니다.
- **Updated** `src/main/resources/application-dev.yml` / `application-prod.yml`  
  Pumpingstore 서버 IP와 REST API 키를 환경별 프로퍼티에 등록해 외부 연동이 동작하도록 했습니다.

이 문서는 신규 기능과 관련된 파일 구조를 빠르게 이해해야 하는 개발자를 대상으로 하며, 이후 기능 확장 시 동일 형식으로 추가 파일을 설명하면 변경 추적에 도움이 됩니다.

---

## 초보 개발자를 위한 전체 흐름 설명

### 큰 그림
Nplace 댓글 제어 + Pumpingstore 연동은 “내 서비스 → Pumpingstore → 네이버”라는 3계층 구조로 이해하면 쉽습니다.  
우리 서버가 네이버 계정을 안전하게 저장해 두고, 필요할 때 Pumpingstore에게 “이 상점 댓글 ON/OFF 해줘”라고 요청하면 Pumpingstore가 실제 네이버 페이지를 조작합니다.

### 1. 왜 암호화가 필요한가?
네이버 ID/PW를 절대 평문으로 DB에 넣으면 안 됩니다. 그래서 DB에 쓰기 전에 자동으로 암호화하고, 읽을 때 자동 복호화가 필요합니다.

| 파일 | 쉬운 비유 |
| --- | --- |
| `EncryptionProperties` | 암호화 키 목록을 기억하는 설정 노트 |
| `EncryptionConfig` | 설정된 키로 Encryptor를 만들어 주는 공장 |
| `EncryptionService` | 문자열을 실제로 암·복호화하는 작업자 |
| `TextEncryptorAttributeConverter` | DB ↔ 엔티티 사이를 지나면서 자동으로 암·복호화를 적용하는 컨버터 |

핵심 포인트: 개발자가 별도로 암호화 코드를 호출하지 않아도 `UserNaverEntity.naverPw`는 항상 암호화된 상태로 저장됩니다.  
이 구조는 보안 규정 대응, 키 회전, 개발 생산성 측면에서 필수입니다.

### 2. 네이버 계정 관리(User Naver) 파트
“댓글 자동화에 쓸 네이버 계정을 등록·관리하는 전체 기능”을 담당합니다.

| 파일 | 초보자용 설명 |
| --- | --- |
| `UserNaverControllerApiV1` | “네이버 계정 등록/조회/수정해줘” 요청을 받는 입구 |
| `ReqUserNaverDTOApiV1` | 네이버 ID/PW를 서버로 보낼 때 쓰는 요청 포맷 |
| `ResUserNaverDTOApiV1` | 저장된 계정을 클라이언트에 돌려줄 때 쓰는 응답 포맷 |
| `ResUserNaverStatusDTOApiV1` | “등록되어 있나요?”만 확인할 때 true/false만 주는 응답 |
| `UserNaverServiceApiV1` | 중복 등록 방지, 암호화 저장, CRUD를 처리하는 비즈니스 로직 |
| `UserNaverEntity` | 실제 DB 테이블. `naverPw`는 자동 암호화 |
| `UserNaverRepository` | 위 엔티티를 JPA로 다루는 CRUD 리포지토리 |

핵심: 댓글 자동화를 쓰려면 네이버 계정이 필요하고, 그 계정을 안전하게 맡아주는 전담 구조가 여기에 모여 있습니다.

### 3. Nplace 댓글 제어(Nplace Reply) 파트
네이버 플레이스 댓글의 ON/OFF 스위치를 우리 서비스에서 조작하는 기능입니다.

| 파일 | 쉬운 설명 |
| --- | --- |
| `NplaceReplyControllerApiV1` | 댓글 ON/OFF 요청을 받는 입구 |
| `ReqNplaceReplyChangeNplaceReplyDTOApiV1` | 요청을 엔티티나 Pumpingstore 포맷으로 바꿔주는 DTO |
| `ResNplaceReplyListDTOApiV1` | 사용자 댓글 상태 리스트를 만들어 주는 응답 |
| `NplaceReplyServiceApiV1` | 네이버 계정 확인 → Pumpingstore 호출 → DB 저장 → 로그 생성까지 책임지는 서비스 |
| `NplaceReplyEntity` | 현재 댓글 설정 상태를 저장하는 엔티티 |
| `NplaceReplyLogEntity` | ON/OFF 변화 이력을 남기는 로그 엔티티 |
| `NplaceReplyRepository` / `NplaceReplyLogRepository` | 각각 설정/로그 테이블을 다루는 리포지토리 |

한 줄 요약: 저장해둔 네이버 계정으로 네이버 댓글 설정을 자동 제어하고, 그 결과를 우리 DB에 기록합니다.

### 4. Pumpingstore Integration
네이버는 댓글 ON/OFF를 위한 공식 API를 제공하지 않으므로, 실제 클릭을 대신해 주는 외부 자동화 서버(Pumpingstore)를 사용합니다.

| 파일 | 쉬운 설명 |
| --- | --- |
| `ReqPumpingstorePost/Put/DeleteSellerNvidDTO` | Pumpingstore에 “이 계정으로 댓글 켜줘/꺼줘/삭제해줘”를 전달할 때 쓰는 요청 포맷 |
| `ResPumpingstorePost/Put/DeleteSellerNvidDTO` | Pumpingstore가 돌려주는 JSON 응답을 담는 객체 |
| `PumpingstoreReplyRepository` | 외부 REST 호출을 담당하는 어댑터. IP와 API KEY를 붙여서 Pumpingstore에 요청 |

흐름: NomadRank 서버 → Pumpingstore → 네이버. Pumpingstore는 말 그대로 “네이버 댓글을 자동으로 클릭해주는 로봇 서버”입니다.

### 5. 도메인 보강 & 설정
- `application.yml` + 프로필별 yml: 암호화 키와 Pumpingstore IP/API KEY 설정
- `NplaceServiceApiV1` 등: Nomadscrap 삭제 시 예외 처리 개선

환경 설정이 있어야 기능이 실제로 동작하며, 프로퍼티에 API KEY를 정확히 넣어야 외부 연동이 성공합니다.

### 완전 핵심 요약
1. **네이버 계정 저장**: 암호화 인프라 덕분에 안전하게 보관.
2. **댓글 제어**: 우리 서비스에서 네이버 댓글 ON/OFF 스위치를 직접 다룰 수 있음.
3. **Pumpingstore**: 네이버에 대신 접속해 실제 행동을 수행하는 외부 자동화 서버.
4. **연결 고리**: 우리 서버가 계정+플레이스 정보를 준비 → Pumpingstore 호출 → 결과 저장 및 로그 기록.

### 추가로 도울 수 있는 것
필요하다면 다음 자료도 확장 가능합니다.
1. Swimlane ASCII 다이어그램으로 전체 시퀀스 묘사
2. 온보딩용 “한 장 요약” 템플릿
3. 신규 개발자용 점검 체크리스트
4. 기능 확장 시 필요한 테이블/엔티티 구조 가이드
5. API 요청/응답 전용 문서 템플릿

필요한 형식을 알려주면 이어서 정리해 드릴 수 있습니다.
