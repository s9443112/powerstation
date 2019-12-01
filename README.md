# powerstation
台東大學 物理系 溫泉發電感測專案

## 說明
使用nodejs + mysql + mqtt建置的後端，

### 如何下載程式？
如果會用git指令。如果不會下載，請下載zip 壓縮檔。
```
$ git clone https://github.com/s9443112/powerstation.git
```

### 安裝程式
下載完程式後，請到此程式根目錄資料下，按住左shift + 右鍵，會出現powershell 此選項點擊，輸入以下指令
```
$ npm install
```

### 如何執行 
 > 主程式 下指令執行
```
$ npm run start 
```
 > 模擬arduino
 > 請到 src/mqtt 此目錄下後 下指令執行
```
$ cd src/mqtt
$ node mqtt.js
```

### 設定資料庫
config/config.js 設定資料庫
```
const config = {
    DB: {
        database: "DATABASE",
        user_name: "USERNAME",
        password: "PASSWORD",
        host: "127.0.0.1"
    },
}
```
#### Sequelize ORM
 > src/model/index.js 設定資料表及init初始資料表 (使用ORM <sequelize>)
 > helper  - 設定資料表
 > relative - 關聯資料表
 > sync_all - 執行 #不可以註解掉
 
```
helper("city")
helper("station")
helper("sensing_data")

relative("city", "hasMany", "station", { as: "relate_station", foreignKey: "city_id", sourceKey: "city_id" });
relative("station", "hasMany", "sensing_data", { as: "relate_sense", foreignKey: "station_id", sourceKey: "station_id" });

sync_all();
```
#### Sequelize model 
 > src/model/<other_file.js>
 > 設定資料表的資料欄位內設定
```
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('city', {
        city_id: {
            type: DataTypes.INTEGER(11),
            comment: '城市ID',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        city_name:{
            type: DataTypes.STRING(15),
            comment: '城市名稱',
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            comment: '備註',
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: false
    });
};
```
### MQTT 
透過mqtt傳輸協定接收來自Arduino上傳資料
以下有寫 範例程式 及 模擬arduino模擬程式

[NPM MQTT官方套件範例](https://www.npmjs.com/package/mqtt) 
#### example code:

```
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org') //連線網址mqtt broker
 
 //連線後執行的function
client.on('connect', function () {
    // mqtt subscribe 訂閱主題
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt') //mqtt publish推播功能
    }
  })
})
 
 //接收到subscribe已訂閱主題的訊息
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
```

#### 模擬arduino 上傳程式
目前是設定station 1 & 2 & 3 
 > 程式放於 src/mqtt/mqtt.js
```

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
                client.publish("powerstation", JSON.stringify(data))

            }


        }, 60000);
    })
})
```



