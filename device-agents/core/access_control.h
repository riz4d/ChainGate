#ifndef ACCESS_CONTROL_H
#define ACCESS_CONTROL_H

#include "nfc_reader.h"
#include "server_comm.h"
#include "led_controller.h"
#include "wifi_manager.h"

class AccessControl {
private:
    NFCReader* nfcReader;
    ServerComm* serverComm;
    LedController* ledController;
    WiFiManager* wifiManager;

public:
    AccessControl(NFCReader* nfc, ServerComm* server, LedController* led, WiFiManager* wifi);
    
    // Initialize all components
    bool init();
    
    // Main processing loop
    void update();
    
    // Process NFC card scan
    void processCardScan();
    
    // Handle access response
    void handleAccessResponse(const ServerResponse& response);

private:
    // Display system information
    void displaySystemInfo();
};

#endif // ACCESS_CONTROL_H
