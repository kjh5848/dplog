export default function LoginLoading() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-rank-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">로그인 페이지 로딩 중...</p>
      </div>
    </div>
  );
}

