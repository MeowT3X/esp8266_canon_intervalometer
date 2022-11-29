# esp8266-intervalometer
# Description
This is an Arduino based project.<br />
The goal was to create a simple intervalometer on an esp8266 board for Canon cameras. <br />
It can be used, for example, for remote shooting, timelapse or astrophotography.
The device connects to the camera's 2.5mm jack for remote shutter control.
To control the parameters of the intervalometer, a react-native mobile application is used, which connects to the esp8266 board via wifi soft-ap.
# Compatible camera models
All DSLRs that have a 2.5mm jack for remote shutter control.<br />
Canon: R, Ra, G10, G11, G12, 1100D, 1000D, 70D, 60D, 850D, 800D, 750D, 700D, 650D, 600D, 550D, 450D, 400D,
potentially more.<br />
Project tested on Canon 600D.
# Getting Started