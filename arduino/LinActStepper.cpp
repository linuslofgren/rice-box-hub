#include <Arduino.h>
#include "InterruptHandler.h"

class LinActStepper : InterruptHandler {
    public:
        uint8_t stepPin;
        uint8_t dirPin;
        volatile uint8_t stallPin;

        LinActStepper() {}

        LinActStepper(uint8_t stepPin, uint8_t dirPin, uint8_t stallPin) {
            this->stepPin  = stepPin;
            this->dirPin = dirPin;
            this->stallPin = stallPin;
            _setupPinModes();
        }

        virtual void handleInterrupt(int8_t interruptNum) {
            _stopStepping();
        }

        void step(float stepLength /*in mm*/) {
            // speed = 12.25 mm/s
            float invSpeed = 81.63265306122449; // s/m
            _startStepping();
            delay(stepLength*invSpeed);
            _stopStepping();
        }

        void changeDir() {
            digitalWrite(dirPin, !digitalRead(dirPin));
        }

        void setDirForward() {
            digitalWrite(dirPin, LOW);
        }

        void setDirBackward() {
            digitalWrite(dirPin, HIGH);
        }

    private:
        void _setupPinModes() {
            pinMode(stepPin, OUTPUT);
            pinMode(dirPin, OUTPUT);
            pinMode(stallPin, INPUT);
            attachInterrupt(digitalPinToInterrupt(stallPin), LOW);
        }

        void _startStepping() {
            analogWrite(stepPin, 127);
        }

        void _stopStepping() {
            analogWrite(stepPin, 0);
        }
};
