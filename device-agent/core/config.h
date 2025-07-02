#ifndef CONFIG_H
#define CONFIG_H

// Pin Definitions
#define SDA_PIN 8
#define SCL_PIN 9
#define PN532_IRQ   2
#define PN532_RESET 3
#define GREEN_LED_PIN 5
#define RED_LED_PIN 6

// Network Configuration
extern const char* ssid;
extern const char* password;
extern const char* serverUrl;

// LED Duration Constants
extern const unsigned long GREEN_LED_DURATION;
extern const unsigned long RED_LED_DURATION;

// Serial Configuration
#define SERIAL_BAUD_RATE 115200

#endif // CONFIG_H
