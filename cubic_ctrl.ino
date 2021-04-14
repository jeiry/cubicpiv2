#include <ESP8266WiFi.h>
#include <PubSubClient.h>
const char* ssid = "xxx";
const char* password = "xxxx";
const char* mqtt_server = "www.www.com";
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE  (50)
char msg[MSG_BUFFER_SIZE];
int value = 0;
/////////////////////////////////////////////////////////////////
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif
#define LED_PIN   15
#define LED_COUNT 1
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
/////////////////////////////////////////////////////////////////

#include "ESPRotary.h";

/////////////////////////////////////////////////////////////////

#define ROTARY_PIN1	D5
#define ROTARY_PIN2	D6

/////////////////////////////////////////////////////////////////

ESPRotary r = ESPRotary(ROTARY_PIN1, ROTARY_PIN2);

/////////////////////////////////////////////////////////////////
const int b1 = 4;
const int b2 = 16;
const int b3 = 13;
const int pb = 5;

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  String str;
  for (int i = 0; i < length; i++) {
    str += String((char)payload[i]);
    Serial.print((char)payload[i]);
  }
  Serial.println();
  Serial.print(str);
  if (str.substring(0,3) == "led"){
    int r = str.substring(3,6).toInt();
    Serial.println();
    Serial.print("-----");
    Serial.print(r);
    int g = str.substring(6,9).toInt();
    Serial.println();
    Serial.print("-----");
    Serial.print(g);
    int b = str.substring(9,12).toInt();
    Serial.println();
    Serial.print("-----");
    Serial.print(b);
    setLed(0, r,g,b);
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), "xxxx", "xxxxx")) {
      Serial.println("connected");
      // Once connected, publish an announcement...

      // ... and resubscribe
      client.subscribe("/home/r/croomlight");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void setLed(int led, int r, int g, int b) {
  strip.setPixelColor(led, strip.Color(r, g, b));
  strip.show();
}
void setup() {
  Serial.begin(115200);
  delay(50);
  Serial.println("\n\nSimple Counter");

  strip.begin();
  strip.setBrightness(255);
  setLed(0, 0, 0, 0);
  
  r.setChangedHandler(rotate);
  r.setLeftRotationHandler(showDirection);
  r.setRightRotationHandler(showDirection);
  pinMode(b1, INPUT);
  pinMode(b2, INPUT);
  pinMode(b3, INPUT);
  pinMode(pb, INPUT);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  r.loop();
  if (digitalRead(b1) == HIGH) {
    Serial.println("pushBut1");
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"1\"}");
    delay(250);
  }
  if (digitalRead(b2) == HIGH) {
    Serial.println("pushBut2");
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"2\"}");
    delay(250);
  }
  if (digitalRead(b3) == HIGH) {
    Serial.println("pushBut3");
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"3\"}");
    delay(250);
  }
  if (digitalRead(pb) == HIGH) {
    Serial.println("pushButpb");
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"4\"}");
    delay(250);
  }
}

/////////////////////////////////////////////////////////////////

// on change
void rotate(ESPRotary& r) {
   Serial.println(r.getPosition());
}

// on left or right rotattion
void showDirection(ESPRotary& r) {
  String direct = String(r.directionToString(r.getDirection()));
  Serial.println(direct);
  if(direct == "LEFT"){
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"l\"}");
  }else if(direct == "RIGHT"){
    client.publish("/home/r/cubicpi", "{\"action\": \"pushbut\", \"but\":\"r\"}");
  }
  
}

/////////////////////////////////////////////////////////////////
