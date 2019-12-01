#include <math.h>
int num = 4; // 定義電路中電阻的數量

const float voltagePower = 5;
const float Rs = 100; //採樣電阻為100千歐姆
const int B = 3950;
const double T1 = 273.15 + 25; //常溫
const double R1 = 10;          //常溫對應的阻值，注意單位是千歐

const char *clientID = "4"; //填入自訂ID

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    double digitalValue = analogRead(0);

    double voltageValue = (digitalValue / 1023) * 5;                 //獲得A0處電壓值
    double Rt = ((voltagePower - voltageValue) * Rs) / voltageValue; //通過分壓比獲得熱敏電阻阻值

    double digital = analogRead(3);
    double voltage = (digital / 1023) * 5;                  //獲得A3處電壓值
    double Rtt = ((voltagePower - voltage) * Rs) / voltage; //通過分壓比獲得熱敏電阻阻值

    int V1 = analogRead(1);                //從A1口讀取電壓數據存入剛剛創建整數型變量V1，模擬口的電壓測量範圍為0-5V 返回的值為0-1024
    float vol = V1 * (5.0 / 1023.0) * num; //我們將 V1的值換算成實際電壓值存入浮點型變量 vol

    float A = (V1 * (5.0 / 1023.0)) / 10;
    //我們將 V1的值換算成實際電壓值存入浮點型變量 vol再除以電阻值
    delay(1000); //輸出完成後等待1秒鐘，用於控制數據的刷新速度

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
}
