const ErrorTypes = require("./error_types.js");
const error_type = ErrorTypes;

const default_error_403 = new ErrorTypes.MiddlewareError("403  Forbidden");
const size_out_of_range_error = new ErrorTypes.MiddlewareError("403 OutOfBuffer");

const type_error = new error_type.MiddlewareError("PARAM_TYPE_ERROR");
const strlen_error = new error_type.MiddlewareError("PARAM_OUT_OF_LENGTH");

// const commonFunction = require("../libs/common.js");

const max_body_size = 100 * 1024 * 1024;
exports.json_parser = function (req) {
    var success;
    if (req.body !== undefined) { return undefined; }
    var content_type = req.get('Content-Type');
    if (!content_type) {
        return new ErrorTypes.MiddlewareError("HEADER_ERROR");
    }

    content_type = content_type.split(";");
    var lower_case_content_type = [];
    for (var item in content_type) {
        lower_case_content_type.push(content_type[item].toLocaleLowerCase().trim());
    }

    if (lower_case_content_type.indexOf('application/json') == -1) {
        return new ErrorTypes.MiddlewareError("HEADER_ERROR");
    }
    var buffer_list = [];
    var body_counter = 0;
    var error = false;
    req.on("data", function (data) {
        buffer_list.push(data);
        body_counter += data.length;
        if (body_counter > max_body_size) {
            success(size_out_of_range_error);
        }
    });

    req.on("end", function () {
        if (error) return;
        var buffer = Buffer.concat(buffer_list);
        try {
            req.body = JSON.parse(buffer.toString());
        } catch (error) {
            console.log(error)
            return success(default_error_403);
        }
        return success(undefined);
    });
    return new Promise((reslove) => success = reslove);
};

/**
 * check request ip address
 * @param {string} ip target ip address
 */
exports.target_ip = function (ip) {
    return function (req) {
        var target_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (target_ip !== ip) {
            return undefined;
        }
        return new ErrorTypes.MiddlewareError("  Forbidden", "ip address not allow");
    };
};

/**
 * the example of check function
 * @param {Request} req CLIENT 請求
 */
exports.function_example = async function (req) {
    if (req) {
        return undefined;
    }
    return new error_type.TestError();
};

exports.body_variable_is_number = function (val) {
    return async function (req) {
        if (!isNaN(req.body[val])) {
            return undefined;
        }
        return default_error_403;
    };
};

exports.superuser = function (val) {
    return async function (req) {
        if (req.session.mem_id !== 0) {
            return undefined
        }
        return new error_type.MiddlewareError(`NOT_SUPERUSER`);
    }
}

exports.body_variable_exists = function (val) {
    var v = val;
    return function (req) {
        if (req.body[v] !== undefined) {
            return undefined;
        }
        return new error_type.MiddlewareError(`PARAM_NOT_DEFINED`);
    };
};

exports.body_variable_type_and_exists = function (val, type) {
    var fun1 = exports.body_variable_exists(val);
    var fun2 = exports.body_variable_type(val, type);
    return function (req) {
        var res = fun1(req);
        if (res) {
            return res;
        }
        res = fun2(req);
        return res;
    };
};

const param_type = new error_type.MiddlewareError(`PARAM_TYPE_ERROR`);
exports.url_variable_exists = function (val) {
    return async function (req) {
        if (req.query[val]) {
            return undefined;
        }
        return new error_type.MiddlewareError(`PARAM_NOT_DEFINED`);
    };
};

exports.body_filename_valid = function (value) {
    var not_allow = ["\\", "/", ":", "*", "?", '"', '<', ">", "|", "'"];
    return async function (req) {
        for (var i = 0; i < not_allow.length; ++i) {
            if (req.body[value].indexOf(not_allow[i]) !== -1) {
                return new error_type.MiddlewareError(`FILENAME_NOT_ALLOW`);
            }
        }
        return undefined;
    };
};

exports.body_variable_type = function (val, type) {
    return function (req) {
        if (req.body[val] === undefined) {
            return undefined;
        }
        switch (type) {
            case "isoDate":
                if (!isISODate(req.body[val])) {
                    return param_type;
                }
                break;

            case "account":
                var reg = new RegExp("^[0-9A-Za-z]*$");
                if (!reg.test(req.body[val])) {
                    return param_type;
                }
                break;

            case "password":
                var reg = new RegExp("^[0-9A-Za-z]*$");
                if (!reg.test(req.body[val])) {
                    return param_type;
                }
                break;

            default:
                if (typeof (req.body[val]) !== type) {
                    return param_type;
                }
                break;
        }
        return undefined;
    };
};

exports.body_string_length = function (val, min, max) {
    return async function (req) {
        if (req.body[val] === undefined) {
            return undefined;
        }
        if (typeof (req.body[val]) !== "string" && typeof (req.body[val]) !== "object") {
            return type_error;
        }
        if (req.body[val].length > max || req.body[val].length < min) {
            return strlen_error;
        }
        return undefined;
    };
};

const login_error = new error_type.MiddlewareError("SESSION_ERROR");
exports.api_session_login = async function (req) {
    if (req.session.mem_id === undefined) {
        return login_error;
    }
    return undefined;
};

const permission_denied = new error_type.MiddlewareError("PERMISSION_DENIED");
exports.permission = async function (req) {
    if (req.session.permission === undefined || req.session.permission === 0) {
        return permission_denied;
    }
    return undefined;
};

exports.check_variable_count = function (vars, minimun_count) {
    return async function (req) {
        var count = 0;
        for (var val of vars) {
            if (req.body[val] !== undefined) {
                count += 1;
            }
        }
        if (minimun_count > count) {
            return new error_type.MiddlewareError(`PARAM_NOT_DEFINED`);;
        }
        return undefined;
    };
};

// exports.fcm_token = function(variable) {
//     return async function(req) {
//         if(!process.env.UNIT_TEST) {
//             try {
//                 await commonFunction.fcm_verify_token(req.body[variable]);
//                 return undefined;
//             } catch(error) {
//                 return new error_type.FirebaseTokenError();
//             }
//         }
//     };
// };

const verified_error = new error_type.MiddlewareError("MEMBER_NOT_VERIFIED");
exports.verified_status = async function (req) {
    if (!req.session.mem_status || req.session.mem_status != 1) {
        return verified_error;
    }
    return undefined;
};

const isoDateRegExp = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/);
function isISODate(str) {
    return isoDateRegExp.test(str);
}
