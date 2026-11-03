class PersianNumbers {
  static const List<String> _persianDigits = [
    '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'
  ];

  static String toPersian(dynamic input) {
    if (input == null) return '';
    final str = input.toString();
    var res = '';
    for (var i = 0; i < str.length; i++) {
      final code = str.codeUnitAt(i);
      if (code >= 48 && code <= 57) {
        res += _persianDigits[code - 48];
      } else {
        res += str[i];
      }
    }
    return res;
  }
}
