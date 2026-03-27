import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisStartPage() {
  return (
    <DiagnosisShell
      title="새 진단 시작"
      subtitle="매장 정보를 입력하면 즉시 분석이 시작됩니다."
      stepIndex={0}
    >
      <div className="grid grid-2">
        <div className="card">
          <h3>매장 URL 입력</h3>
          <p className="muted">네이버 플레이스 URL 또는 매장명을 입력하세요.</p>
          <input className="input" placeholder="예) https://place.naver.com/" />
          <button className="btn btn-primary btn-lg">다음 단계</button>
        </div>
        <div className="card">
          <h3>진단에 포함되는 항목</h3>
          <ul className="list">
            <li>검색 노출 순위 및 변동</li>
            <li>경쟁 매장 대비 콘텐츠</li>
            <li>핵심 키워드 커버리지</li>
            <li>실행 체크리스트</li>
          </ul>
          <div className="info-box">
            평균 4~5분 내 리포트가 생성됩니다.
          </div>
        </div>
      </div>
    </DiagnosisShell>
  );
}
