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

        setInterval(() => {

            for (let i = 1; i <= 3; i++) {

                var hot = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
                var cold = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                var cold2 = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                var vol = 5
                var current = 1
                var data = {
                    "station_id": i,
                    "hot_water_temp": hot,
                    "cold_water_temp": cold,
                    "cold_water_temp2": cold2,
                    "vol": vol,
                    "current": current
                }
                client.publish("powerstation", JSON.stringify(data))

            }


        }, 60000);
    })
})

client.on("message", function (topic, message) {
    console.log(message.toString())
})