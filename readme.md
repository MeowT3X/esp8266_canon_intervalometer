# esp8266-intervalometer
# Description
This is an Arduino based project.
The goal was to create a simple intervalometer on an esp8266 board for Canon cameras.
It can be used, for example, for remote shooting, timelapse or astrophotography.
The device connects to the camera's 2.5mm jack for remote shutter control.
To control the parameters of the intervalometer, a react-native mobile application is used, which connects to the esp8266 board via wifi soft-ap.
# Compatible camera models
All DSLRs that have a 2.5mm jack for remote shutter control.<br />
Canon: R, Ra, G10, G11, G12, 1100D, 1000D, 70D, 60D, 850D, 800D, 750D, 700D, 650D, 600D, 550D, 450D, 400D,
potentially more.<br />
Project tested on Canon 600D.
# Wiring Diagram
![Wiring diagram](https://github.com/MeowT3X/esp8266_canon_intervalometer/blob/master/scheme.png)
# Getting Started
## Arduino sketch
1. Open arduino sketch canon_intervalometer.ino
2. Setup WI-FI. Replace Soft-AP ssid and password to whatever you want (or just keep defaults)
```c
// WI-FI AP SETUP
const char *ssid = "AP-ESP8266";
const char *password = "987654321";
```
3. Setup relay
```c
// RELAY SETUP
const int relay_pin = 12; // Enter your relay pin number here
const bool relay_breaking = 1; // Use 1 if your relay turns off by breaking contact, use 0 if your relay turns by HIGH/LOW signal
const int relay_delay = 5; // Relay closure delay in ms
```
4. Upload sketch to your esp8266 board
## React native application
### Android
1. Setup development environment: [React Native docs](https://reactnative.dev/docs/environment-setup)
2. Install [Yarn](https://classic.yarnpkg.com/en/docs/install#windows-stable)
3. Install js modules
```sh
cd IntervalometerApp
yarn install
```
4. Build debug apk
```sh
cd IntervalometerApp/android
gradlew assembleDebug
```
5. Install apk at your phone
6. Connect your phone to esp8266 Wi-Fi AP
7. Launch App. It should connects to esp8266 websocket server automatically.
8. Choose intervalometer parameters and start shooting timelapse!
<img src="https://github.com/MeowT3X/esp8266_canon_intervalometer/blob/master/Screenshot_dark_theme.png" width="250"></img>
### iOS
Not tested on iOS, but if you have Mac and apple developer accound, just try build "IntervalometerApp/ios" project using xCode, when install it to your iPhone using TestFlight, it should work fine.
## License
MIT
