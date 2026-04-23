"use client";
import { useEffect } from "react";

export default function SingleInstanceGuard() {
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("dplog-app-channel");
      
      // 새로 창이 열리면 기존 창들에게 "내가 새로 켜졌어, 너희는 닫혀" 라고 방송합니다.
      // 약간의 지연을 주어 기존 창들이 메시지를 받을 시간을 확보합니다.
      setTimeout(() => {
        channel.postMessage("new-instance");
      }, 500);

      // 다른 창에서 "내가 새로 켜졌어" 라는 방송이 오면 이 창을 닫습니다.
      channel.onmessage = (event) => {
        if (event.data === "new-instance") {
          window.close();
        }
      };

      return () => channel.close();
    } catch (e) {
      console.error("BroadcastChannel error:", e);
    }
  }, []);

  return null;
}
