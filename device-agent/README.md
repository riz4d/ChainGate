# ChainGate - Device Agent

## Overview

The ChainGate Device Agent is an Arduino-based access control system that uses NFC card reading for user authentication. The system has been refactored into a modular architecture for better maintainability, testability, and scalability.

## Architecture

### Component Interactions

```
┌─────────────────┐
│  AccessControl  │ ← Main orchestrator
└─────────┬───────┘
          │
    ┌─────▼─────┬─────────┬─────────────┬──────────────┐
    │           │         │             │              │
┌───▼───┐ ┌─────▼──┐ ┌────▼────┐ ┌──────▼─────┐ ┌─────▼──────┐
│  LED  │ │  WiFi  │ │   NFC   │ │   Server   │ │   Config   │
│Control│ │Manager │ │ Reader  │ │    Comm    │ │            │
└───────┘ └────────┘ └─────────┘ └────────────┘ └────────────┘
```

## Hardware Requirements

### Components

- ESP32 Development Board
- PN532 NFC Reader Module
- Power Supply (5V/2A)
- 2x LEDs (Green and Red)
- 2x Current-limiting resistors (220Ω recommended)
- Breadboard and jumper wires
- Relay module for electric lock control

### Pin Configuration

```cpp
#define SDA_PIN 8           // I2C Data pin for NFC
#define SCL_PIN 9           // I2C Clock pin for NFC
#define PN532_IRQ 2         // NFC interrupt pin
#define PN532_RESET 3       // NFC reset pin
#define GREEN_LED_PIN 5     // Access granted indicator
#define RED_LED_PIN 6       // Access denied indicator
```

### Wiring Diagram

```
ESP32          PN532
-----          -----
3.3V    ───────  VCC
GND     ───────  GND
Pin 8   ───────  SDA
Pin 9   ───────  SCL
Pin 2   ───────  IRQ
Pin 3   ───────  RST

ESP32          LEDs
-----          ----
Pin 5   ──[220Ω]── Green LED ── GND
Pin 6   ──[220Ω]── Red LED ── GND
```

## Software Architecture

### 1. Configuration Module (`config.h/cpp`)

**Purpose**: Centralized configuration management

**Key Features**:

- Pin definitions
- Network credentials
- System constants
- Easy configuration updates

**Usage**:

```cpp
#include "core/config.h"
// All pin definitions and constants are available
```

### 2. LED Controller (`led_controller.h/cpp`)

**Purpose**: Manages LED status indicators

**Key Features**:

- Non-blocking LED control
- Timed LED activation
- Startup and status animations
- State management

**Public Methods**:

```cpp
void init();                                    // Initialize pins
void update();                                  // Update LED states (call in loop)
void activate(int pin, unsigned long duration); // Activate LED for duration
void startupAnimation();                        // System startup indication
void wifiConnectedAnimation();                  // WiFi connection indication
bool isActive() const;                          // Check if any LED is active
```

### 3. WiFi Manager (`wifi_manager.h/cpp`)

**Purpose**: Handles WiFi connectivity

**Key Features**:

- Connection establishment
- Connection monitoring
- Automatic reconnection
- Status reporting

**Public Methods**:

```cpp
bool connect();           // Connect to WiFi
bool isConnected() const; // Check connection status
String getStatusString(); // Get readable status
bool reconnect();         // Reconnect if needed
```

### 4. NFC Reader (`nfc_reader.h/cpp`)

**Purpose**: NFC card reading and data processing

**Key Features**:

- PN532 chip initialization
- Card detection and reading
- UID processing and formatting
- Error handling

**Data Structure**:

```cpp
struct NFCData {
    String uidHex;        // Hex representation of UID
    uint32_t reversedUID; // Reversed UID for server
    uint8_t uidLength;    // Length of UID
    bool valid;           // Whether read was successful
};
```

**Public Methods**:

```cpp
bool init();                              // Initialize NFC reader
NFCData readCard(unsigned int timeout);   // Read card with timeout
bool isReady() const;                     // Check if reader is ready
```

### 5. Server Communication (`server_comm.h/cpp`)

**Purpose**: Handles all server communication

**Key Features**:

- HTTP POST requests
- JSON payload construction
- Response parsing
- Error handling

**Data Structures**:

```cpp
struct ServerResponse {
    bool success;      // Request successful
    bool userFound;    // User authorized
    String userName;   // User's name
    String message;    // Response message
    int httpCode;      // HTTP response code
};
```

**Public Methods**:

```cpp
ServerResponse sendAccessRequest(const NFCData& nfcData); // Send access request
bool isServerReachable();                                 // Check server status
```

### 6. Access Control (`access_control.h/cpp`)

**Purpose**: Main system orchestration

