export function NotFoundPage() {
  return (
    <div className="page">
      <main className="section">
        <div className="container stack gap-lg center">
          <span className="eyebrow">404</span>
          <h2>페이지를 찾을 수 없습니다</h2>
          <p className="muted">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
          <a className="btn btn-primary" href="/">
            홈으로 이동
          </a>
        </div>
      </main>
    </div>
  );
}
