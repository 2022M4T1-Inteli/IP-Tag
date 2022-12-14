//Importando as bibliotecas necessárias para que o programe rode corretamente
#include <WiFiManager.h>
#include <Arduino.h>
#include <WiFi.h>
#include <iostream>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

#include <iostream>
#include <string>
#include <cctype>

#define led 2

HTTPClient http; //Criando umas instância da biblioteca HTTPClient

void postDataToServer(String macAddressLoc) { //Variável responsável por receber o MACADDRESS do dispositivo localizador e atualizar no banco de dados
  
    //Conectando a rota de mudança de dispositivo
    http.begin("https://iptag.herokuapp.com/device/move");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("authorization", "JWT NECESSÁRIO");
    

  Serial.println("Posting JSON data to server...");
  
  StaticJsonDocument<200> doc; //Criando uma variável do tipo StaticJsonDocument que guardará o JSON a ser enviado
  doc["mac_address_moved"] = macAddressLoc; //Enviando o macAddress do dispositivo identificado
  doc["mac_address_router"] = WiFi.macAddress(); //Enviando o macAddress do roteador (o próprio mac do dispositivo)
 
  //Adicionando e formando um JSON com os dados acima
  JsonArray data = doc.createNestedArray("data");
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody); //Fazendo a requisição POST para o servidor
  
  if (httpResponseCode > 0) { //Caso a requisiÃ§Ã£o HTTP funcione retornará um código maior que 0
    String response = http.getString();
    Serial.println(httpResponseCode);
    Serial.println(response);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(led, OUTPUT);
  
  WiFi.mode(WIFI_STA);
  
  //Configurando o WiFiManager para que seja possível cadastrar o ESP a uma rede WiFi
  WiFiManager wm;
  bool res;
  res = wm.autoConnect("CONFIGURAR-ROTEADOR", ""); //Aparecerá uma rede wifi chamada CONFIGURAR-ROTEADOR para que possa ser de fato configurado o wifi
 
  //Caso a conexÃ£o tenha falhado o led piscará por duas vezes e o ESP será resetado
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
    
    //Conectando a rota de cadastro, o dispositivo caso nÃ£o tenha sido cadastrado irá enviar o seu MACADDRESS para o backend, caso já tenha sido cadastrado nada ira ocorrer
    http.begin("https://iptag.herokuapp.com/device/cadastro");
    http.addHeader("Content-type", "application/json");
    http.addHeader("authorization", "JWT NECESSÁRIO");
    
    StaticJsonDocument<200> doc; //Criando uma variável do tipo StaticJsonDocument que guardará o JSON a ser enviado
    doc["nome"] = "SALA PRÉ-CADASTRADA"; //Enviando um nome padrão a ser mostrado pelo frontend
    doc["mac_address"] = WiFi.macAddress(); //Enviando o macAddress do dispositivo

    //Adicionando e formando um JSON com os dados acima
    JsonArray data = doc.createNestedArray("data");
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody); //Realizando a requisição e recebendo um código HTTP após executar a rota
    Serial.println(httpResponseCode);
  }
}

void loop() {
  //Escaneando as redes WIFI
  int n = WiFi.scanNetworks();
  Serial.println("scan done");
  
  if (n == 0) { //Caso ele não tenha encontrado nenhum WIFI
      Serial.println("no networks found");
  } else {
    Serial.print(n);
    Serial.println(" networks found");
    
    //Mapeando as redes encontradas
    for (int i = 0; i < n; ++i) {
      //Caso encontre uma rede com o SSID "IPTAG"
      if (WiFi.SSID(i) == "IPTAG") {
        
        Serial.println("Achei!");
        Serial.println(WiFi.RSSI(i)); //Printando a intensidade de sinal
        
        //Caso a intensidade do sinal seja maior que -30 ele enviará o macAddress desse despositivo para a função postDataToServer
        if (WiFi.RSSI(i) >= (-30)) {
          Serial.println("MAC ADRESS ENCONTRADO: ");
          String BSSID = (WiFi.BSSIDstr(i));
          
          Serial.println(BSSID);
          
          postDataToServer(BSSID);
          delay(1000);
          
          ESP.restart(); //Após isso o ESP será resetado
        }
      }
    }
  }
  
  delay(100);

}
