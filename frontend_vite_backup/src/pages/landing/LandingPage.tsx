import { ArrowRight, BarChart3, Target, Radar, LineChart, ShieldCheck, Search } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="page">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">D-PLOG</div>
          <nav className="nav-links">
            <a href="#features">기능</a>
            <a href="#process">진단 프로세스</a>
            <a href="#proof">성과</a>
            <a href="#pricing">요금</a>
          </nav>
          <div className="nav-actions">
            <button className="btn btn-ghost">로그인</button>
            <button className="btn btn-primary">무료 체험</button>
          </div>
        </div>
      </header>

      <main>
        <section className="section hero">
          <div className="container hero-grid">
            <div className="stack gap-lg">
              <span className="eyebrow">Local SEO Intelligence</span>
              <h1>
                매장 순위를 올리는 가장 빠른 방법,
                <br />
                <span className="text-primary">데이터 기반 진단</span>
              </h1>
              <p className="lead">
                네이버 플레이스 순위, 경쟁 매장, 키워드 흐름을 한 번에 분석합니다.
                진단 결과로 바로 실행 가능한 개선 플랜을 제공합니다.
              </p>
              <div className="actions">
                <button className="btn btn-primary btn-lg">
                  지금 진단 시작 <ArrowRight className="icon" />
                </button>
                <button className="btn btn-secondary btn-lg">데모 보기</button>
              </div>
              <div className="meta">
                5분 안에 리포트 생성 · 카드 정보 불필요 · 언제든지 취소
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-card">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">D-PLOG 진단 스냅샷</div>
                    <div className="panel-sub">오늘 기준 변화 요약</div>
                  </div>
                  <div className="panel-badge">LIVE</div>
                </div>
                <div className="panel-stats">
                  <div className="stat">
                    <div className="stat-label">현재 순위</div>
                    <div className="stat-value">#3</div>
                    <div className="stat-meta">전주 대비 +5</div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">키워드 커버</div>
                    <div className="stat-value">86%</div>
                    <div className="stat-meta">상위 50개</div>
                  </div>
                </div>
                <div className="panel-list">
                  <div className="panel-item">
                    <Search className="icon" />
                    <div>
                      <div className="panel-item-title">핵심 키워드 포착</div>
                      <div className="panel-item-desc">상승 가능 키워드 12개 확보</div>
                    </div>
                  </div>
                  <div className="panel-item">
                    <Radar className="icon" />
                    <div>
                      <div className="panel-item-title">경쟁 분석 완료</div>
                      <div className="panel-item-desc">상위 5개 매장 데이터 비교</div>
                    </div>
                  </div>
                  <div className="panel-item">
                    <ShieldCheck className="icon" />
                    <div>
                      <div className="panel-item-title">리스크 체크</div>
                      <div className="panel-item-desc">리뷰 품질 보완 포인트 2개</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container stack gap-xl">
            <div className="section-head">
              <span className="eyebrow">기능</span>
              <h2>순위 상승을 위한 핵심 데이터만 빠르게</h2>
              <p className="muted">
                분석, 모니터링, 실행 제안까지 한 번에 연결합니다.
              </p>
            </div>
            <div className="grid grid-3">
              <div className="card">
                <BarChart3 className="icon" />
                <h3>실시간 순위 추적</h3>
                <p className="muted">시간대별 변동과 경쟁 매장 흐름을 한눈에 확인합니다.</p>
              </div>
              <div className="card">
                <Target className="icon" />
                <h3>키워드 집중 분석</h3>
                <p className="muted">대표·희망 키워드를 구분해 우선순위를 정합니다.</p>
              </div>
              <div className="card">
                <LineChart className="icon" />
                <h3>성과 기반 개선 플랜</h3>
                <p className="muted">리뷰, 사진, 메뉴 개선을 즉시 실행 항목으로 제공합니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="section section-alt">
          <div className="container stack gap-xl">
            <div className="section-head">
              <span className="eyebrow">3-Step Funnel</span>
              <h2>진단 → 분석 → 실행으로 이어지는 프로세스</h2>
              <p className="muted">단계별로 필요한 정보만 입력하고 바로 결과를 확인합니다.</p>
            </div>
            <div className="grid grid-3">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3>문제 파악</h3>
                <p className="muted">매장 URL과 핵심 키워드를 입력합니다.</p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h3>해결 전략</h3>
                <p className="muted">경쟁 분석과 데이터 비교로 개선 포인트를 제안합니다.</p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h3>행동 플랜</h3>
                <p className="muted">실행 항목과 우선순위를 리포트로 제공합니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="section">
          <div className="container split">
            <div className="stack gap-md">
              <span className="eyebrow">성과</span>
              <h2>데이터 기반 개선으로 평균 4주 내 순위 상승</h2>
              <p className="muted">
                리포트 실행 항목을 적용한 매장 중 78%가 4주 안에 상위 5위권으로 상승했습니다.
              </p>
              <div className="proof-grid">
                <div className="proof-card">
                  <div className="proof-value">+21%</div>
                  <div className="muted">검색 노출 증가</div>
                </div>
                <div className="proof-card">
                  <div className="proof-value">+32%</div>
                  <div className="muted">전화 문의 증가</div>
                </div>
                <div className="proof-card">
                  <div className="proof-value">3.8x</div>
                  <div className="muted">리뷰 반응 개선</div>
                </div>
              </div>
            </div>
            <div className="quote">
              <p>
                "진단 리포트에 나온 작업을 그대로 실행했더니 3주 만에 2위까지 올라갔어요."
              </p>
              <div className="quote-meta">카페 운영자 · 서울</div>
            </div>
          </div>
        </section>

        <section id="pricing" className="section section-alt">
          <div className="container stack gap-xl">
            <div className="section-head">
              <span className="eyebrow">요금</span>
              <h2>필요한 만큼만 시작하고 성장하세요</h2>
              <p className="muted">진단 규모에 맞춰 선택할 수 있습니다.</p>
            </div>
            <div className="grid grid-3">
              <div className="card price">
                <div className="price-tier">Starter</div>
                <div className="price-value">₩29,000</div>
                <div className="muted">월간 진단 1회</div>
                <ul className="list">
                  <li>핵심 키워드 10개</li>
                  <li>경쟁 매장 3개 비교</li>
                  <li>기본 리포트 제공</li>
                </ul>
                <button className="btn btn-secondary">선택하기</button>
              </div>
              <div className="card price featured">
                <div className="price-tier">Growth</div>
                <div className="price-value">₩59,000</div>
                <div className="muted">월간 진단 4회</div>
                <ul className="list">
                  <li>키워드 30개 추적</li>
                  <li>경쟁 매장 10개 비교</li>
                  <li>실행 체크리스트 제공</li>
                </ul>
                <button className="btn btn-primary">가장 인기</button>
              </div>
              <div className="card price">
                <div className="price-tier">Scale</div>
                <div className="price-value">₩99,000</div>
                <div className="muted">멀티 매장 지원</div>
                <ul className="list">
                  <li>매장 5개 관리</li>
                  <li>팀 공유 리포트</li>
                  <li>전용 지원 채널</li>
                </ul>
                <button className="btn btn-secondary">문의하기</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section cta">
          <div className="container cta-inner">
            <div>
              <h2>오늘 바로 매장 순위를 진단해보세요</h2>
              <p className="muted">첫 리포트는 무료로 제공됩니다.</p>
            </div>
            <button className="btn btn-primary btn-lg">
              무료 진단 시작 <ArrowRight className="icon" />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand">D-PLOG</div>
            <p className="muted">Local SEO 인텔리전스로 매장을 성장시키세요.</p>
          </div>
          <div className="footer-links">
            <a href="#">이용약관</a>
            <a href="#">개인정보 처리방침</a>
            <a href="#">문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
