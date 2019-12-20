const sequelize = require("sequelize");
const express = require("express");

const public = require("./router/public.js");
const linebotapi = require("./router/linebotapi.js")

var { ErrorTypes, initLogger, BasicError } = require("error-helper");
initLogger("./src/", "./logs/");


app = express();
app.use('/static', express.static('static'));

app.use("/public", public);
app.use('/linewebhook', linebotapi);


app.use(function (err, req, res, next) {
    // return console.log(err);
    if (err instanceof BasicError) {
        return err.all(req, res);
    } else if (err instanceof sequelize.BaseError) {
        return (new ErrorTypes.SequelizeError(err).all(req, res));
    }
    // console.log(err);
    let error = new ErrorTypes.ProgramError(err);
    return error.all(req, res);
});

app.use(function (req, res) { res.status(404).json({ status: "404 Not Found" }); });

if (process.env.UNIT_TEST) {
    console.log("開啟測試模式")
}

//監聽port 8000
app.listen(8000);

// 錯誤log顯示
process.on('unhandledRejection', error => {
    console.log("unhandledRejection: ");
    console.log(error);
});