var { ErrorTypes, getFileLogger } = require("error-helper");

ErrorTypes.ErrorTypeHelper("SequelizeError", {
    level: "warn",
    stack_trace: false,
    error_status: 500,
    error_code: 0
}, function (error) {
    this.error = error;
    if (error.original) {
        this.message = `{"message": ${error.original.sqlMessage}, "sql": ${error.sql}}`;
    } else {
        this.message = `{"message": ${error.message}, "sql": ${error.sql}}`;
    }
    this.reply_message = "Parameter type or length error";
    this.get_stack_info = function () {
        return error.stack;
    };
});

ErrorTypes.ErrorTypeHelper("IpcCommunicateError", {
    level: "warn",
    stack_trace: false
}, function (method, error_type, msg_obj) {
    this.message = `${method} ${error_type} ${JSON.stringify(msg_obj)}`;
    this.reply_message = error_type;
});

ErrorTypes.ErrorTypeHelper("BankError", {
    level: "error",
    stack_trace: true,
    error_status: 500,
    error_code: -3
}, function (bank_result) {
    var print = this.print;
    this.print = function () {
        print.call(this);
        var filename = this.get_caller_file(__filename);
        var logger = getFileLogger(`${filename}`);
        var logger_type = this.get_logger_type();
        logger[logger_type](`Bank Error Message:`);
        var bank_error = JSON.stringify(bank_result.body.error, null, 2);
        bank_error = bank_error.split("\n");
        for (var err of bank_error) {
            logger[logger_type](err);
        }
    };
    this.message = bank_result.body.message;
    this.reply_message = "Transaction Error";
});

ErrorTypes.ErrorTypeHelper("FirebaseTokenError", {
    level: "info",
    stack_trace: false,
    error_status: 403,
    error_code: -4,
    message: "fcm token error",
    reply_message: "FCM_TOKEN_ERROR"
});

module.exports = ErrorTypes;