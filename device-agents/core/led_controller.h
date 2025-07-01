#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H

#include <Arduino.h>
#include "config.h"

class LedController {
private:
    bool ledActive;
    unsigned long ledStartTime;
    unsigned long ledDuration;
    int activeLedPin;

public:
    LedController();
    
    // Initialize LED pins
    void init();
    
    // Update LED state (call in main loop)
    void update();
    
    // Activate LED for specified duration
    void activate(int pin, unsigned long duration);
    
    // Turn off all LEDs
    void turnOffAll();
    
    // Check if LED is currently active
    bool isActive() const;
    
    // Get currently active LED pin
    int getActiveLedPin() const;
    
    // Startup animation
    void startupAnimation();
    
    // WiFi connection animation
    void wifiConnectedAnimation();
};

#endif // LED_CONTROLLER_H
