import DiagnosisShell from "./DiagnosisShell";

export default function DiagnosisResultPage() {
  return (
    <DiagnosisShell
      title="진단 결과 요약"
      subtitle="실행 가능한 개선 항목을 확인하세요."
      stepIndex={3}
    >
      <div className="grid grid-2">
        <div className="card">
          <h3>핵심 인사이트</h3>
          <ul className="list">
            <li>리뷰 품질 개선 우선 순위 높음</li>
            <li>메뉴 사진 업데이트 필요</li>
            <li>상위 키워드 3개 추가 확보 가능</li>
          </ul>
        </div>
        <div className="card">
          <h3>다음 액션</h3>
          <ol className="list ordered">
            <li>리뷰 요청 플로우 개선</li>
            <li>대표 이미지 5장 교체</li>
            <li>키워드 태그 재정비</li>
          </ol>
        </div>
      </div>
      <div className="form-actions right">
        <button className="btn btn-secondary">리포트 다운로드</button>
        <button className="btn btn-primary">상세 리포트 보기</button>
      </div>
    </DiagnosisShell>
  );
}
