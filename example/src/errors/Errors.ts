import { IError } from "badmfck-api-server/dist/apiServer/structures/Interfaces";

export class Errors {
    static METHOD_NOT_ALLOWED: IError = { code: 405, message: "Method not allowed", httpStatus: 405 };
    static WRONG_PARAMS: IError = { code: 400, message: "Wrong parameters", httpStatus: 400 };
    // static MAIL_EXISTS:IError={code:1010,message:"email exists"};
    static USER_NOT_CREATED: IError = { code: 1000, message: "User not created" };
    static EXTERNAL_SERVER_ERROR: IError = { code: 500, message: "External server error", httpStatus: 500 };
    static UNAUTHORIZED_ACCESS: IError = { code: 401, message: "Unauthorized access", httpStatus: 401 };

    /* DOC */
    static DOC_NO_DOCUMENT: IError = { code: 1001, message: "no json for documentation", httpStatus: 400 };
    static DOC_NO_TEMPLATE: IError = { code: 1002, message: "no template for documentation", httpStatus: 400 };

    static MAIL_NOT_SENT = { code: 1013, message: "Mail not sent" };
    static MAIL_SENDING_ERROR = { code: 1014, message: "Mail sending error" };

    static CANT_GET_USER: IError = { code: 1003, message: "Can't get user" };
    static USER_ERROR: IError = { code: 1500, message: "User error", httpStatus: 400 };
    static USER_MAIL_ALREADY_EXISTS_ERROR: IError = { code: 1510, message: "User email exists error", httpStatus: 400 };
    static USER_PROJECT_ERROR: IError = { code: 1550, message: "User project error", httpStatus: 400 };
    static AUTH_CANT_CREATE_TOKEN: IError = { code: 1100, message: "Can't create auth token" };

    static OTP_CANT_GENERATE: IError = { code: 1901, message: "can't generate otp code" };
    static OTP_NOT_EXISTS: IError = { code: 1902, message: "otp not exists" };
    static OTP_WRONG: IError = { code: 1903, message: "wrong otp" };
    static OTP_WRONG_ACTION: IError = { code: 1904, message: "wrong otp action" };

    static MERCHANT_NOT_FOUND: IError = { code: 1990, message: "Merchant not found", httpStatus: 400 };
    static MERCHANT_ERROR: IError = { code: 2000, message: "Merchant error", httpStatus: 400 };
    static MERCHANT_SAVE_ERROR: IError = { code: 2010, message: "Merchant error", httpStatus: 400 };
    static MERCHANT_ADDRESS_ERROR: IError = { code: 2020, message: "Merchant address error", httpStatus: 400 };
    static MERCHANT_PARTNER_ERROR: IError = { code: 2030, message: "Merchant partner error", httpStatus: 400 };
    static MERCHANT_PERSON_ERROR: IError = { code: 2040, message: "Merchant person error", httpStatus: 400 };
    static MERCHANT_WEBSITE_ERROR: IError = { code: 2050, message: "Merchant website error", httpStatus: 400 };
    static MERCHANT_PROCESSING_ERROR: IError = { code: 2060, message: "Merchant processing error", httpStatus: 400 };
    static MERCHANT_TRAFFIC_ERROR: IError = { code: 2070, message: "Merchant traffic error", httpStatus: 400 };
    static MERCHANT_USER_ERROR: IError = { code: 2080, message: "Merchant users error", httpStatus: 400 };
    static MERCHANT_FILE_ERROR: IError = { code: 2090, message: "Merchant file error", httpStatus: 400 };
    static MERCHANT_REGISTER_ERROR: IError = { code: 2100, message: "Merchant registration error", httpStatus: 400 };
    static MERCHANT_STATUS_ERROR: IError = { code: 2110, message: "Merchant status error", httpStatus: 400 };
    static MERCHANT_SETTINGS_ERROR: IError = { code: 2150, message: "Merchant settings error", httpStatus: 400 };
    static MERCHANT_WRONG_TOKEN: IError = { code: 2151, message: "Wrong authorization token", httpStatus: 401 };

    static FRAUD_ERROR: IError = { code: 2500, message: "Fraud rule error", httpStatus: 400 };
    static FRAUD_ACTION_ERROR: IError = { code: 2510, message: "Fraud action error", httpStatus: 400 };
    static FRAUD_CONDITION_ERROR: IError = { code: 2520, message: "Fraud condition error", httpStatus: 400 };
    static FRAUD_MERCHANT_ERROR: IError = { code: 2530, message: "Fraud merchant error", httpStatus: 400 };

    static ACQUIRER_ERROR: IError = { code: 3000, message: "Acquirer error from Errors", httpStatus: 400 };
}
