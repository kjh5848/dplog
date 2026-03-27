# 📦 상태관리 통합 가이드

## 🏗️ 아키텍처 개요

이 프로젝트는 **도메인 중심의 상태관리** 패턴을 사용합니다. 각 도메인별로 독립적인 상태를 관리하며, 필요에 따라 상태를 공유할 수 있습니다.

## 📁 폴더 구조

```
src/store/
├── docs/                    # 📚 상태관리 문서
│   ├── STATE_MANAGEMENT_GUIDE.md
│   ├── MIGRATION_GUIDE.md
│   └── STORE_PATTERNS.md
├── stores/                  # 🏪 도메인별 상태관리
│   ├── auth/
│   │   ├── useAuthStore.ts
│   │   └── types.ts
│   ├── search/
│   │   ├── useSearchStore.ts
│   │   └── types.ts
│   ├── view/
│   │   ├── useViewModeStore.ts
│   │   └── types.ts
│   └── track/
│       ├── useTrackGridStore.ts
│       └── types.ts
├── providers/               # 🔌 프로바이더
│   ├── QueryProviders.tsx
│   └── StoreProvider.tsx
├── types/                   # 📝 공통 타입
│   ├── index.ts
│   └── common.ts
└── utils/                   # 🛠️ 유틸리티
    ├── storage.ts
    └── validation.ts
```

## 🎯 상태관리 원칙

### 1. 도메인 분리
- 각 도메인은 독립적인 상태를 가집니다
- 도메인 간 의존성을 최소화합니다
- 명확한 책임 분리를 유지합니다

### 2. 상태 영속성
- 중요한 상태는 localStorage에 저장합니다
- `persist` 미들웨어를 통한 자동 저장/복원
- 브라우저 새로고침 후에도 상태 유지

### 3. 타입 안전성
- 모든 상태와 액션은 TypeScript로 타입 정의
- 각 스토어별 타입 파일 분리
- 런타임 타입 검증 추가

### 4. 성능 최적화
- 선택적 상태 구독 (selector 패턴)
- 불필요한 리렌더링 방지
- 상태 업데이트 최적화

## 🏪 도메인별 상태관리

### 🔐 인증 상태 (Auth)
```typescript
// stores/auth/useAuthStore.ts
interface AuthState {
  loginUser: LoginUser | null;
  isAuthPending: boolean;
  isLogoutPending: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forceRecheck: () => Promise<void>;
}
```

### 🔍 검색 상태 (Search)
```typescript
// stores/search/useSearchStore.ts
interface SearchState {
  searchValue: string;
  recentSearches: string[];
  searchFilters: SearchFilters;
  setSearchValue: (value: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}
```

### 👁️ 뷰 모드 상태 (View)
```typescript
// stores/view/useViewModeStore.ts
interface ViewModeState {
  globalViewMode: ViewMode;
  pageViewModes: Record<string, ViewMode>;
  keywordViewModes: Record<string, Record<string, ViewMode>>; // 🆕 키워드별 뷰 모드
  
  setGlobalViewMode: (mode: ViewMode) => void;
  setPageViewMode: (page: string, mode: ViewMode) => void;
  setKeywordViewMode: (shopId: string, keyword: string, mode: ViewMode) => void; // 🆕
  getKeywordViewMode: (shopId: string, keyword: string) => ViewMode; // 🆕
  resetKeywordViewMode: (shopId: string, keyword?: string) => void; // 🆕
}
```

### 📊 트랙 그리드 상태 (Track)
```typescript
// stores/track/useTrackGridStore.ts
interface TrackGridState {
  viewMode: "grid" | "report";
  mobileColumns: number;
  desktopColumns: number;
  setViewMode: (mode: "grid" | "report") => void;
  setMobileColumns: (columns: number) => void;
  setDesktopColumns: (columns: number) => void;
  getCurrentColumns: (isMobile: boolean) => number;
  toggleViewMode: () => void;
}
```

## 🔧 사용 패턴

### 기본 사용법
```typescript
// ✅ 권장: 필요한 상태만 선택
const { loginUser, logout } = useAuthStore();

// ❌ 비권장: 전체 상태 구독
const authStore = useAuthStore();
```

### 선택적 구독
```typescript
// 특정 상태만 구독하여 성능 최적화
const loginUser = useAuthStore(state => state.loginUser);
const isLoggedIn = useAuthStore(state => !!state.loginUser);
```

### 🆕 키워드별 뷰 모드 사용 예시
```typescript
// 키워드별 독립적인 뷰 모드 관리
import { useViewModeStore } from '@/store/stores/view/useViewModeStore';

function TrackKeywordComponent({ shopId, keyword }) {
  const { getKeywordViewMode, setKeywordViewMode } = useViewModeStore();
  
  // 특정 키워드의 뷰 모드 가져오기
  const viewMode = getKeywordViewMode(shopId, keyword);
  
  // 키워드별 뷰 모드 변경
  const handleViewModeChange = (mode: ViewMode) => {
    setKeywordViewMode(shopId, keyword, mode);
  };
  
  return (
    <div>
      <button onClick={() => handleViewModeChange('grid')}>
        그리드 뷰
      </button>
      <button onClick={() => handleViewModeChange('report')}>
        리포트 뷰
      </button>
      
      {viewMode === 'grid' ? <GridView /> : <ReportView />}
    </div>
  );
}
```

