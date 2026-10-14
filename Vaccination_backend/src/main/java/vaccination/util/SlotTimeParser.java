package vaccination.util;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public final class SlotTimeParser {
    private static final DateTimeFormatter AM_PM_FORMATTER = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("h:mm a")
            .toFormatter(Locale.US);

    private SlotTimeParser() {
    }

    public static LocalTime parseStartTime(String timeRange) {
        if (timeRange == null || timeRange.isBlank()) {
            throw new DateTimeParseException("Slot time is required.", String.valueOf(timeRange), 0);
        }

        String[] range = timeRange.trim().split("\\s+[-–]\\s+", 2);
        return parse(range[0]);
    }

    public static LocalTime parse(String time) {
        String value = time.trim();
        try {
            return LocalTime.parse(value);
        } catch (DateTimeParseException exception) {
            return LocalTime.parse(value, AM_PM_FORMATTER);
        }
    }
}
