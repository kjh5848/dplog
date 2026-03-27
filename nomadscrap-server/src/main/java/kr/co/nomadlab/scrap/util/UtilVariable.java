package kr.co.nomadlab.scrap.util;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class UtilVariable {

    // TODO dev 프로필로 사용 시 실서버와 겹치는 문제가 발생하기 때문에 yml이나 DB 등 다른 방법을 사용하는 것 연구 필요
//    public static BlockingQueue<String> proxyServerApiKeyQueue = new ArrayBlockingQueue<>(4) {{
//        add("0c810e3de018434fb2a8c31854131cd7");
//        add("bd0d3dfb1a464fe6afeeee51a292e2f2");
//    }};

    public static volatile BlockingQueue<String> proxyServerApiKeyQueue = new ArrayBlockingQueue<>(4) {{
        add("0c810e3de018434fb2a8c31854131cd7");
        add("bd0d3dfb1a464fe6afeeee51a292e2f2");
//        add("110e37a5ff8a4fa692ce621cad14d100"); // 테스트
    }};

    public static List<String> provinceList = List.of(
            "서울시", "부산시", "대구시", "인천시", "광주시", "대전시", "울산시", "세종시",
            "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주도"
    );

//    public static class MiniVpn {
//        public static final AtomicBoolean isEnable = new AtomicBoolean(true);
//
//    }

//    public static final Object lock = new Object();

//    public static final AtomicInteger tempVpnIndex = new AtomicInteger(new Random().nextInt(0, 25));
//
//    public static void rotateTempVpnIndex() {
//
//
//        if (UtilVariable.tempVpnIndex.get() >= 24) {
//            UtilVariable.tempVpnIndex.set(0);
//        } else {
//            UtilVariable.tempVpnIndex.set(UtilVariable.tempVpnIndex.get() + 1);
//        }
//    }

}
