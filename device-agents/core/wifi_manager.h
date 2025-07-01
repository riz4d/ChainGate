#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include "config.h"

class WiFiManager {
public:
    WiFiManager();
    
    // Initialize and connect to WiFi
    bool connect();
    
    // Check WiFi connection status
    bool isConnected() const;
    
    // Get connection status string
    String getStatusString() const;
    
    // Reconnect if connection is lost
    bool reconnect();
};

#endif // WIFI_MANAGER_H
