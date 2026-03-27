import {
  Sparkles,
  Layers,
  Timer,
  MapPin,
  LineChart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingAltPage() {
  return (
    <div className="page alt">
      <header className="nav minimal">
        <div className="container nav-inner">
          <div className="brand">D-PLOG LABS</div>
          <div className="nav-actions">
            <button className="btn btn-ghost">기존 고객 로그인</button>
            <button className="btn btn-primary">상담 신청</button>
          </div>
        </div>
      </header>

      <main>
        <section className="section hero alt-hero">
          <div className="container stack gap-lg center">
            <span className="eyebrow">AI PERSONALIZATION LANDING</span>
            <h1>당신의 매장 데이터를 읽고, 맞춤 전략을 설계합니다</h1>
            <p className="lead">
              산업별 벤치마크와 경쟁 매장 데이터를 결합해 최적화된 성장 로드맵을 제안합니다.
            </p>
            <div className="actions center">
              <button className="btn btn-primary btn-lg">
                맞춤 리포트 생성 <ArrowRight className="icon" />
              </button>
              <button className="btn btn-secondary btn-lg">샘플 리포트 보기</button>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container grid grid-4">
            <div className="metric-card">
              <Timer className="icon" />
              <div className="metric-value">4분</div>
              <div className="muted">진단 생성 평균</div>
            </div>
            <div className="metric-card">
              <MapPin className="icon" />
              <div className="metric-value">120K+</div>
              <div className="muted">매장 데이터</div>
            </div>
            <div className="metric-card">
              <LineChart className="icon" />
              <div className="metric-value">78%</div>
              <div className="muted">상위 5위권 진입</div>
            </div>
            <div className="metric-card">
              <ShieldCheck className="icon" />
              <div className="metric-value">99.2%</div>
              <div className="muted">데이터 정확도</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div className="stack gap-md">
              <span className="eyebrow">설계 방식</span>
              <h2>AI가 시장과 경쟁을 읽고 바로 실행 가능한 전략을 생성</h2>
              <p className="muted">
                입력한 키워드와 매장 데이터를 기반으로 3단계 진단을 수행합니다.
              </p>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-title">시장 스코어링</div>
                    <p className="muted">지역/업종별 경쟁 강도와 트래픽 흐름을 분석합니다.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-title">매장 포지셔닝</div>
                    <p className="muted">리뷰/사진/메뉴 데이터를 비교해 차별 포인트를 찾습니다.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-title">실행 로드맵</div>
                    <p className="muted">2주 단위의 실행 체크리스트를 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="stack gap-md">
              <div className="card dashboard">
                <div className="dashboard-header">
                  <div>
                    <div className="panel-title">Growth Console</div>
                    <div className="panel-sub">맞춤형 전략 생성 중</div>
                  </div>
                  <div className="panel-badge">AI</div>
                </div>
                <div className="dashboard-list">
                  <div className="dashboard-row">
                    <Sparkles className="icon" />
                    <div>
                      <div className="panel-item-title">개인화 인사이트 8개</div>
                      <div className="panel-item-desc">리뷰 품질 개선 우선</div>
                    </div>
                  </div>
                  <div className="dashboard-row">
                    <Layers className="icon" />
                    <div>
                      <div className="panel-item-title">경쟁 포지셔닝 맵</div>
                      <div className="panel-item-desc">상위 5개 매장 비교 완료</div>
                    </div>
                  </div>
                  <div className="dashboard-row">
                    <Timer className="icon" />
                    <div>
                      <div className="panel-item-title">실행 일정</div>
                      <div className="panel-item-desc">2주 실행 플랜 자동 생성</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3>추천 시작 시점</h3>
                <p className="muted">가장 빠른 개선 효과를 위해 주간 단위로 진단을 반복하세요.</p>
                <button className="btn btn-secondary">주간 진단 예약</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container stack gap-xl center">
            <span className="eyebrow">CTA</span>
            <h2>지금 데이터 기반 성장을 시작하세요</h2>
            <p className="muted">전담 컨설턴트와 함께 진단 결과를 실행까지 연결합니다.</p>
            <button className="btn btn-primary btn-lg">
              1:1 컨설팅 신청 <ArrowRight className="icon" />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand">D-PLOG LABS</div>
            <p className="muted">AI 기반 로컬 마케팅 분석 플랫폼</p>
          </div>
          <div className="footer-links">
            <a href="#">문의하기</a>
            <a href="#">채용</a>
            <a href="#">파트너</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
