#include "led_controller.h"

LedController::LedController() : ledActive(false), ledStartTime(0), ledDuration(0), activeLedPin(-1) {}

void LedController::init() {
    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(RED_LED_PIN, OUTPUT);
    turnOffAll();
}

void LedController::update() {
    if (ledActive && (millis() - ledStartTime >= ledDuration)) {
        digitalWrite(activeLedPin, LOW);
        ledActive = false;
        activeLedPin = -1;
        Serial.println("LED turned off");
    }
}

void LedController::activate(int pin, unsigned long duration) {
    if (ledActive && activeLedPin != -1) {
        digitalWrite(activeLedPin, LOW);
    }
    
    digitalWrite(pin, HIGH);
    ledActive = true;
    ledStartTime = millis();
    ledDuration = duration;
    activeLedPin = pin;
    
    if (pin == GREEN_LED_PIN) {
        Serial.println("GREEN LED activated");
    } else if (pin == RED_LED_PIN) {
        Serial.println("RED LED activated");
    }
}

void LedController::turnOffAll() {
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
    ledActive = false;
    activeLedPin = -1;
}

bool LedController::isActive() const {
    return ledActive;
}

int LedController::getActiveLedPin() const {
    return activeLedPin;
}

void LedController::startupAnimation() {
    for (int i = 0; i < 2; i++) {
        digitalWrite(GREEN_LED_PIN, HIGH);
        digitalWrite(RED_LED_PIN, HIGH);
        delay(200);
        digitalWrite(GREEN_LED_PIN, LOW);
        digitalWrite(RED_LED_PIN, LOW);
        delay(200);
    }
}

void LedController::wifiConnectedAnimation() {
    for (int i = 0; i < 3; i++) {
        digitalWrite(GREEN_LED_PIN, HIGH);
        delay(100);
        digitalWrite(GREEN_LED_PIN, LOW);
        delay(100);
    }
}
