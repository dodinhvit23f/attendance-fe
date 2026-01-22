/**
 * Error message constants and mapping for API error codes
 */

export class ErrorMessage {
  // Auth Error Codes
  public static readonly TENANT_IS_EMPTY = 'ERROR_AUTH_001';
  public static readonly USERNAME_IS_EMPTY = 'ERROR_AUTH_002';
  public static readonly PASSWORD_IS_EMPTY = 'ERROR_AUTH_003';
  public static readonly INVALID_TOKEN = 'ERROR_AUTH_004';
  public static readonly UNAUTHORIZED_ACCESS = 'ERROR_AUTH_005';
  public static readonly TENANT_MAX_LENGTH_EXCEEDED = 'ERROR_AUTH_006';
  public static readonly USER_OR_PASSWORD_NOT_EXIST = 'ERROR_AUTH_007';
  public static readonly REFRESH_TOKEN_IS_EMPTY = 'ERROR_AUTH_008';
  public static readonly USER_NOT_EXIST = 'ERROR_AUTH_009';
  public static readonly USER_NOT_ACTIVE = 'ERROR_AUTH_010';
  public static readonly OLD_PASSWORD_NOT_EMPTY = 'ERROR_AUTH_011';
  public static readonly NEW_PASSWORD_NOT_EMPTY = 'ERROR_AUTH_012';
  public static readonly ACCESS_TOKEN_IS_EMPTY = 'ERROR_AUTH_013';
  public static readonly OTP_CODE_IS_EMPTY = 'ERROR_AUTH_014';
  public static readonly OTP_NOT_CORRECT = 'ERROR_AUTH_015';
  public static readonly ROLE_NOT_EXIST = 'ERROR_AUTH_016';
  public static readonly PASSWORD_NOT_CORRECT = 'ERROR_AUTH_017';
  public static readonly OTP_TOKEN_IS_EMPTY = 'ERROR_AUTH_018';
  public static readonly OTP_SECRET_IS_EMPTY = 'ERROR_AUTH_019';
  public static readonly ID_IS_REQUIRED = 'ERROR_AUTH_020';
  public static readonly PHONE_NUMBER_MAX_LENGTH_EXCEEDED = 'ERROR_AUTH_021';
  public static readonly USERNAME_MAX_LENGTH_EXCEEDED = 'ERROR_AUTH_022';
  public static readonly USER_NAME_IS_REQUIRED = 'ERROR_AUTH_023';
  public static readonly USER_PASSWORD_IS_REQUIRED = 'ERROR_AUTH_024';
  public static readonly USER_PASSWORD_MIN_REQUIRED = 'ERROR_AUTH_025';
  public static readonly TENANT_NOT_FOUND = 'ERROR_AUTH_026';

  // Facility Error Codes
  public static readonly FACILITY_NOT_FOUND = 'ERROR_FACILITY_001';
  public static readonly NAME_IS_REQUIRED = 'ERROR_FACILITY_002';
  public static readonly ADDRESS_IS_REQUIRED = 'ERROR_FACILITY_003';
  public static readonly LATITUDE_IS_REQUIRED = 'ERROR_FACILITY_004';
  public static readonly LONGITUDE_IS_REQUIRED = 'ERROR_FACILITY_005';
  public static readonly ALLOW_DISTANCE_MIN = 'ERROR_FACILITY_006';
  public static readonly ALLOW_DISTANCE_MAX = 'ERROR_FACILITY_007';

  // Employee Error Codes
  public static readonly EMPLOYEE_NOT_FOUND = 'ERROR_EMPLOYEE_001';
  public static readonly EMPLOYEE_ID_ALREADY_EXISTS = 'ERROR_EMPLOYEE_002';
  public static readonly EMAIL_ALREADY_EXISTS = 'ERROR_EMPLOYEE_003';
  public static readonly EMPLOYEE_ID_IS_REQUIRED = 'ERROR_EMPLOYEE_004';
  public static readonly FULL_NAME_IS_REQUIRED = 'ERROR_EMPLOYEE_005';
  public static readonly EMAIL_IS_REQUIRED = 'ERROR_EMPLOYEE_006';
  public static readonly INVALID_EMAIL_FORMAT = 'ERROR_EMPLOYEE_007';
  public static readonly PHONE_NUMBER_IS_REQUIRED = 'ERROR_EMPLOYEE_008';
  public static readonly ACTIVE_STATUS_IS_REQUIRED = 'ERROR_EMPLOYEE_009';
  public static readonly VERSION_IS_REQUIRED = 'ERROR_EMPLOYEE_010';
  public static readonly ROLE_IS_REQUIRED = 'ERROR_EMPLOYEE_011';
  public static readonly FACILITY_IDS_IS_REQUIRED = 'ERROR_EMPLOYEE_012';
  public static readonly USERNAME_ALREADY_EXISTS = 'ERROR_EMPLOYEE_013';
  public static readonly ROLE_NAME_NOT_FOUND = 'ERROR_EMPLOYEE_014';

