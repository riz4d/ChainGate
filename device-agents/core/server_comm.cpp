#include "server_comm.h"

ServerComm::ServerComm() {}

ServerResponse ServerComm::sendAccessRequest(const NFCData& nfcData) {
    ServerResponse response;
    response.success = false;
    response.userFound = false;
    response.httpCode = -1;
    
    if (WiFi.status() != WL_CONNECTED) {
        response.message = "WiFi not connected";
        Serial.println(response.message);
        return response;
    }

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String jsonPayload = buildJsonPayload(nfcData);
    Serial.println("Sending JSON: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    response.httpCode = httpResponseCode;
    
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) {
        String serverResponse = http.getString();
        Serial.println("Response: " + serverResponse);
        response = parseResponse(serverResponse, httpResponseCode);
    } else {
        response.message = "POST request failed";
        Serial.println(response.message);
    }

    http.end();
    return response;
}

bool ServerComm::isServerReachable() {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }
    
    HTTPClient http;
    http.begin(serverUrl);
    http.setTimeout(5000); // 5 second timeout
    
    int httpResponseCode = http.GET();
    http.end();
    
    return httpResponseCode > 0;
}

String ServerComm::getChipId() {
    uint64_t chipid = ESP.getEfuseMac();
    char chipIdStr[13];
    sprintf(chipIdStr, "%012llX", chipid);
    return String(chipIdStr);
}

String ServerComm::buildJsonPayload(const NFCData& nfcData) {
    String jsonPayload = "{";
    jsonPayload += "\"uidHex\":\"" + nfcData.uidHex + "\",";
    jsonPayload += "\"reversedUID\":\"" + String(nfcData.reversedUID) + "\",";
    jsonPayload += "\"uidLength\":" + String(nfcData.uidLength) + ",";
    jsonPayload += "\"gateId\":\"" + getChipId() + "\"";
    jsonPayload += "}";
    return jsonPayload;
}

ServerResponse ServerComm::parseResponse(const String& response, int httpCode) {
    ServerResponse result;
    result.httpCode = httpCode;
    result.success = false;
    result.userFound = false;
    
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
        result.success = true;
        result.userFound = doc["user_found"];
        
        Serial.print("User found: ");
        Serial.println(result.userFound);
        
        if (result.userFound) {
            result.userName = doc["user"]["name"].as<String>();
            result.message = "Access granted to: " + result.userName;
            Serial.println(result.message);
        } else {
            result.message = "Access denied: No authorized user found";
            Serial.println(result.message);
        }
    } else {
        result.message = "JSON parsing error: " + String(error.c_str());
        Serial.println(result.message);
    }
    
    return result;
}
