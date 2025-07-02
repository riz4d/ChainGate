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
    void init();
    
    void update();
    void activate(int pin, unsigned long duration);
    void turnOffAll();
    bool isActive() const;
    int getActiveLedPin() const;
    void startupAnimation();
    void wifiConnectedAnimation();
};

#endif