**Key Features**:

- Component initialization
- Main processing loop
- Decision making
- Error handling and recovery

**Public Methods**:

```cpp
bool init();           // Initialize all components
void update();         // Main processing loop
void processCardScan(); // Handle NFC card detection
```

## System Flow

### Initialization Sequence

1. **System Startup**

   - Initialize serial communication
   - Display system information
   - Initialize LED controller
   - Perform startup animation
2. **Network Setup**

   - Connect to WiFi
   - Display connection status
   - Perform WiFi connected animation
3. **Hardware Initialization**

   - Initialize NFC reader
   - Verify PN532 connectivity
   - Configure for card detection

### Main Operation Loop

1. **LED State Management**

   - Update active LED timers
   - Turn off expired LEDs
2. **Card Detection**

   - Scan for NFC cards (if not blocked by active red LED)
   - Process card data when detected
3. **Server Communication**

   - Send access request to server
   - Parse server response
4. **Access Decision**

   - Grant access (Green LED) if user authorized
   - Deny access (Red LED) if user not authorized
   - Handle errors appropriately
5. **Connection Monitoring**

   - Check WiFi connection status
   - Attempt reconnection if needed

## LED Status Indicators

| LED Color          | Duration   | Meaning               |
| ------------------ | ---------- | --------------------- |
| Green              | 3 seconds  | Access Granted        |
| Red                | 3 seconds  | Access Denied         |
| Red (blinking)     | Continuous | NFC Reader Error      |
| Both (alternating) | Startup    | System Initialization |
| Green (3 blinks)   | Startup    | WiFi Connected        |

## Configuration

### Network Settings

Edit `core/config.cpp`:

```cpp
const char* ssid = "YourWiFiNetwork";
const char* password = "YourPassword";
const char* serverUrl = "http://your-server.com/api/access/";
```

### Timing Settings

```cpp
const unsigned long GREEN_LED_DURATION = 3000; // 3 seconds
const unsigned long RED_LED_DURATION = 3000;   // 3 seconds
```

## Error Handling

### WiFi Connection Issues

- Automatic reconnection attempts
- Status logging
- Red LED indication for extended failures

### NFC Reader Issues

- Initialization validation
- Continuous red LED blinking for hardware failures
- Graceful degradation

### Server Communication Issues

- Timeout handling
- Network error detection
- Offline operation consideration

## Development and Testing

### Compilation

Use Arduino IDE or PlatformIO with ESP32 board support.

### Required Libraries & Credits

This project depends on several excellent open-source libraries:

#### **Adafruit PN532 Library**

- **Author**: Adafruit Industries
- **Purpose**: NFC/RFID communication with PN532 chip
- **License**: MIT License
- **Repository**: https://github.com/adafruit/Adafruit_PN532
- **Credit**: "Written by Limor Fried/Ladyada for Adafruit Industries"

#### **ArduinoJson**

- **Author**: Benoit Blanchon
- **Purpose**: JSON parsing and serialization
- **License**: MIT License
- **Repository**: https://github.com/bblanchon/ArduinoJson
- **Version**: 7.x compatible
- **Credit**: "The most efficient JSON library for embedded C++"

#### **ESP32 WiFi Library**

- **Author**: Espressif Systems
- **Purpose**: WiFi connectivity management
- **License**: Apache License 2.0
- **Repository**: Part of ESP32 Arduino Core
- **Credit**: Built-in library for ESP32 Arduino framework

#### **ESP32 HTTPClient Library**

- **Author**: Espressif Systems / Arduino Community
- **Purpose**: HTTP/HTTPS client functionality
- **License**: LGPL-2.1
- **Repository**: Part of ESP32 Arduino Core
- **Credit**: Based on ESP-IDF HTTP client

#### **Wire Library**

- **Author**: Arduino Team
- **Purpose**: I2C communication protocol
- **License**: LGPL
- **Repository**: Part of Arduino Core
- **Credit**: Standard Arduino I2C library

### Installation Commands

```bash
# In Arduino IDE Library Manager, search and install:
# - "Adafruit PN532" by Adafruit
# - "ArduinoJson" by Benoit Blanchon
# WiFi, HTTPClient, and Wire are included with ESP32 core
```

### Debug Features

- Serial output for all major operations
- Component status reporting
- Error message logging

## Maintenance

### Troubleshooting

#### Common Issues

1. **NFC Not Reading Cards**

   - Check wiring connections
   - Verify power supply
   - Test with different cards
2. **WiFi Connection Problems**

   - Verify credentials
   - Check signal strength
   - Review network configuration
3. **Server Communication Failures**

   - Verify server endpoint
   - Check network connectivity
   - Review API format## Acknowledgments
