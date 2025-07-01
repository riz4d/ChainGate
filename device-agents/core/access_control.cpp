#include "access_control.h"

AccessControl::AccessControl(NFCReader* nfc, ServerComm* server, LedController* led, WiFiManager* wifi) 
    : nfcReader(nfc), serverComm(server), ledController(led), wifiManager(wifi) {}

bool AccessControl::init() {
    Serial.begin(SERIAL_BAUD_RATE);
    delay(1000);
    
    displaySystemInfo();
    
    // Initialize LED controller
    ledController->init();
    ledController->startupAnimation();
    
    // Connect to WiFi
    if (!wifiManager->connect()) {
        Serial.println("Failed to connect to WiFi. System will not function properly.");
        return false;
    }
    ledController->wifiConnectedAnimation();
    
    // Initialize NFC reader
    if (!nfcReader->init()) {
        Serial.println("Failed to initialize NFC reader");
        // Continuous red LED blinking for NFC error
        while (1) {
            ledController->activate(RED_LED_PIN, 300);
            delay(600);
        }
        return false;
    }
    
    Serial.println("Access Control System initialized successfully");
    return true;
}

void AccessControl::update() {
    ledController->update();
    
    // Only scan for cards if no LED is active or green LED is active
    if (!ledController->isActive() || ledController->getActiveLedPin() == GREEN_LED_PIN) {
        processCardScan();
    }
    
    // Check WiFi connection periodically
    if (!wifiManager->isConnected()) {
        Serial.println("WiFi connection lost. Attempting to reconnect...");
        wifiManager->reconnect();
    }
}

void AccessControl::processCardScan() {
    NFCData nfcData = nfcReader->readCard(1000); // 1 second timeout
    
    if (nfcData.valid) {
        ServerResponse response = serverComm->sendAccessRequest(nfcData);
        handleAccessResponse(response);
        delay(500); // Prevent rapid scanning
    }
}

void AccessControl::handleAccessResponse(const ServerResponse& response) {
    if (response.success) {
        if (response.userFound) {
            ledController->activate(GREEN_LED_PIN, GREEN_LED_DURATION);
        } else {
            ledController->activate(RED_LED_PIN, RED_LED_DURATION);
        }
    } else {
        // Server communication error
        ledController->activate(RED_LED_PIN, 3000);
    }
}

void AccessControl::displaySystemInfo() {
    uint64_t chipid = ESP.getEfuseMac();
    Serial.println("=== ChainGate Access Control System ===");
    Serial.printf("Unique Chip ID: %04X\n", (uint32_t)(chipid >> 32));
    Serial.printf("Full MAC (raw): %012llX\n", chipid);
    Serial.println("System starting up...");
}
