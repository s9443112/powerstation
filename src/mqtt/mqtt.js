const mqtt = require("mqtt")
var option = {
    username: "luhao",
    password: "a23387696"
}
const client = mqtt.connect("mqtt://luhao.com.tw", option)
var topic = "powerstation"
client.on("connect", function () {
    console.log("Success connect mqtt broker.")
    if (process.env.UNIT_TEST){
        topic = "testpowerstation"
    }
    client.subscribe(topic, function (err) {
        if (!err) {
            console.log(`Success subscribe ${topic} topic.`)
        }

        setInterval(() => {

            for (let i = 1; i <= 3; i++) {

                var hot = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
                var cold = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                var cold2 = Math.floor(Math.random() * (20 - 0 + 1)) + 0;
                var vol = Math.floor(Math.random() * (28 - 24 + 1)) + 24;
                var current = Math.floor(Math.random() * (1 - 0.5)) + 0.5;
                var data = {
                    "station_id": i,
                    "hwt": hot,
                    "cwt": cold,
                    "cwt2": cold2,
                    "vol": vol,
                    "i": current
                }
                client.publish(topic, JSON.stringify(data))

            }


        }, 5000);
    })
})

client.on("message", function (topic, message) {
    console.log(message.toString())
})