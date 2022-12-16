#include <WiFiManager.h>
#include <Arduino.h>
#include <WiFi.h>
#include <iostream>
#include <WiFiClient.h>
#include "esp_wifi.h"

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#include <HTTPClient.h>
HTTPClient http; 

#define led 2
#define buzzer 8

//MQTT Server
const char* BROKER_MQTT = "602ff603e70c4e1b9a8888b7ee2c2402.s1.eu.hivemq.cloud"; //URL do broker MQTT que se deseja utilizar
int BROKER_PORT = 8883; // Porta do Broker MQTT

WiFiClientSecure wifiClient;

#define ID_MQTT  "BCI02"
#define TOPIC_SUBSCRIBE "BUZZER"
PubSubClient MQTT(wifiClient);        // Instancia o Cliente MQTT passando o objeto espClient

void mantemConexoes(); 
void conectaWiFi();
void conectaMQTT();
void recebePacote(char * topic, byte * payload, unsigned int length);

void battery(){
   int value = analogRead(1);
   float voltage = value*(5.00/1023.00)*2;
   Serial.print("Nivel:");
   Serial.print(voltage);
   Serial.print("%");
   Serial.print("");
 }

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(9600);
  pinMode(8, OUTPUT);
  WiFiManager wm;
  bool res;
  res = wm.autoConnect("Configurar-ESP32", "");

  if (!res) {
    Serial.println("Failed to connect");
    digitalWrite(led, HIGH);
    delay(1000);
    digitalWrite(led, LOW);
    delay(1000);
    digitalWrite(led, HIGH);
    delay(1000);
    digitalWrite(led, LOW);
    delay(1000);
    ESP.restart();
  }
  else {
    Serial.println("connected :)");
    digitalWrite(led, HIGH);
    WiFi.softAP("IPTAG", "$Inteli12345", 1);
    delay(500);

    http.begin("https://iptag.herokuapp.com/device/cadastro"); 
    http.addHeader("Content-type", "application/json");
    http.addHeader("authorization", "eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEZXZpY2UifQ.OSqUyuk6fst9MoU7-5iO6mMQ98YTQXUu7tX3noVhSqo");
    
    StaticJsonDocument<200> doc; 
    doc["nome"] = "TAG PRÉ-CADASTRADA";
    doc["mac_address"] = WiFi.macAddress(); 

    JsonArray data = doc.createNestedArray("data");
    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    Serial.println(httpResponseCode);

    wifiClient.setInsecure(); 
    MQTT.setServer(BROKER_MQTT, BROKER_PORT);
    MQTT.setCallback(recebePacote);
  }
}


void loop() {
  mantemConexoes(); 
  MQTT.loop(); 
}

void mantemConexoes() {
  if (!MQTT.connected()) {
    conectaMQTT(); 
  }
}

void conectaMQTT() {
  while (!MQTT.connected()) {
    Serial.print("Conectando ao Broker MQTT: "); 
    Serial.println(BROKER_MQTT); 

    if (MQTT.connect(ID_MQTT, "gabcarneiro", "MR.mZ_Y8v46xxJE")) {
      Serial.println("Conectado, graças a Deus");
      Serial.print("Meu mac"); 
      Serial.println(WiFi.macAddress());
      MQTT.subscribe(TOPIC_SUBSCRIBE); 
    } else {
      Serial.println("Tentando novamente!");
    }
  }
}

void recebePacote(char* topic, byte* payload, unsigned int length) {
  String msg; 

  for (int i = 0; i < length; i++) {
    char c = (char)payload[i]; 
    msg += c; 
  }

  StaticJsonDocument<200> res;
  deserializeJson(res, msg);
  
  String mac = res["mac_address"];
  Serial.println(mac);
  
  if (mac == WiFi.macAddress()) {
    tone(8, 200, 200);
  }
}
