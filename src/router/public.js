const express = require("express");
const { CommonMiddleware } = require("../middleware")

const router = express.Router();

const model = require("../model");
const { ErrorTypes } = require("../middleware");

const mqtt = require("mqtt")

var option = {
    username: "luhao",
    password: "a23387696"
}
const client = mqtt.connect("mqtt://luhao.com.tw", option)

client.on("connect", function () {
    console.log("Success connect mqtt broker.")
    client.subscribe("powerstation", function (err) {
        if (!err) {
            console.log("Success subscribe powerstation topic.")
        }
    })
})

client.on("message", async function (topic, message) {
    // console.log(message.toString())
    // console.log(topic)
    if (topic == "powerstation") {
        var keys = ["hot_water_temp", "cold_water_temp", "cold_water_temp2", "vol", "current"] 
        msg = JSON.parse(message.toString())
        console.log(msg)
        var data = {}
        //檢查是否有帶station_id
        if (!msg.hasOwnProperty("station_id")) {
            console.log("1")
            return
        }
        data["station_id"] = msg.station_id

        //檢查station_id 是否存在
        var check_id = await model.station.findOne({ where: { "station_id": msg.station_id } })
        if (check_id == null){
            console.log("2")
            return 
        }

        //檢查json 封包
        for (var key in keys) {
            // console.log(keys[key])
            if (!msg.hasOwnProperty(keys[key])) {
                // console.log("no "+keys[key])
                msg[keys[key]] = null
            }
            data[keys[key]] = msg[keys[key]]
        }
        console.log(data)


        await model.sensing_data.create(data)
        // var x = {
        //     "station_id":1,
        //     "hot_water_temp":100,
        //     "cold_water_temp":25,
        //     "cold_water_temp2":21,
        //     "vol":10,
        //     "current":1
        // }
    }
})



Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}



router.get("/city", CommonMiddleware.nothing, async (req, res) => {
    const data = await model.city.findAll()
    res.json(data)
})

router.get("/city/powerstation", CommonMiddleware.nothing, async (req, res) => {
    const data = await model.city.findAll({
        include: [
            {
                model: model.station,
                as: 'relate_station',
                attributes: ['station_id', 'comment']
            }
        ]
    })
    res.json(data)
})

router.post("/powerstation/:station_id", CommonMiddleware.nothing, async (req, res, next) => {

    var datetime = ''
    if (req.body["datetime"]) {
        datetime = req.body.datetime
    }

    let station_id = req.params.station_id;
    station_id = parseInt(station_id)
    if (isNaN(station_id)) {
        return next(new ErrorTypes.VerifyError(`Station ID not a number.`, "ERROR_STATION_ID"));
    }
    let data = ''
    let selector = {}
    selector["station_id"] = station_id
    if (datetime != '') {
        selector["create_at"] = { [model.Op.gte]: datetime }
    }
    data = await model.sensing_data.findAll({ where: selector })

    res.json(data)

})

router.post("/powerstation/date_averge/:station_id", CommonMiddleware.parse_body, async (req, res, next) => {
    let station_id = req.params.station_id;
    var datetime = ''
    if (req.body["datetime"]) {
        return next(new ErrorTypes.VerifyError(`You didn;t give me datetime.`, "ERROR_DATETIME"));
    }

    station_id = parseInt(station_id)
    if (isNaN(station_id)) {
        return next(new ErrorTypes.VerifyError(`Station ID not a number.`, "ERROR_STATION_ID"));
    }
    let data = ''
    let selector = {}
    selector["station_id"] = station_id
    if (datetime != '') {
        selector["create_at"] = datetime
    }
    data = await model.sensing_data.findAll({
        attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
    })

    res.json(data)

})


router.post("/powerstation/averge/:station_id", CommonMiddleware.parse_body, async (req, res, next) => {
    let station_id = req.params.station_id;
    var datetime = ''
    if (req.body["datetime"]) {
        datetime = req.body.datetime
    }

    station_id = parseInt(station_id)
    if (isNaN(station_id)) {
        return next(new ErrorTypes.VerifyError(`Station ID not a number.`, "ERROR_STATION_ID"));
    }
    let data = ''
    let selector = {}
    selector["station_id"] = station_id
    if (datetime == '') {

        data = await model.sensing_data.findAll({
            attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
        })
    } else {
        selector["create_at"] = { [model.Op.gte]: datetime }
        data = await model.sensing_data.findAll({
            attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
        })
    }
    res.json(data)
})

router.get("/powerstation/now/:station_id", CommonMiddleware.nothing, async function (req, res, next) {
    let station_id = req.params.station_id;
    station_id = parseInt(station_id)
    if (isNaN(station_id)) {
        return next(new ErrorTypes.VerifyError(`Station ID not a number.`, "ERROR_STATION_ID"));
    }

    let data = await model.station.findOne({
        where: { "station_id": station_id },
        include: [
            {
                model: model.sensing_data,
                as: "relate_sense",
                order: [["create_at", "desc"]],
                limit: 1
            }
        ]
    })
    res.json(data)
})






module.exports = router