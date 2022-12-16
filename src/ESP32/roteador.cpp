#include <WiFiManager.h>
#include <Arduino.h>
#include <WiFi.h>
#include <iostream>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

#define led 2
HTTPClient http;
void postDataToServer(String macAddressLoc) {
  Serial.println("Posting JSON data to server...");
  StaticJsonDocument<200> doc;
  doc["mac_address_router"] = WiFi.macAddress();
  doc["mac_address_moved"] = macAddressLoc;
  JsonArray data = doc.createNestedArray("data");
  String requestBody;
  serializeJson(doc, requestBody);
  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println(httpResponseCode);
    Serial.println(response);
  }
}

void EnviarDados(String macAddLoc) {
  Serial.println("Enviei o MACADRESS");
  Serial.println(macAddLoc);
  postDataToServer(macAddLoc);
}

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(115200);
  pinMode(led, OUTPUT);
  WiFiManager wm;
  bool res;
  res = wm.autoConnect("CONFIGURAR-ROTEADOR", "");

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
  } else {
    Serial.println("connected :)");
    digitalWrite(led, HIGH);
    http.begin("https://iptag.herokuapp.com/device/move");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("authorization", "eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEZXZpY2UifQ.OSqUyuk6fst9MoU7-5iO6mMQ98YTQXUu7tX3noVhSqo");
    
    
    http.begin("https://iptag.herokuapp.com/device/cadastro");
    http.addHeader("Content-type", "application/json");
    http.addHeader("authorization", "eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEZXZpY2UifQ.OSqUyuk6fst9MoU7-5iO6mMQ98YTQXUu7tX3noVhSqo");
    
    StaticJsonDocument<200> doc;
    doc["nome"] = "SALA PRÉ-CADASTRADA";
    doc["mac_address"] = WiFi.macAddress();

    JsonArray data = doc.createNestedArray("data");
    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    Serial.println(httpResponseCode);
  }
}

void loop() {
  int n = WiFi.scanNetworks();

  Serial.println("MEU WIFI: ");
  Serial.print(WiFi.macAddress());

  Serial.println("scan done");
  
  if (n == 0) {
      Serial.println("no networks found");
  } else {
    Serial.print(n);
    Serial.println(" networks found");
    for (int i = 0; i < n; ++i) {
      std::string ssid = (WiFi.SSID(i)).c_str();
      std::string ssidInitials = ssid.substr(0, 4);

      char ssidIniti[ssidInitials.length() + 1]; 

      strcpy(ssidIniti, ssidInitials.c_str()); 
      if (WiFi.SSID(i) == "IPTAG") {
        Serial.println("Achei!");
        Serial.println(WiFi.RSSI(i));
        if (WiFi.RSSI(i) >= (-30)) {
          Serial.println("MAC ADRESS ENCONTRADO: "); 
          Serial.print(WiFi.BSSIDstr(i));
          String BSSID = (WiFi.BSSIDstr(i)); 
          EnviarDados(BSSID);
          delay(1000); 
          ESP.restart();
        }
      } 
    }
  }
  delay(100);

}
