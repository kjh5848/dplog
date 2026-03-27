package kr.co.nomadlab.nomadrank.util;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 날짜/시간 포맷 유틸
 */
public final class DateTimeFormatUtils {

    private static final DateTimeFormatter MINUTE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private DateTimeFormatUtils() {
    }

    public static String formatToMinute(OffsetDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(MINUTE_FORMATTER);
    }
}
