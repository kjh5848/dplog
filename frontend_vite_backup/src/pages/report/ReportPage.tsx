export default function ReportPage() {
  return (
    <div className="page">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">D-PLOG</div>
          <div className="nav-actions">
            <button className="btn btn-ghost">리포트 목록</button>
            <button className="btn btn-secondary">공유</button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="container stack gap-xl">
          <div className="section-head">
            <span className="eyebrow">Report</span>
            <h2>2026년 2월 진단 리포트</h2>
            <p className="muted">매장 성과 요약과 실행 우선순위를 제공합니다.</p>
          </div>

          <div className="grid grid-3">
            <div className="card">
              <div className="stat-value">#3</div>
              <div className="muted">현재 순위</div>
            </div>
            <div className="card">
              <div className="stat-value">86%</div>
              <div className="muted">키워드 커버리지</div>
            </div>
            <div className="card">
              <div className="stat-value">+5</div>
              <div className="muted">전주 대비 순위</div>
            </div>
          </div>

          <div className="card">
            <h3>핵심 액션</h3>
            <ul className="list">
              <li>대표 사진 5장 교체</li>
              <li>리뷰 질문 템플릿 업데이트</li>
              <li>주요 키워드 3개 강화 콘텐츠 추가</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