  // QR Code Error Codes
  public static readonly QR_CODE_GENERATION_FAILED = 'ERROR_QR_001';

  // Attendance Error Codes
  public static readonly ATTENDANCE_NOT_FOUND = 'ERROR_ATTENDANCE_001';
  public static readonly NOT_IN_ALLOWED_DISTANCE = 'ERROR_ATTENDANCE_002';
  public static readonly QR_CODE_EXPIRED = 'ERROR_ATTENDANCE_003';
  public static readonly LONGITUDE_REQUIRED = 'ERROR_ATTENDANCE_004';
  public static readonly LATITUDE_REQUIRED = 'ERROR_ATTENDANCE_005';
  public static readonly FACILITIES_NOT_FOUND = 'ERROR_ATTENDANCE_006';
  public static readonly FACILITY_REQUIRED = 'ERROR_ATTENDANCE_007';
  public static readonly NO_ATTENDANCE_RECORDS_FOUND = 'ERROR_ATTENDANCE_008';
  public static readonly EXPORT_START_DATE_REQUIRED = 'ERROR_ATTENDANCE_009';
  public static readonly EXPORT_END_DATE_REQUIRED = 'ERROR_ATTENDANCE_010';
  public static readonly EXPORT_DATE_RANGE_INVALID = 'ERROR_ATTENDANCE_011';
  public static readonly EXPORT_FAILED = 'ERROR_ATTENDANCE_012';
  public static readonly GOOGLE_API_ERROR = 'ERROR_ATTENDANCE_013';

  // Shift Error Codes
  public static readonly SHIFT_NOT_FOUND = 'ERROR_SHIFT_001';
  public static readonly SHIFT_NAME_IS_EMPTY = 'ERROR_SHIFT_002';
  public static readonly SHIFT_START_TIME_IS_REQUIRED = 'ERROR_SHIFT_003';
  public static readonly SHIFT_END_TIME_IS_REQUIRED = 'ERROR_SHIFT_004';
  public static readonly SHIFT_ID_IS_REQUIRED = 'ERROR_SHIFT_005';
  public static readonly SHIFT_NAME_ALREADY_EXISTS = 'ERROR_SHIFT_006';

  // Order Error Codes
  public static readonly ORDER_CODE_NOT_EMPTY = 'ERROR_ORDER_001';

  // Optimistic Lock Error Codes
  public static readonly RECORD_HAVE_BEEN_CHANGED = 'ERROR_OPT_001';

  // Kafka Error Codes
  public static readonly KAFKA_KEY_IS_REQUIRED = 'ERROR_KFK_001';
  public static readonly KAFKA_TOPIC_IS_REQUIRED = 'ERROR_KFK_002';
  public static readonly KAFKA_REQUEST_IS_REQUIRED = 'ERROR_KFK_003';

