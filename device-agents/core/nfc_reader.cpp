#include "nfc_reader.h"

NFCReader::NFCReader() {
    nfc = new Adafruit_PN532(PN532_IRQ, PN532_RESET, &Wire);
}

NFCReader::~NFCReader() {
    delete nfc;
}

bool NFCReader::init() {
    Wire.begin(SDA_PIN, SCL_PIN);
    
    nfc->begin();
    uint32_t versiondata = nfc->getFirmwareVersion();
    
    if (!versiondata) {
        Serial.println("Didn't find PN53x board");
        return false;
    }

    Serial.print("Found PN532 with firmware version: ");
    Serial.print((versiondata >> 16) & 0xFF, DEC);
    Serial.print('.');
    Serial.println((versiondata >> 8) & 0xFF, DEC);

    nfc->SAMConfig();
    Serial.println("NFC Reader initialized. Waiting for cards...");
    return true;
}

NFCData NFCReader::readCard(unsigned int timeout) {
    NFCData data;
    data.valid = false;
    
    uint8_t success;
    uint8_t uid[7];
    uint8_t uidLength;

    success = nfc->readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, timeout);
    
    if (success) {
        data.uidHex = uidToHexString(uid, uidLength);
        data.reversedUID = calculateReversedUID(uid, uidLength);
        data.uidLength = uidLength;
        data.valid = true;
        
        Serial.print("UID (HEX): ");
        Serial.println(data.uidHex);
        Serial.print("Reversed UID (decimal): ");
        Serial.println(data.reversedUID);
    }
    
    return data;
}

bool NFCReader::isReady() const {
    return nfc->getFirmwareVersion() != 0;
}

uint32_t NFCReader::getFirmwareVersion() const {
    return nfc->getFirmwareVersion();
}

String NFCReader::uidToHexString(uint8_t* uid, uint8_t length) {
    String uidHex = "";
    for (uint8_t i = 0; i < length; i++) {
        if (uid[i] < 0x10) {
            uidHex += "0";
        }
        uidHex += String(uid[i], HEX);
        if (i != length - 1) {
            uidHex += ":";
        }
    }
    return uidHex;
}

uint32_t NFCReader::calculateReversedUID(uint8_t* uid, uint8_t length) {
    uint8_t uid4[4] = {0};
    for (uint8_t i = 0; i < ((length < 4) ? length : 4); i++) {
        uid4[i] = uid[i];
    }

    uint32_t reversedUID = 0;
    for (int i = 3; i >= 0; i--) {
        reversedUID <<= 8;
        reversedUID |= uid4[i];
    }
    
    return reversedUID;
}
