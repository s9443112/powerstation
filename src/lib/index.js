const cp = require("child_process");

var sub_mqtt = undefined;

function create_subprocess(){
    var sub_mqtt_options = {
        env:{
            NODE_PATH: "./node_modules",
        }
    }

    sub_mqtt = cp.fork("./src/mqtt/mqtt.js",undefined,sub_mqtt_options)

    sub_mqtt.on("exit",function(){
        sub_mqtt = create_subprocess()
    })
}

create_subprocess()

process.on("SIGINT", function () {
    if(sub_mqtt) {
        sub_mqtt.removeAllListeners();
        sub_mqtt.kill();
    }
    sub_mqtt.exit(0);
})

sub_mqtt.on('error', function(err) {
});