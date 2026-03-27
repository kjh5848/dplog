import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisStatusPage() {
  return (
    <DiagnosisShell
      title="진단 진행 중"
      subtitle="현재 데이터를 수집하고 있습니다. 잠시만 기다려 주세요."
      stepIndex={3}
    >
      <div className="card status">
        <div className="status-bar">
          <div className="status-fill" />
        </div>
        <div className="status-steps">
          <div className="status-item">데이터 수집</div>
          <div className="status-item active">경쟁 분석</div>
          <div className="status-item">리포트 생성</div>
        </div>
        <div className="info-box">
          평균 4~5분 내 결과가 준비됩니다. 이 페이지는 자동으로 업데이트됩니다.
        </div>
      </div>
    </DiagnosisShell>
  );
}