### TrackGridView 사용 예시
```typescript
// 🔄 새로운 방식
import { useTrackGridStore } from '@/store/stores/track/useTrackGridStore';

function TrackGridComponent() {
  const { 
    getCurrentColumns, 
    setMobileColumns, 
    getTextSize 
  } = useTrackGridStore();
  
  const gridColumns = getCurrentColumns(isMobile);
  const textSizeClass = getTextSize(isMobile, gridColumns);
  
  return (
    <div className={`${textSizeClass} font-semibold`}>
      {/* 내용 */}
    </div>
  );
}
```

## 🚀 마이그레이션 가이드

### 기존 코드 → 새로운 구조
```typescript
// ❌ 기존 방식
import useAuthStoreLocal from '@/store/useAuthStoreLocal';

// ✅ 새로운 방식
import { useAuthStore } from '@/store/stores/auth/useAuthStore';
```

### Props Drilling 해결
```typescript
// ❌ 기존: props로 전달
function Parent({ viewMode, setViewMode }) {
  return <Child viewMode={viewMode} setViewMode={setViewMode} />;
}

// ✅ 새로운: 직접 상태 사용
function Child() {
  const { viewMode, setViewMode } = useTrackGridStore();
  return <div>{viewMode}</div>;
}
```

### 🆕 키워드별 뷰 모드 마이그레이션
```typescript
// ❌ 기존: 로컬 상태로 관리
function TrackKeywordContent({ viewMode, setViewMode }) {
  // 모든 키워드가 동일한 뷰 모드 공유
  return <div>{viewMode}</div>;
}

// ✅ 새로운: 키워드별 독립 관리
function TrackKeywordContent({ shopId }) {
  const { getKeywordViewMode, setKeywordViewMode } = useViewModeStore();
  
  return (
    <>
      {keywords.map(keyword => {
        const keywordViewMode = getKeywordViewMode(shopId, keyword);
        return (
          <div key={keyword}>
            {/* 각 키워드마다 독립적인 뷰 모드 */}
            {keywordViewMode === 'grid' ? <Grid /> : <Report />}
          </div>
        );
      })}
    </>
  );
}
```

## 📋 구현 체크리스트

### ✅ 완료된 작업
- [x] 통합 상태관리 시스템 설계
- [x] 디렉토리 구조 정의
- [x] 모든 스토어 타입 정의
- [x] 4개 도메인 스토어 구현
- [x] TrackGridViewV4 마이그레이션 적용
- [x] 유틸리티 함수 생성
- [x] 공통 타입 정의
- [x] **키워드별 뷰 모드 관리 기능 추가** 🆕
- [x] **TrackKeywordContent 키워드별 상태 적용** 🆕
- [x] **TrackDetailClientPage 프롭스 정리** 🆕

### ⏳ 추가 작업 필요
- [ ] 다른 컴포넌트 마이그레이션
  - TrackReportView.tsx
- [ ] 기존 import 문 업데이트
- [ ] 테스트 및 검증
- [ ] 문서 업데이트

## 🆕 키워드별 뷰 모드 기능

### 특징
- **독립성**: 각 키워드마다 다른 뷰 모드(grid/report) 설정 가능
- **영속성**: 브라우저 새로고침 후에도 키워드별 설정 유지
- **자동 분류**: shopId와 keyword를 조합하여 자동 분류

### 사용 사례
```
키워드 "맛집"    → grid 뷰
키워드 "카페"    → report 뷰  
키워드 "술집"    → grid 뷰
키워드 "디저트"  → report 뷰
```

### 저장 구조
```typescript
keywordViewModes: {
  "shop123": {
    "맛집": "grid",
    "카페": "report", 
    "술집": "grid"
  },
  "shop456": {
    "디저트": "report"
  }
}
```

## 🔍 디버깅 가이드

### 상태 로깅
```typescript
// 개발 환경에서 상태 변화 추적
const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... 상태 정의
      }),
      { name: 'auth-store' }
    ),
    { name: 'AuthStore' }
  )
);
```

### 일반적인 문제 해결
1. **상태가 초기화되는 경우**: persist 설정 확인
2. **리렌더링 과다**: selector 패턴 사용
3. **타입 오류**: 타입 정의 파일 확인
4. **상태 동기화 문제**: 의존성 배열 점검
5. **키워드 뷰 모드 저장 안됨**: shopId와 keyword 값 확인

## 📚 참고 자료

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [React Query 가이드](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 변경 이력

| 날짜 | 변경 사항 | 작성자 |
|------|-----------|--------|
| 2024-01-XX | 통합 상태관리 시스템 구축 | AI Assistant |
| 2024-01-XX | TrackGrid 상태관리 추가 | AI Assistant | 
| 2024-01-XX | **키워드별 뷰 모드 관리 기능 추가** �� | AI Assistant | 