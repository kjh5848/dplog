import { redirect } from "next/navigation";
import TrackClientPage from "@/src/components/nplrace/rank/track/TrackClientPage";
export const metadata = {
  title: "순위 추적",
};
export default async function TrackPage() {
  // 인증된 사용자만 클라이언트 컴포넌트 렌더링
  return <TrackClientPage />;
}
