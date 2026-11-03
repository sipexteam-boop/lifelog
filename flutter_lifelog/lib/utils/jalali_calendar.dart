import 'persian_numbers.dart';

class JalaliDate {
  final int year;
  final int month;
  final int day;

  const JalaliDate(this.year, this.month, this.day);

  factory JalaliDate.fromDateTime(DateTime date) => JalaliCalendar.fromDateTime(date);

  String get monthName => JalaliCalendar.monthNamesFa[month - 1];

  @override
  String toString() => '$year/${month.toString().padLeft(2, '0')}/${day.toString().padLeft(2, '0')}';

  String toPersianString() => PersianNumbers.toPersian(toString());
}

class JalaliCalendar {
  static const List<String> monthNamesFa = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  static const List<String> weekdaysFa = [
    'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
  ];

  static const List<String> weekdaysShortFa = [
    'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
  ];

  static bool isLeapYear(int jy) {
    final r = ((jy - 474) % 2820 + 2820) % 2820;
    return (((r + 38) * 682) % 2816) < 682;
  }

  static int getMonthDays(int jy, int jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapYear(jy) ? 30 : 29;
  }

  static JalaliDate fromDateTime(DateTime date) {
    return gregorianToJalali(date.year, date.month, date.day);
  }

  static JalaliDate gregorianToJalali(int gy, int gm, int gd) {
    final gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    int gy2 = gm > 2 ? gy + 1 : gy;
    int days = 355666 + (365 * gy) + ((gy2 + 3) ~/ 4) - ((gy2 + 99) ~/ 100) + ((gy2 + 399) ~/ 400) + gd + gDaysInMonth[gm - 1];
    int jy = -1595 + (33 * (days ~/ 12053));
    days %= 12053;
    jy += 4 * (days ~/ 1461);
    days %= 1461;
    if (days > 365) {
      jy += (days - 1) ~/ 365;
      days = (days - 1) % 365;
    }
    int jm;
    int jd;
    if (days < 186) {
      jm = 1 + (days ~/ 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + ((days - 186) ~/ 30);
      jd = 1 + ((days - 186) % 30);
    }
    return JalaliDate(jy, jm, jd);
  }

  static DateTime jalaliToGregorian(int jy, int jm, int jd) {
    int jy2 = jy + 1595;
    int days = -355668 + (365 * jy2) + ((jy2 ~/ 33) * 8) + (((jy2 % 33) + 3) ~/ 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    int gy = 400 * (days ~/ 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * ((--days) ~/ 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * (days ~/ 1461);
    days %= 1461;
    if (days > 365) {
      gy += (days - 1) ~/ 365;
      days = (days - 1) % 365;
    }
    final isLeap = (gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0);
    final salA = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    int gm = 0;
    while (gm < 12 && days >= salA[gm + 1]) {
      days -= salA[gm + 1];
      gm++;
    }
    return DateTime(gy, gm + 1, days + 1);
  }

  static int getPersianWeekdayIndex(DateTime date) {
    // DateTime.weekday: Monday=1, ..., Sunday=7
    // In Persian calendar: Saturday=0, Sunday=1, ..., Friday=6
    return (date.weekday + 1) % 7;
  }

  static String formatFull(DateTime date) {
    final j = fromDateTime(date);
    final weekdayIdx = getPersianWeekdayIndex(date);
    final weekday = weekdaysFa[weekdayIdx];
    final monthName = monthNamesFa[j.month - 1];
    final dayStr = PersianNumbers.toPersian(j.day);
    final yearStr = PersianNumbers.toPersian(j.year);

    return '$weekday، $dayStr $monthName $yearStr';
  }
}
