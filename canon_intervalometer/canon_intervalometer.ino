#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <DNSServer.h>
#include <WebSockets.h>
#include <WebSockets4WebServer.h>
#include <WebSocketsServer.h>

// WI-FI AP SETUP
const char *ssid = "AP-ESP8266";
const char *password = "987654321";

IPAddress local_IP(192, 168, 4, 10);
IPAddress subnet(255, 255, 255, 0);

// DNS SETUP
const char* mdnsName = "esp8266"; //Should work at least on windows. Try http://esp8266.local
const byte DNS_PORT = 53;
DNSServer dnsServer;

// RELAY SETUP
const int relay_pin = 12; // Enter your relay pin number here
const bool relay_breaking = 1; // Use 1 if your relay turns off by breaking contact, use 0 if your relay turns by HIGH/LOW signal
const int relay_delay = 5; // Relay closure delay in ms

// LED SETUP
const int led_pin = 2;

// Create Webserver
ESP8266WebServer server(80);
WebSocketsServer ws(81);

String index_html = "<!DOCTYPE HTML><html> <head> <titleESP8266 Intervalometer Web Server</title> <meta name='viewport' content='width=device-width, initial-scale=1'> <style> html { font-family: Arial, Helvetica, sans-serif; text-align: center; } h1 { font-size: 1.8rem; color: white; } h2{ font-size: 1.5rem; font-weight: bold; color: #143642; } .topnav { overflow: hidden; background-color: #143642; } body { margin: 0; } .content { padding: 30px; max-width: 600px; margin: 0 auto; } .card { background-color: #F8F7F9;; box-shadow: 2px 2px 12px 1px rgba(140,140,140,.5); padding-top:10px; padding-bottom:20px; } .state { font-size: 1.5rem; color:#8c8c8c; font-weight: bold; } </style> </head> <body> <div class='topnav'> <h1>ESP8266 Intervalometer Web Server</h1> </div> <div class'content'> <div class='card'> <p class='state'>Websocket: <span id='ip'>ws://" + local_IP.toString() + ":81</span></p>\</div> </div> </body> </html>";

bool job = 0;
uint8_t web_socket_client = 0;

int start_after;
int take_shots;
int interval;
int bulb_timer;
int counter;

void resetValues() {
  start_after = 0;
  take_shots = 1;
  interval = 1000;
  bulb_timer = 510;
  counter = 0;
}

void relayOn() {
  if (relay_breaking) {
    pinMode(relay_pin, OUTPUT);
    digitalWrite(relay_pin, HIGH);
  }
  digitalWrite(relay_pin, HIGH);
  digitalWrite(led_pin, LOW);
}

void relayOff() {
  if (relay_breaking) {
    pinMode(relay_pin, INPUT);
  } else {
    digitalWrite(relay_pin, LOW);
  }
  digitalWrite(led_pin, HIGH);
}

void openShutter(int timer) {
  // For correct bulb exposure required to subtract relay delay in ms from bulb timer
  timer = timer - relay_delay;
  if (timer < 0) {
    timer = 0;
  }

  Serial.printf("Shutter open for: %d ms\n", timer);

  relayOn();
  delay(timer);
  relayOff();
}

void notifyClient() {
  String message = "JOB;";
  message += String(counter) + ";";
  message += String(take_shots);
  Serial.println(message);
  ws.sendTXT(web_socket_client, message);
}

void handleWebSocketMessage(uint8_t *data, size_t len) {
  Serial.println((char*)data);

  char *str1, *token;
  char *saveptr1;
  int j;
  bool m_correct = false;

  if (!job) {
    resetValues();

    // Try to decode start command
    for (j = 1, str1 = (char*)data; ; j++, str1 = NULL) {
      token = strtok_r(str1, ";", &saveptr1);
      if (token == NULL)
        break;
      if (j == 1 && strcmp((char*)token, "START") == 0) {
        m_correct = true;
      }
      if (j == 2 && m_correct) {
        start_after = atoi((char*)token);
      }
      if (j == 3 && m_correct) {
        take_shots = atoi((char*)token);
      }
      if (j == 4 && m_correct) {
        interval = atoi((char*)token);
      }
      if (j == 5 && m_correct) {
        bulb_timer = atoi((char*)token);
      }
    }
    if (m_correct) {
      // Start command received
      job = 1;
      notifyClient();
    }
  } else if (strcmp((char*)data, "STOP") == 0) {
    // Stop command received
    job = 0;
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *data, size_t len) {
  switch (type) {
    case WStype_TEXT:
      handleWebSocketMessage(data, len);
      break;
    case WStype_DISCONNECTED:
      Serial.printf("WebSocket Client [%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      IPAddress ip = ws.remoteIP(num);
      Serial.printf("WebSocket Client [%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], data);
      web_socket_client = num;
      break;
  }
}

void handleIndex() {
  server.send(200, "text/html", index_html);
}

void setupRelay() {
  // Relay init
  // Relay controls camera shutter
  if (relay_breaking) {
    pinMode(relay_pin, INPUT);
  } else {
    pinMode(relay_pin, OUTPUT);
    digitalWrite(relay_pin, LOW);
  }

  // LED init
  // LED turns on/off according to relay for debugging purpose
  pinMode(led_pin, OUTPUT);
  digitalWrite(led_pin, HIGH);
}

void setupWifi() {
  // Setup Soft-AP
  WiFi.mode(WIFI_OFF);

  delay(100);

  WiFi.mode(WIFI_AP);

  delay(100);

  Serial.print("Setting soft-AP configuration ... ");
  Serial.println(WiFi.softAPConfig(local_IP, local_IP, subnet) ? "Ready" : "Failed!");

  delay(100);

  Serial.print("Setting soft-AP ... ");
  Serial.println(WiFi.softAP(ssid, password) ? "Ready" : "Failed!");

  Serial.print("Soft-AP IP address = ");
  Serial.println(WiFi.softAPIP());
}

void setupDNS() {
  // Setup the DNS server redirecting all the domains to the AP IP
  MDNS.begin(mdnsName);
  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(DNS_PORT, "*", local_IP);
  Serial.println("DNS server started.");
}

void setupWebSocket() {
  // Init websocket server
  ws.begin();
  ws.onEvent(webSocketEvent);
  Serial.println("WebSocket server started.");
}

void setupWebServer() {
  // Init http server
  // Routes for web page
  server.on("/", handleIndex);
  server.on("/generate_204", handleIndex);  //Android captive portal
  server.on("/fwlink", handleIndex); //Microsoft captive portal
  server.onNotFound([]() {
    server.send(404, "text/plain", "404: Not Found");
  });
  // Start server
  server.begin();
  Serial.println("HTTP server started.");
}


void setup() {
  Serial.begin(9600);
  delay(500);
  Serial.println();

  setupRelay();
  setupWifi();
  setupDNS();
  setupWebSocket();
  setupWebServer();
}

void doJob() {
  if (job) {
    if (start_after > 0) {
      delay(start_after);
      start_after = 0;
    }

    if (counter < take_shots) {
      openShutter(bulb_timer);
      counter += 1;
      notifyClient();
      if (counter < take_shots) {
        delay(interval);
      }
    } else {
      job = 0;
    }
  }
}

void loop() {
  ws.loop();
  server.handleClient();
  doJob();
}
