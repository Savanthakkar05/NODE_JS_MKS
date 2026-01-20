const status = {
  OK: 200,
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404,
  Forbidden: 403,
  NotAcceptable: 406,
  Conflict: 409,
  InternalServerError: 500,
};

const messages = {
  VALIDATION_ERROR: "Validation Error.",
  IMPROPER_DATA: "Improper data present.",
  IMAGE_REQUIRED: "Image is required.",
  LOGO_REQUIRED: "Logo is required.",
  STATUS_UPDATED: "Status updated successfully.",
  MOCK_LOGIN: "Mock Login successfully.",
  ACCOUNT_DISABLE: "You Account has been disabled. Please contact Admin",
  INVALID_CREDENTIALS: "Invalid credentials.",
  LOGIN_SUCCESS: "Login Success",
  NEW_PASSWORD_SENT_MAIL: "New password sent on mail.",
  TOKEN_VERIFIED: "Token Verified",
  PROFILE_UPDATE: "Profile updated successfully.",
  INCORRECT_OLD_PASSWORD: "Incorrect Old Password",
  NEW_PASSWORD_NOT_SAME_OLD_PASSWORD:
    "New Password cannot be same as Old Password credentials.",
  NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH:
    "New Password and Confirm Password do not match.",
  PASSWORD_UPDATE: "Password updated successfully.",
  PROFILE_IMAGE_REMOVE: "Profile Image removed.",
  AUDIT_LOG_NOT_FOUND: "AuditLog not found.",
  CHILD_DELETE_FIRST: "Please delete all child first",
  ONLY_SUPER_ADMIN_CAN_ACCESS: "Only super admin can access this API.",
  COVER_IMAGE_UPDATE: "Cover Image Updated Successfully",
  PROFILE_IMAGE_UPDATE: "Profile Image Updated Successfully",
  unauthorized: "Unauthorized!",

  // User
  USER_CREATE: "User Created Successfully.",
  USER_UPDATE: "User updated successfully",
  USER_NOT_FOUND: "User not found",
  USER_DELETE: "User deleted successfully",
  USER_NOT: "User does not exist.",

  //User-Session
  USER_SESSION_DELETE: "User-Session deleted successfully",

  // Module Messages
  MODULE_CREATE: "Module created successfully",
  MODULE_UPDATE: "Module updated successfully",
  MODULE_NOT_FOUND: "Module not found",
  MODULE_DELETE: "Module deleted successfully",

  // Some Field Already Exists
  ALREADY_EXISTS: "Some fields already exists.",

  // ROLE Messages
  ROLE_CREATED: "Role Created Successfully.",
  ROLE_UPDATED: "Role Updated Successfully.",
  ROLE_LEVEL_UPDATED: "Role Level Updated successfully.",
  ROLE_DELETED: "Role Deleted Successfully.",
  ROLE_NOT_FOUND: "Role Not Found.",
  ROLE_ALREADY_EXISTS: "Role already exists! Please enter a unique role.",
  DEFAULT_ROLE_DEACTIVATE: "Can not de-activate System Default Role.",
  ROLE_ASSOCIATE_WITH_USERS: "Users are associate with this Role!",

  // Audit-Log
  audit_log_not_found: "Audit Log not found.",
  log_delete_for_date: "All logs for the date has been deleted",
};

module.exports = {
  status,
  messages,
};
