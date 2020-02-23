
const express = require("express");
const router = express.Router();

const model = require("../model");

var linebot = require('linebot')

const bot = linebot({
    channelId: "1653657811",
    channelSecret: "4b9fe459fde22a7547c057925533988f",
    channelAccessToken: "OVuL+3N7/fHFMM/IjoM0HZKUr+1/lOKDJrYtZdBik8H99Rxpa2/FXsW6iUPxV7n1zjBSzuAv/219Beqycb0lR/SA1+7j0xKgiivovtUEJJ4YXZGrxmo7P5tkm62Q0C2qr8vr3ZXbPTVhtZqJqRvpTgdB04t89/1O/w1cDnyilFU="
});

const linebotParser = bot.parser();

let user_status = []

const flex = require("../linebot_templates/default.json")

//隨機色彩
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

bot.on('message', async function (event) {

    var find_index = 1
    var user_index = 0



    /**
     * 搜尋使用者uuid
     * 如果搜尋不到，就新增一筆object，放進array裡面
     *  */
    while (find_index) {
        user_index = user_status.findIndex(x => x.user_uuid === event.source.userId)
        if (user_index == -1) {
            console.log("error find")
            user_status.push({ "user_uuid": event.source.userId, "action": 0 })
        } else {
            console.log("find it !")
            find_index = 0
        }

    }

    if (event.message.text == "help" || event.message.text == "menu") {
        var copy = JSON.parse(JSON.stringify(flex))
        copy.footer.contents.splice(1, 1)

        user_status[user_index].action = 0

        event.reply({
            type: 'flex',
            altText: 'this is a flex message',
            contents: copy
        }).catch(error => {
            console.log(error)
        })
        return;

    }


    switch (user_status[user_index].action) {

        case 1:
            let city_station = []
            var msg = JSON.parse(event.message.text)
            if (msg.todo == "now") {
                console.log(user_status[user_index].city_name)
                var data = await model.city.findOne({
                    include: [
                        {
                            model: model.station,
                            as: 'relate_station',
                            attributes: ['station_id', "station_name", 'comment'],
                            include: [
                                {
                                    model: model.sensing_data,
                                    as: "relate_sense",
                                    order: [["create_at", "desc"]],
                                    limit: 1
                                }
                            ]
                        }

                    ],
                    where: { "city_name": msg.city_name }
                })

                if (data == null) {
                    event.reply("沒有此城市")
                    break;
                }
                if (data.relate_station.length == 0) {
                    event.reply("這個城市裡面沒有任何廠商")
                    break;
                }
                // user_status[user_index].action = 1

                console.log(JSON.stringify(data))

                for (let key = 0; key < data.relate_station.length; key++) {
                    var city_template = require("../linebot_templates/city.json")
                    var copy = JSON.parse(JSON.stringify(city_template))

                    copy.body.contents[0].text = data.city_name
                    copy.body.contents[1].text = data.relate_station[key].station_name
                    copy.body.contents[2].text = "沒有設定地址"
                    copy.body.contents[4].contents[0].contents[0].text = "熱水溫度"
                    copy.body.contents[4].contents[0].contents[1].text = `${data.relate_station[key].relate_sense[0].hot_water_temp}°C`
                    copy.body.contents[4].contents[1].contents[0].text = "冷水溫度1"
                    copy.body.contents[4].contents[1].contents[1].text = `${data.relate_station[key].relate_sense[0].cold_water_temp}°C`
                    copy.body.contents[4].contents[2].contents[0].text = "冷水溫度2"
                    copy.body.contents[4].contents[2].contents[1].text = `${data.relate_station[key].relate_sense[0].cold_water_temp2}°C`
                    copy.body.contents[4].contents[3].contents[0].text = "電壓"
                    copy.body.contents[4].contents[3].contents[1].text = `${data.relate_station[key].relate_sense[0].vol}V`
                    copy.body.contents[4].contents[4].contents[0].text = "電流"
                    copy.body.contents[4].contents[4].contents[1].text = `${data.relate_station[key].relate_sense[0].current}A`
                    copy.body.contents[6].contents[0].text = "時間"
                    copy.body.contents[6].contents[1].text = `${new Date(data.relate_station[key].relate_sense[0].create_at).toLocaleString()}`
                    city_station.push(copy)

                }

            } else if (msg.todo == "averge") {
                console.log("averge")

                var check = await model.city.findOne({ where: { "city_name": msg.city_name } })

                if (check == null) {
                    event.reply("沒有此城市")
                    break;
                }

                var data = await model.station.findAll({
                    raw: true,
                    include: [
                        {
                            raw: true,
                            model: model.sensing_data,
                            as: "relate_sense",
                            attributes: [
                                "station_id",
                                [model.fn('AVG', model.col('hot_water_temp')), 'hot_water_temp_AVG'],
                                [model.fn('AVG', model.col('cold_water_temp')), 'cold_water_temp_AVG'],
                                [model.fn('AVG', model.col('cold_water_temp2')), 'cold_water_temp2_AVG'],
                                [model.fn('AVG', model.col('vol')), 'vol_AVG'],
                                [model.fn('AVG', model.col('current')), 'current_AVG']
                            ],
                            group: ["relate_sense.station_id"],

                        }
                    ],
                    group: ["relate_sense.station_id", "station_name"],
                    attributes: ["station_name"],
                    where: { "city_id": check.city_id }
                })

                console.log(JSON.stringify(data))
                if (data.length == 0) {
                    event.reply("這個城市裡面沒有任何廠商")
                    break;
                }

                for (let key = 0; key < data.length; key++) {
                    var city_template = require("../linebot_templates/city.json")
                    var copy = JSON.parse(JSON.stringify(city_template))

                    copy.body.contents[0].text = msg.city_name
                    copy.body.contents[1].text = data[key].station_name
                    copy.body.contents[2].text = "沒有設定地址"
                    copy.body.contents[4].contents[0].contents[0].text = "平均熱水溫度"
                    copy.body.contents[4].contents[0].contents[1].text = `${data[key]["relate_sense.hot_water_temp_AVG"]}°C`
                    copy.body.contents[4].contents[1].contents[0].text = "平均冷水溫度1"
                    copy.body.contents[4].contents[1].contents[1].text = `${data[key]["relate_sense.cold_water_temp_AVG"]}°C`
                    copy.body.contents[4].contents[2].contents[0].text = "平均冷水溫度2"
                    copy.body.contents[4].contents[2].contents[1].text = `${data[key]["relate_sense.cold_water_temp2_AVG"]}°C`
                    copy.body.contents[4].contents[3].contents[0].text = "平均電壓"
                    copy.body.contents[4].contents[3].contents[1].text = `${data[key]["relate_sense.vol_AVG"]}V`
                    copy.body.contents[4].contents[4].contents[0].text = "平均電流"
                    copy.body.contents[4].contents[4].contents[1].text = `${data[key]["relate_sense.current_AVG"]}A`
                    copy.body.contents[6].contents[0].text = "時間"
                    copy.body.contents[6].contents[1].text = `${new Date().toLocaleString()}`
                    city_station.push(copy)

                }





            }


            event.reply({
                type: "flex",
                altText: 'Station message',
                contents: {
                    type: 'carousel',
                    contents: city_station
                }
            })

            break;

        case 2:
            break;

        case 0:
        default:
            console.log("case default")

            switch (event.message.text) {

                case "menu":
                    var copy = JSON.parse(JSON.stringify(flex))
                    copy.footer.contents.splice(1, 1)

                    event.reply({
                        type: 'flex',
                        altText: 'this is a flex message',
                        contents: copy
                    }).catch(error => {
                        console.log(error)
                    })
                    break;
                case "查詢城市":
                    var data = await model.city.findAll()
                    if (data.length == 0) {
                        event.reply("沒有資料")
                        break;
                    }
                    let city = []
                    for (let key in data) {
                        var copy = JSON.parse(JSON.stringify(flex))

                        copy.body.contents[0].text = data[key]["city_name"]
                        copy.body.contents[1].text = "請選擇你要用的功能"

                        copy.footer.contents[0].action.text = `{"city_name":"${data[key]["city_name"]}","todo":"now"}`
                        copy.footer.contents[0].action.label = `查詢${data[key]["city_name"]}發電廠`
                        copy.footer.contents[1].action.text = `{"city_name":"${data[key]["city_name"]}","todo":"averge"}`
                        copy.footer.contents[1].action.label = `查看${data[key]["city_name"]}地區溫濕度總平均`
                        city.push(copy)
                    }

                    user_status[user_index].action = 1

                    event.reply({
                        type: "flex",
                        altText: 'This is a flex message',
                        contents: {
                            type: 'carousel',
                            contents: city
                        }
                    })
                    break;
                default:
                    if (!event.message.text) {
                        return;
                    }
                    break;

            }
            break;
    }




    // console.log(flex["type"])

    // event.reply(event.message.text).then(function (data) {
    //     // success
    // }).catch(function (error) {
    //     // error
    // });


});

bot.on("follow", async function (event) {

    var data = await model.user.findOne({ where: { "user_uuid": event.source.userId } })
    if (data == null) {
        await model.user.create({ "user_uuid": event.source.userId, "user_identify": 0 })
        event.reply("歡迎加入發電廠感測器小幫手")
    } else {
        event.reply("你終於回來了，小幫手我好想你")
    }

    // event.reply({
    //     type: 'flex',
    //     altText: 'this is a flex message',
    //     contents: flex
    // }).catch(error => {
    //     console.log(error)
    // })
})


router.post("/", linebotParser)

module.exports = router