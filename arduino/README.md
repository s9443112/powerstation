# Arduino powerstation project

 > 台東大學 物理系 溫泉發電感測專案

## Arduino 程式部分
 > 分成感測和上傳的嵌入式系統的程式
 > get_data.ino, update_data.ino

### get_data.ino
 > 程式跟原本寫好的範本是一樣的，analogRead 類比輸入可以設定A0-A5都可以使用。
 > A0設定hot_water_temp - 熱水感測
 > A3設定cold_water_temp - 冷水1感測
 > 剩下冷水2號感測還沒設定，那未來看來A0-A5可以再做調整。
 > 透過uart傳送資料 Serial.println()

 - 如何透過UART傳遞
 > Serial.println 除了顯示功能，也可以用來傳遞資料，但請注意如果要測試程式時需要print資料時，請不要接上uart接腳
 ```
String payload = "{";
payload += "\"station_id\":";
payload += clientID;
payload += ",";
payload += "\"hwt\":";
payload += ((T1 * B) / (B + T1 * log(Rt / R1))) - 273.15;
payload += ",";
payload += "\"cwt\":";
payload += ((T1 * B) / (B + T1 * log(Rtt / R1))) - 273.15;
payload += ",";
payload += "\"vol\":";
payload += vol;
payload += ",";
payload += "\"i\":";
payload += A;
payload += "}";

Serial.println(payload);
 ```
 
### update_data.ino
 > 這支程式是用來上傳資料，那是透過mqtt通訊協定來上傳資料。
 > 程式未來轉交回去後，需要重新設定幾個部分，WIFI的 SSID & PASSWORD，MQTT Broker 目前可以暫用我們這邊的
 - WIFI
 ```
#define WIFI_SSID "WIFI_SSID" //填入WiFi帳號
#define WIFI_PASSWORD "WIFI_PASSWORD" //填入WiFi密碼
 ```
 - MQTT Broker
```
const char *mqttServer = "IP ADDRESS"; //填入MQTT Broker的IP或Domain
const char *mqttusername = "USERNAME";
const char *mqttpassword = "PASSWORD";
```

 - MQTT部分設定
 > clientID 設定最好每個感測器都設定不一樣的uuid，給每個裝置都有一個獨立的ID
 > topic 是訂閱主題，詳細請參閱MQTT協定
```
const char *clientID = "arduinoClienttest"; //填入自訂ID
const char *topic = "powerstation";         //填入自訂主題名稱(階層式命名)
```