  /**
   * Error message mapping - Vietnamese messages for error codes
   */
  private static readonly errorMessageMap: Record<string, string> = {
    // Auth Errors
    ERROR_AUTH_001: 'Tenant không được để trống',
    ERROR_AUTH_002: 'Tên đăng nhập không được để trống',
    ERROR_AUTH_003: 'Mật khẩu không được để trống',
    ERROR_AUTH_004: 'Token không hợp lệ',
    ERROR_AUTH_005: 'Không có quyền truy cập',
    ERROR_AUTH_006: 'Tenant vượt quá độ dài cho phép',
    ERROR_AUTH_007: 'Tên đăng nhập hoặc mật khẩu không đúng',
    ERROR_AUTH_008: 'Refresh token không được để trống',
    ERROR_AUTH_009: 'Người dùng không tồn tại',
    ERROR_AUTH_010: 'Tài khoản chưa được kích hoạt',
    ERROR_AUTH_011: 'Mật khẩu cũ không được để trống',
    ERROR_AUTH_012: 'Mật khẩu mới không được để trống',
    ERROR_AUTH_013: 'Access token không được để trống',
    ERROR_AUTH_014: 'Mã OTP không được để trống',
    ERROR_AUTH_015: 'Mã OTP không chính xác',
    ERROR_AUTH_016: 'Vai trò không tồn tại',
    ERROR_AUTH_017: 'Mật khẩu không chính xác',
    ERROR_AUTH_018: 'OTP token không được để trống',
    ERROR_AUTH_019: 'OTP secret không được để trống',
    ERROR_AUTH_020: 'ID là bắt buộc',
    ERROR_AUTH_021: 'Số điện thoại vượt quá độ dài cho phép',
    ERROR_AUTH_022: 'Tên đăng nhập vượt quá độ dài cho phép',
    ERROR_AUTH_023: 'Tên đăng nhập là bắt buộc',
    ERROR_AUTH_024: 'Mật khẩu là bắt buộc',
    ERROR_AUTH_025: 'Mật khẩu phải có ít nhất 6 ký tự',
    ERROR_AUTH_026: 'Không tìm thấy tenant',

    // Facility Errors
    ERROR_FACILITY_001: 'Không tìm thấy cơ sở',
    ERROR_FACILITY_002: 'Tên cơ sở là bắt buộc',
    ERROR_FACILITY_003: 'Địa chỉ là bắt buộc',
    ERROR_FACILITY_004: 'Vĩ độ là bắt buộc',
    ERROR_FACILITY_005: 'Kinh độ là bắt buộc',
    ERROR_FACILITY_006: 'Khoảng cách cho phép tối thiểu không hợp lệ',
    ERROR_FACILITY_007: 'Khoảng cách cho phép tối đa không hợp lệ',

    // Employee Errors
    ERROR_EMPLOYEE_001: 'Không tìm thấy nhân viên',
    ERROR_EMPLOYEE_002: 'Mã nhân viên đã tồn tại',
    ERROR_EMPLOYEE_003: 'Email đã tồn tại',
    ERROR_EMPLOYEE_004: 'Mã nhân viên là bắt buộc',
    ERROR_EMPLOYEE_005: 'Họ tên là bắt buộc',
    ERROR_EMPLOYEE_006: 'Email là bắt buộc',
    ERROR_EMPLOYEE_007: 'Định dạng email không hợp lệ',
    ERROR_EMPLOYEE_008: 'Số điện thoại là bắt buộc',
    ERROR_EMPLOYEE_009: 'Trạng thái hoạt động là bắt buộc',
    ERROR_EMPLOYEE_010: 'Version là bắt buộc',
    ERROR_EMPLOYEE_011: 'Vai trò là bắt buộc',
    ERROR_EMPLOYEE_012: 'Danh sách cơ sở làm việc là bắt buộc',
    ERROR_EMPLOYEE_013: 'Tên đăng nhập đã tồn tại',
    ERROR_EMPLOYEE_014: 'Không tìm thấy tên vai trò',

    // QR Code Errors
    ERROR_QR_001: 'Không thể tạo mã QR',

    // Attendance Errors
    ERROR_ATTENDANCE_001: 'Không tìm thấy bản ghi chấm công',
    ERROR_ATTENDANCE_002: 'Không nằm trong khoảng cách cho phép',
    ERROR_ATTENDANCE_003: 'Mã QR đã hết hạn',
    ERROR_ATTENDANCE_004: 'Kinh độ là bắt buộc',
    ERROR_ATTENDANCE_005: 'Vĩ độ là bắt buộc',
    ERROR_ATTENDANCE_006: 'Không tìm thấy cơ sở làm việc',
    ERROR_ATTENDANCE_007: 'Cơ sở làm việc là bắt buộc',
    ERROR_ATTENDANCE_008: 'Không tìm thấy bản ghi chấm công nào',
    ERROR_ATTENDANCE_009: 'Ngày bắt đầu xuất báo cáo là bắt buộc',
    ERROR_ATTENDANCE_010: 'Ngày kết thúc xuất báo cáo là bắt buộc',
    ERROR_ATTENDANCE_011: 'Khoảng thời gian xuất báo cáo không hợp lệ',
    ERROR_ATTENDANCE_012: 'Xuất báo cáo thất bại',
    ERROR_ATTENDANCE_013: 'Lỗi Google API',

    // Shift Errors
    ERROR_SHIFT_001: 'Không tìm thấy ca làm việc',
    ERROR_SHIFT_002: 'Tên ca làm việc không được để trống',
    ERROR_SHIFT_003: 'Thời gian bắt đầu ca làm việc là bắt buộc',
    ERROR_SHIFT_004: 'Thời gian kết thúc ca làm việc là bắt buộc',
    ERROR_SHIFT_005: 'ID ca làm việc là bắt buộc',
    ERROR_SHIFT_006: 'Tên ca làm việc đã tồn tại',

    // Order Errors
    ERROR_ORDER_001: 'Mã đơn hàng không được để trống',

    // Optimistic Lock Errors
    ERROR_OPT_001: 'Bản ghi đã được thay đổi bởi người dùng khác',

  };

  /**
   * Get Vietnamese error message from error code
   * @param errorCode - The error code from API response
   * @param defaultMessage - Optional default message if error code not found
   * @returns Vietnamese error message
   */
  public static getMessage(errorCode: string, defaultMessage?: string): string {
    return this.errorMessageMap[errorCode] || defaultMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  }

  /**
   * Check if an error code exists in the mapping
   * @param errorCode - The error code to check
   * @returns true if the error code exists
   */
  public static hasErrorCode(errorCode: string): boolean {
    return errorCode in this.errorMessageMap;
  }

  /**
   * Get all error codes
   * @returns Array of all error codes
   */
  public static getAllErrorCodes(): string[] {
    return Object.keys(this.errorMessageMap);
  }
}
