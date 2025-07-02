#ifndef SERVER_COMM_H
#define SERVER_COMM_H

#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"
#include "nfc_reader.h"

struct ServerResponse {
    bool success;
    bool userFound;
    String userName;
    String message;
    int httpCode;
};

class ServerComm {
private:
    String getChipId();

public:
    ServerComm();
    
    // Send access request to server
    ServerResponse sendAccessRequest(const NFCData& nfcData);
    
    // Check server connectivity
    bool isServerReachable();

private:
    // Build JSON payload
    String buildJsonPayload(const NFCData& nfcData);
    
    // Parse server response
    ServerResponse parseResponse(const String& response, int httpCode);
};

#endif // SERVER_COMM_H
