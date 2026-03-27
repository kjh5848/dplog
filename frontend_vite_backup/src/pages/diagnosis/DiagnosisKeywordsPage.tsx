import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisKeywordsPage() {
  return (
    <DiagnosisShell
      title="키워드 입력"
      subtitle="대표 키워드와 성장시키고 싶은 키워드를 구분하세요."
      stepIndex={1}
    >
      <div className="grid grid-2">
        <div className="card form">
          <label>대표 키워드</label>
          <input className="input" placeholder="예) 홍대 카페" />
          <input className="input" placeholder="예) 디저트 카페" />
        </div>
        <div className="card form">
          <label>희망 키워드</label>
          <input className="input" placeholder="예) 브런치 카페" />
          <input className="input" placeholder="예) 예약 카페" />
        </div>
      </div>
      <div className="form-actions right">
        <button className="btn btn-secondary">이전</button>
        <button className="btn btn-primary">다음</button>
      </div>
    </DiagnosisShell>
  );
}
