/**
 * Accurate Jalali (Solar Hijri / Shamsi) & Gregorian Calendar Utilities
 * Standard astronomical algorithm for leap years and date conversions
 */

export interface JalaliDate {
  jy: number;
  jm: number; // 1-12
  jd: number; // 1-31
}

export interface GregorianDate {
  gy: number;
  gm: number; // 1-12
  gd: number; // 1-31
}

// Persian numbers conversion
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  const str = String(input);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export const JALALI_MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const JALALI_MONTH_NAMES_EN = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
];

export const GREGORIAN_MONTH_NAMES_FA = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

export const GREGORIAN_MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEKDAYS_FA = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

export const WEEKDAYS_SHORT_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const WEEKDAYS_EN = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const WEEKDAYS_SHORT_EN = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

/**
 * Checks if a Jalali year is a leap year (kabiseh)
 */
export function isJalaliLeapYear(jy: number): boolean {
  // Using 33-year cycle standard approximation
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
  ];
  let jp = breaks[0];
  let jm: number;
  let jump = 0;
  let leap = -14;

  if (jy < jp || jy >= breaks[breaks.length - 1]) {
    // Fallback cycle check
    const r = ((jy - 474) % 2820 + 2820) % 2820;
    return (((r + 38) * 682) % 2816) < 682;
  }

  for (let i = 1; i < breaks.length; i++) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leap += Math.floor(jump / 33) * 8 + Math.floor(((jump % 33) + 3) / 4);
    jp = jm;
  }
  const n = jy - jp;
  leap += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
  if (jump % 33 === 4 && jump - n === 4) leap++;

  const r2 = ((jy - 474) % 2820 + 2820) % 2820;
  return (((r2 + 38) * 682) % 2816) < 682;
}

/**
 * Days in a Jalali month
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

/**
 * Checks if Gregorian year is leap
 */
