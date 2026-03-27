import { Metadata } from 'next';
import SessionManagement from '@/src/components/session/SessionManagement';

export const metadata = {
  title: "세션관리",
};

export default function SessionPage() {
  return <SessionManagement />;
}
