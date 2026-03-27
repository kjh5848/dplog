import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisConfirmPage() {
  return (
    <DiagnosisShell
      title="요청 요약 확인"
      subtitle="입력한 정보를 확인하고 진단을 요청하세요."
      stepIndex={2}
    >
      <div className="card">
        <div className="summary-grid">
          <div>
            <div className="summary-label">매장명</div>
            <div className="summary-value">홍대 카페 D</div>
          </div>
          <div>
            <div className="summary-label">대표 키워드</div>
            <div className="summary-value">홍대 카페, 디저트 카페</div>
          </div>
          <div>
            <div className="summary-label">희망 키워드</div>
            <div className="summary-value">브런치 카페, 예약 카페</div>
          </div>
          <div>
            <div className="summary-label">분석 범위</div>
            <div className="summary-value">경쟁 매장 5개</div>
          </div>
        </div>
      </div>
      <div className="form-actions right">
        <button className="btn btn-secondary">이전</button>
        <button className="btn btn-primary">진단 요청</button>
      </div>
    </DiagnosisShell>
  );
}