export function isGregorianLeapYear(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

export function getGregorianMonthDays(gy: number, gm: number): number {
  const days = [31, isGregorianLeapYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[gm - 1];
}

/**
 * Gregorian to Jalali conversion
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Jalali to Gregorian conversion
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  let jy2 = jy + 1595;
  let days =
    -355668 +
    365 * jy2 +
    Math.floor(jy2 / 33) * 8 +
    Math.floor(((jy2 % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 12 && days >= sal_a[gm + 1]) {
    days -= sal_a[gm + 1];
    gm++;
  }
  return { gy, gm: gm + 1, gd: days + 1 };
}

/**
 * Converts a JS Date or ISO string into JalaliDate
 */
export function dateToJalali(date: Date | string): JalaliDate {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Safely parses YYYY-MM-DD string into Date object without timezone shifts
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

/**
 * Formats a Date into standard YYYY-MM-DD
 */
export function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Today's date string YYYY-MM-DD
 */
export function getTodayIso(): string {
  return formatIsoDate(new Date());
}

/**
 * Get weekday index where 0 = Saturday (شنبه), 6 = Friday (جمعه)
 */
export function getPersianWeekdayIndex(d: Date): number {
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  return (day + 1) % 7;
}

/**
 * Full formatted Persian date string, e.g.: "دوشنبه، ۱۲ آبان ۱۴۰۵"
 */
export function formatJalaliFull(date: Date | string, usePersianDigits = true): string {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const j = dateToJalali(d);
  const weekdayIndex = getPersianWeekdayIndex(d);
  const weekday = WEEKDAYS_FA[weekdayIndex];
  const month = JALALI_MONTH_NAMES_FA[j.jm - 1];
  const dayStr = usePersianDigits ? toPersianDigits(j.jd) : String(j.jd);
  const yearStr = usePersianDigits ? toPersianDigits(j.jy) : String(j.jy);

  return `${weekday}، ${dayStr} ${month} ${yearStr}`;
}

/**
 * Full formatted Gregorian date string, e.g.: "Monday, November 2, 2026"
 */
export function formatGregorianFull(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const dayIndex = d.getDay(); // 0 = Sunday
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
  const month = GREGORIAN_MONTH_NAMES_EN[d.getMonth()];
  return `${weekday}, ${month} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Short Jalali string e.g. "۱۴۰۵/۰۸/۱۲"
 */
export function formatJalaliShort(date: Date | string, usePersianDigits = true): string {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const j = dateToJalali(d);
  const m = String(j.jm).padStart(2, '0');
  const day = String(j.jd).padStart(2, '0');
  const res = `${j.jy}/${m}/${day}`;
  return usePersianDigits ? toPersianDigits(res) : res;
}

/**
 * Generates month grid items for Jalali Calendar view
 */
export interface CalendarGridDay {
  isoDate: string; // YYYY-MM-DD
  dayNumber: number;
  monthNumber: number;
  yearNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekdayIndex: number; // 0=Sa, ..., 6=Fr
}

export function getJalaliMonthGrid(jy: number, jm: number): CalendarGridDay[] {
  const totalDays = getJalaliMonthDays(jy, jm);
  // Gregorian date for the 1st day of this Jalali month
  const firstGreg = jalaliToGregorian(jy, jm, 1);
  const firstDate = new Date(firstGreg.gy, firstGreg.gm - 1, firstGreg.gd);
  const firstWeekday = getPersianWeekdayIndex(firstDate); // 0 to 6

  const todayIso = getTodayIso();
  const grid: CalendarGridDay[] = [];

  // Previous month padding
  if (firstWeekday > 0) {
    const prevJm = jm === 1 ? 12 : jm - 1;
    const prevJy = jm === 1 ? jy - 1 : jy;
    const prevMonthDays = getJalaliMonthDays(prevJy, prevJm);

    for (let i = firstWeekday - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const g = jalaliToGregorian(prevJy, prevJm, dayNum);
      const iso = formatIsoDate(new Date(g.gy, g.gm - 1, g.gd));
      grid.push({
        isoDate: iso,
        dayNumber: dayNum,
        monthNumber: prevJm,
        yearNumber: prevJy,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        weekdayIndex: (firstWeekday - 1 - i) % 7,
      });
    }
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const g = jalaliToGregorian(jy, jm, day);
    const d = new Date(g.gy, g.gm - 1, g.gd);
    const iso = formatIsoDate(d);
    grid.push({
      isoDate: iso,
      dayNumber: day,
      monthNumber: jm,
      yearNumber: jy,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      weekdayIndex: getPersianWeekdayIndex(d),
    });
  }

  // Next month padding to fill multiple of 7 (up to 35 or 42 cells)
  const remaining = (7 - (grid.length % 7)) % 7;
  const nextJm = jm === 12 ? 1 : jm + 1;
  const nextJy = jm === 12 ? jy + 1 : jy;

  for (let day = 1; day <= remaining; day++) {
    const g = jalaliToGregorian(nextJy, nextJm, day);
    const d = new Date(g.gy, g.gm - 1, g.gd);
    const iso = formatIsoDate(d);
    grid.push({
      isoDate: iso,
      dayNumber: day,
      monthNumber: nextJm,
      yearNumber: nextJy,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      weekdayIndex: getPersianWeekdayIndex(d),
    });
  }

  return grid;
}

/**
 * Generates month grid items for Gregorian Calendar view
 */
export function getGregorianMonthGrid(gy: number, gm: number): CalendarGridDay[] {
  const totalDays = getGregorianMonthDays(gy, gm);
  const firstDate = new Date(gy, gm - 1, 1);
  const firstDayOfWeek = firstDate.getDay(); // 0=Su, 1=Mo...
  // In Persian context we start week on Saturday, but in Gregorian standard let's support Saturday or Sunday
  // Let's align on Saturday start for symmetry or Sunday
  const offset = (firstDayOfWeek + 1) % 7; // Saturday = 0

  const todayIso = getTodayIso();
  const grid: CalendarGridDay[] = [];

  // Previous month padding
  if (offset > 0) {
    const prevGm = gm === 1 ? 12 : gm - 1;
    const prevGy = gm === 1 ? gy - 1 : gy;
    const prevMonthDays = getGregorianMonthDays(prevGy, prevGm);

    for (let i = offset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const iso = formatIsoDate(new Date(prevGy, prevGm - 1, dayNum));
      grid.push({
        isoDate: iso,
        dayNumber: dayNum,
        monthNumber: prevGm,
        yearNumber: prevGy,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        weekdayIndex: (offset - 1 - i) % 7,
      });
    }
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(gy, gm - 1, day);
    const iso = formatIsoDate(d);
    grid.push({
      isoDate: iso,
      dayNumber: day,
      monthNumber: gm,
      yearNumber: gy,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      weekdayIndex: (d.getDay() + 1) % 7,
    });
  }

  const remaining = (7 - (grid.length % 7)) % 7;
  const nextGm = gm === 12 ? 1 : gm + 1;
  const nextGy = gm === 12 ? gy + 1 : gy;

  for (let day = 1; day <= remaining; day++) {
    const d = new Date(nextGy, nextGm - 1, day);
    const iso = formatIsoDate(d);
    grid.push({
      isoDate: iso,
      dayNumber: day,
      monthNumber: nextGm,
      yearNumber: nextGy,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      weekdayIndex: (d.getDay() + 1) % 7,
    });
  }

  return grid;
}
