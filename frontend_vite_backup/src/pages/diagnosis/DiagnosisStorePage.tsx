import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisStorePage() {
  return (
    <DiagnosisShell
      title="매장 정보 입력"
      subtitle="매장 기본 정보를 입력해 진단 정확도를 높이세요."
      stepIndex={0}
    >
      <div className="card form">
        <div className="form-row">
          <label>매장명</label>
          <input className="input" placeholder="예) 홍대 카페 D" />
        </div>
        <div className="form-row">
          <label>주소</label>
          <input className="input" placeholder="예) 서울 마포구 ..." />
        </div>
        <div className="form-row">
          <label>대표 카테고리</label>
          <input className="input" placeholder="예) 카페 / 디저트" />
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary">이전</button>
          <button className="btn btn-primary">다음</button>
        </div>
      </div>
    </DiagnosisShell>
  );
}
