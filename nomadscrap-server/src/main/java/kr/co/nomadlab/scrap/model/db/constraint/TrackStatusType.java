package kr.co.nomadlab.scrap.model.db.constraint;

public enum TrackStatusType {
    WAIT, // 추적 대기
    WAIT_AGAIN, // 재추적 대기
    COMPLETE, // 추적 완료
//    REJECT // 백업 예정
}
