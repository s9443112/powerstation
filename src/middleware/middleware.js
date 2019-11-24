const checkers = require("./check_functions.js");
const { CheckerBuilder } = require("error-helper");

exports.parse_body = new CheckerBuilder.CheckerBuilder(
    [
        checkers.json_parser
    ]
).create_middleware_checker();
exports.nothing = new CheckerBuilder.CheckerBuilder([]).create_middleware_checker()