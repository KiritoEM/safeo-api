export enum AUDIT_ACTIONS {
  LOGIN_ACTION = 'login',
  OAUTH_ACTION = 'oauth_login',
  SIGNUP_ACTION = 'signup',
  SIGNUP_VALID_OTP_ACTION = 'signup_valid_otp',
  LOGIN_SEND_OTP_ACTION = 'login_send_otp',
  LOGIN_VALID_OTP_ACTION = 'login_valid_otp',
  LOGIN_RESEND_OTP_ACTION = 'login_resend_otp',
  REFRESH_ACCESS_TOKEN_ACTION = 'refresh_access_token',
  CREATE_DOCUMENT_ACTION = 'create_new_document',
  GET_ALL_USER_DOCUMENT = 'get_all_user_documents'
}

export enum AUDIT_TARGET {
  USER = 'user',
  DOCUMENT = 'document',
  ACCOUNT = 'account',
  DOCUMENT_SCHEMA = 'document_schema',
}
