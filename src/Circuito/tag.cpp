//Importando as bibliotecas necessárias
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
HTTPClient http; //Estabelecendo uma instância do HTTPClient

#define led 2
#define buzzer 8

//MQTT Server
const char* BROKER_MQTT = ".s1.eu.hivemq.cloud"; //URL do broker MQTT que se deseja utilizar
int BROKER_PORT = 8883; // Porta do Broker MQTT

WiFiClientSecure wifiClient;

#define ID_MQTT  "BCI02"
#define TOPIC_SUBSCRIBE "BUZZER" //Tópico a ser ouvido pelo MQTT, no nosso caso estamos utilizando o serviço de MQTT para gerenciar o alarme sonoro
PubSubClient MQTT(wifiClient);        // Instancia o Cliente MQTT passando o objeto espClient

//Estabelecendo previamente as funções que utilizaremos para o MQTT
void mantemConexoes();
void conectaMQTT();
void recebePacote(char * topic, byte * payload, unsigned int length);

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(9600);
  
  pinMode(8, OUTPUT);
  
  //Configurando o WiFiManager para que seja possível cadastrar o ESP a uma rede WiFi

  WiFiManager wm;
  bool res;
  res = wm.autoConnect("CONFIGURAR-TAG", ""); //Aparecerá uma rede wifi chamada CONFIGURAR-TAG para que possa ser de fato configurado o wifi, colocando o SSID da rede a ser conectada e a senha.
  
  //Caso a conexão WIFI não seja estabelecida, o led piscará e o ESP será resetado.
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
    
    //Uma vez conectado o ESP funcionará como uma rede de internet com o SSID IPTAG que será encontrado pelo roteador em cada sala
    WiFi.softAP("IPTAG", "$Inteli12345", 1);
    delay(500);

    //Conectando a rota de cadastro, o dispositivo caso não tenha sido cadastrado irá enviar o seu MACADDRESS para o backend, caso já tenha sido cadastrado nada ira ocorrer
    http.begin("https://iptag.herokuapp.com/device/cadastro");
    http.addHeader("Content-type", "application/json");
    http.addHeader("authorization", "JWT NECESSÁRIO");
    
    StaticJsonDocument<200> doc; //Criando uma variável do tipo StaticJsonDocument que guardará o JSON a ser enviado
    
    doc["nome"] = "TAG PRÉ-CADASTRADA"; //Enviando um nome padrão a ser mostrado pelo frontend
    doc["mac_address"] = WiFi.macAddress(); //Enviando o macAddress do dispositivo

    //Adicionando e formando um JSON com os dados acima
    JsonArray data = doc.createNestedArray("data");
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody); //Realizando a requisição e recebendo um código HTTP após executar a rota
    Serial.println(httpResponseCode);

    //Configurações do MQTT para que a pré-conexão seja realizada.
    wifiClient.setInsecure(); //Possibilitando que o MQTT seja utilizado
    MQTT.setServer(BROKER_MQTT, BROKER_PORT); //Estabelecendo um servidor com a URL e a PORTA DO MQTT
    MQTT.setCallback(recebePacote); //Utilizando a função "recebePacote" como callback do MQTT
  }
}


//A função loop nesse caso só ira fazer com que o MQTT sempre esteja conectado
void loop() {
  mantemConexoes();
  MQTT.loop();
}

void mantemConexoes() {
  //Caso o MQTT não esteja conectado ele irá executar a funçao "conectaMQTT"
  if (!MQTT.connected()) {
    conectaMQTT();
  }
}

void conectaMQTT() {
  //Caso o MQTT não esteja conectado, o ESP ficará preso dentro desse WHILE até que ele se reconecte
  while (!MQTT.connected()) {
    Serial.print("Conectando ao Broker MQTT: ");
    Serial.println(BROKER_MQTT);

    if (MQTT.connect(ID_MQTT, "USUÁRIO DO MQTT", "SENHA DO MQTT")) {
      Serial.println("Conectado, com sucesso");
      MQTT.subscribe(TOPIC_SUBSCRIBE);
    } else {
      Serial.println("Tentando novamente!");
    }
  }
}


/* A função a seguir sempre estará ouvindo o MQTT por ser um callback, recebe o tópico que está sendo ouvido, um payload com a informação passada e o tamanho dessa informação
 
 A ideia é que um Buzzer seja tocado quando o frontend enviar uma informação com o MacAddress do dispositivo que deseja ser tocado
 */
void recebePacote(char* topic, byte* payload, unsigned int length) {
  String msg;

  //A variável msg será concatenada com cada letra que veio pelo payload.
  for (int i = 0; i < length; i++) {
    char c = (char)payload[i];
    msg += c;
  }

  //O payload será em formato JSON, contudo o tipo será uma String, logo a etapa a seguir será fazendo com que a String se torne um JSON de fato.
  StaticJsonDocument<200> res; //Criando a variável que guardará o JSON deserializado
  deserializeJson(res, msg); //deserializando a mensagem e guardando na variável res
  
  String mac = res["mac_address"]; //Pegando apenas o MAC ADDRESS
  Serial.println(mac);
  
  //Caso o MAC seja igual ao próprio MAC ADDRESS do ESP o buzzer será tocado
  if (mac == WiFi.macAddress()) {
    tone(8, 200, 200);
  }
}
