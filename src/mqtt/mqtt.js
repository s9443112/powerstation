const mqtt = require("mqtt")
const client = mqtt.connect("mqtt://luhao.com.tw")

client.on("connect", function () {
    console.log("Success connect mqtt broker.")
    client.subscribe("powerstation", function (err) {
        if (!err) {
            console.log("Success subscribe powerstation topic.")
        }
    })
})

client.on("message", function (topic, message) {
    console.log(message.toString())
})