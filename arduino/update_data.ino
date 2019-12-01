#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <math.h>

#define WIFI_SSID "CloudProgramming" //填入WiFi帳號
#define WIFI_PASSWORD "61797015"     //填入WiFi密碼

const char *mqttServer = "luhao.com.tw"; //填入MQTT Broker的IP或Domain
const char *mqttusername = "luhao";
const char *mqttpassword = "a23387696";

const int mqttPort = 1883; //MQTT Broker的Port

const char *clientID = "arduinoClienttest"; //填入自訂ID
const char *topic = "powerstation";         //填入自訂主題名稱(階層式命名)

int WiFi_Status = WL_IDLE_STATUS; //ＷiFi狀態

unsigned long prevMillis = 0; //暫存經過時間(單位:毫秒)

int num = 4; // 定義電路中電阻的數量

const float voltagePower = 5;
const float Rs = 100; //採樣電阻為100千歐姆
const int B = 3950;
const double T1 = 273.15 + 25; //常溫
const double R1 = 10;          //常溫對應的阻值，注意單位是千歐

const int analogInPin = A0;

WiFiClient espClient;           //設定WiFiEspClient物件
PubSubClient client(espClient); //設定PubSubClient物件(帶入espClient)

void setup()
{

    //設定序列埠傳輸速率(9600bps)
    Serial.begin(9600);

    //wifi設定
    wifi_Setting();

    //MQTTServer設定
    client.setServer(mqttServer, mqttPort);
}

void loop()
{
    String s = "";
    while (Serial.available())
    {
        char c = Serial.read();
        if (c != '\n')
        {
            s += c;
        }
        delay(5); // 沒有延遲的話 UART 串口速度會跟不上Arduino的速度，會導致資料不完整
    }

    if (!client.connected())
    {
        Serial.println("MQTT斷線中");
        reconnectMQTT(); //MQTT重新連線
    }

    //每10秒更新數值
    if (millis() - prevMillis > 10000)
    {
        if (s != "")
        {
            //        Serial.println(s);
            getData_sendToMqtt(s); //取得與發布數值
            prevMillis = millis();
        }
    }

    client.loop();
}

//wifi設定方法
void wifi_Setting()
{
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print("Connecting to ");
        Serial.println(WIFI_SSID);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        while (WiFi.status() != WL_CONNECTED)
        {
            delay(500);
            Serial.print(".");
        }
        Serial.println();
        Serial.println("WiFi connected");
        Serial.println("Local IP address: ");
        Serial.println(WiFi.localIP());
    }
    Serial.println("");
    Serial.println("WiFi connected");
}

//MQTT重新連接方法
void reconnectMQTT()
{
    while (!client.connected())
    {
        if (client.connect(clientID, mqttusername, mqttpassword))
        {
            Serial.println("MQTT 已連接!");
        }
        else
        {
            Serial.print("失敗!, rc=");
            Serial.print(client.state());
            Serial.println("三秒之後重試...");
            delay(3000);
        }
    }
}

//取得與傳送數值
void getData_sendToMqtt(String s)
{

    //發布payload
    byte arrSize = s.length() + 1;
    Serial.println(arrSize);
    char message[arrSize];
    s.toCharArray(message, arrSize);
    client.publish(topic, message);
    Serial.println(message);
}
