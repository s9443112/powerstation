const express = require("express");

const router = express.Router();

const model = require("../model");
const { ErrorTypes } = require("../middleware");

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

router.get("/city", async (req, res) => {
    const data = await model.city.findAll()
    res.json(data)
})

router.get("/city/powerstation", async (req, res) => {
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

router.post("/powerstation/:station_id", async (req, res, next) => {

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

router.post("/powerstation/date_averge/:station_id",async (req,res,next)=>{
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
    if(datetime != ''){
        selector["create_at"] = datetime 
    }
    data = await model.sensing_data.findAll({
        attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'],[model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
    })

    res.json(data)

})


router.post("/powerstation/averge/:station_id", async (req, res, next) => {
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
            attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'],[model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
        })
    } else {
        selector["create_at"] = { [model.Op.gte]: datetime }
        data = await model.sensing_data.findAll({
            attributes: [[model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'], [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'],[model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'], [model.fn('AVG', model.col('vol')), 'vol_AVG'], [model.fn('AVG', model.col('current')), 'current_AVG']], where: selector
        })
    }
    res.json(data)
})

router.get("/powerstation/now/:station_id", async (req, res, next) => {
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