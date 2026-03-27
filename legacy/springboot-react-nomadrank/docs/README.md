# 문서 인덱스 (2025-11-19 갱신)

## Auth (Kakao)
- `auth/2025-11-19_카카오_로그인_API.md` – 카카오 로그인 API 명세 및 엔드포인트 계약.
- `auth/2025-11-19_카카오_로그인_백엔드_요청.md` – 백엔드 연동 요청서, OAuth 처리와 세션 연계 요구사항.
- `auth/2025-11-19_카카오_로그인_플로우.md` – 카카오 로그인 UX/시퀀스 다이어그램.
- `auth/2025-11-19_카카오_싱크_도입계획.md` – 카카오 싱크 약관 동의 수집/검증 도입 단계.

## API Domain
- `api/2025-11-19_멤버십_API_명세서.md` – 멤버십 공개 API 통합 명세.
- `api/2025-11-19_PortOne_구독_API.md` – PortOne 구독 백엔드 API 설계.

## Membership Domain
- `membership/2025-11-19_현재_구독_API.md` – `/v1/membership/current` 응답 구조와 인증 요건.
- `membership/2025-11-19_무료플랜_자동가입_구현계획.md` – 무료 플랜 자동 가입 처리 플로우와 개발 체크리스트.
- `membership/2025-11-17_멤버십_업그레이드_정책.md` – 플랜/기간 업그레이드 정책과 사용량 초기화 규칙.
- `membership/2025-11-19_멤버십_사용량_요약.md` – MEMBERSHIP_USAGE 기본 설계 요약.
- `membership/2025-11-19_멤버십_사용량_전체명세.md` – MEMBERSHIP_USAGE 전체 스키마와 운영 명세.
- `membership/2025-11-19_프로필_요약_API_계획.md` – Profile Summary API 백엔드 흐름/DTO 정의.

## Payment Domain
- `payment/2025-11-19_PortOne_V2_API_명세서.md` – PortOne V2 빌링키 & 정기결제 API 호출 규격.
- `payment/2025-11-13_PortOne_정기결제_리팩터링.md` – 2025-11-13 PortOne 정기결제 리팩터링 계획.
- `payment/2025-11-13_PortOne_정기결제_리팩터링_V2.md` – 동일 날짜 실행 기록 & 후속 액션.
- `payment/2025-11-19_빌링키_해지_플로우.md` – 빌링키 구독 해지 처리 절차.
- `payment/2025-11-19_결제_보상_플로우.md` – 결제 보상(취소) 시나리오와 로깅 기준.
- `payment/2025-11-19_PortOne_빌링키_해지_백엔드계획.md` – 해지 백엔드 구현 계획.
- `payment/2025-11-19_PortOne_빌링키_해지_개발계획.md` – 개발 체크리스트/테스트 플랜.
- `payment/2025-11-19_정기결제_예약_정책.md` – 정기 결제 스케줄러 운영 정책.
- `payment/2025-11-19_환불_구독정책_백엔드.md` – 환불/구독 정책 백엔드 관점 정의.
- `payment/2025-11-19_환불_정책_검토.md` – 환불 정책 리뷰 메모.
- `payment/2025-11-19_구독_해지_백엔드_계획.md` – 구독 해지 백엔드 업데이트 플랜.
- `payment/2025-11-19_구독_다운그레이드_초안.md` – 다운그레이드 설계 초안.
- `payment/2025-11-19_구독_정책_및_환불.md` – 업/다운+환불 정책 종합 문서.
- `payment/2025-11-19_구독_환불_테스트_가이드.md` – 해지 환불 처리 및 테스트 가이드.

## Search & Data Products
- `search/2025-11-19_연관검색어_기능명세서.md` – 연관검색어 기능 정의와 데이터 파이프라인.

## Nplace & Reply
- `reply/2025-11-19_Nplace_Reply_파일_역할.md` – 네이버 계정 암호화, Nplace 댓글 제어, Pumpingstore 연동 구조와 초보자용 흐름 설명.
- `reply/2025-11-19_Nplace_Reply_암호화_키회전.md` – 네이버 계정 암호화·키 회전이 왜 필요한지와 AES 기반 양방향 암호화 구조를 초보자 시점에서 해설.
- `reply/2025-11-19_Nplace_Reply_API_흐름.md` – 프런트에서 호출해야 할 순서, 각 API의 요청/응답 예시, 예외 처리 팁을 정리한 가이드.
- `reply/2025-11-19_Nplace_Keyword_API_흐름.md` – 키워드 조회/연관 키워드 조회 API의 호출 순서, 요청/응답 샘플, 에러 패턴 및 체크리스트.

## SQL & Migration
- `sql/migrate_plan_to_membership.sql` – Plan → Membership 데이터 마이그레이션 스크립트.

> 날짜 접두사는 문서 작성/최종 갱신일이 명시된 경우 해당 일자를, 없는 경우 2025-11-19 기준 정리일을 사용했습니다.
