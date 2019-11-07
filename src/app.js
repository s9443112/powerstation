const sequelize = require("sequelize");
const express = require("express");


const public = require("./router/public.js");
const api = require("./router/api");


var { ErrorTypes, initLogger, BasicError } = require("error-helper");


app = express();

app.use("/public", public);
app.use("/api", api);

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
app.listen(8000);