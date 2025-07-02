#ifndef NFC_READER_H
#define NFC_READER_H

#include <Wire.h>
#include <Adafruit_PN532.h>
#include "config.h"

struct NFCData {
    String uidHex;
    uint32_t reversedUID;
    uint8_t uidLength;
    bool valid;
};

class NFCReader {
private:
    Adafruit_PN532* nfc;

public:
    NFCReader();
    ~NFCReader();
    
    // Initialize NFC reader
    bool init();
    
    // Read NFC card data
    NFCData readCard(unsigned int timeout = 1000);
    
    // Check if NFC reader is ready
    bool isReady() const;
    
    // Get firmware version
    uint32_t getFirmwareVersion() const;

private:
    // Convert UID array to hex string
    String uidToHexString(uint8_t* uid, uint8_t length);
    
    // Calculate reversed UID
    uint32_t calculateReversedUID(uint8_t* uid, uint8_t length);
};

#endif // NFC_READER_H
