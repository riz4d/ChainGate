// ChainGate Access Control System
// Modular Architecture Implementation

#include "core/config.h"
#include "core/led_controller.h"
#include "core/wifi_manager.h"
#include "core/nfc_reader.h"
#include "core/server_comm.h"
#include "core/access_control.h"

// Component instances
LedController ledController;
WiFiManager wifiManager;
NFCReader nfcReader;
ServerComm serverComm;
AccessControl accessControl(&nfcReader, &serverComm, &ledController, &wifiManager);

void setup() {
    // Initialize the access control system
    accessControl.init();
}

void loop() {
    // Main system update loop
    accessControl.update();
}
