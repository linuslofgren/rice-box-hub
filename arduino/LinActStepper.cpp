#include <Arduino.h>
#include "InterruptHandler.h"

class LinActStepper : InterruptHandler {
    public:
        uint8_t stepPin;
        uint8_t dirPin;
        volatile uint8_t stallPin;
        uint8_t enablePin;
        static const float invSpeed = 39.93610224; //s/m

        LinActStepper() {}

        LinActStepper(uint8_t stepPin, uint8_t dirPin, uint8_t stallPin, uint8_t enablePin) {
            this->stepPin  = stepPin;
            this->dirPin = dirPin;
            this->stallPin = stallPin;
            this->enablePin = enablePin;
            _setupPinModes();
            _disable();
        }

        virtual void handleInterrupt(int8_t interruptNum) {
            _stopStepping();
        }

        void step(float stepLength /*in mm*/) {
            // speed = 12.25 mm/s
            // float invSpeed = 81.63265306122449; // s/m
            // float invSpeed = 39.93610224; // s/m
            _enable();
            delay(10);
            _startStepping();
            delay(stepLength*invSpeed);
            _stopStepping();
            _disable();
            delay(10);
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

        void _testSpeed() {
            _enable();
            delay(10);
            _startStepping();
            delay(2500);
            _stopStepping();
            _disable();
            delay(10);
        }

    private:
        void _setupPinModes() {
            pinMode(stepPin, OUTPUT);
            pinMode(dirPin, OUTPUT);
            // pinMode(stallPin, INPUT);
            // attachInterrupt(digitalPinToInterrupt(stallPin), LOW);
            pinMode(enablePin, OUTPUT);
        }

        void _startStepping() {
            // analogWrite(stepPin, 127);
            tone(stepPin, 1000);
        }

        void _stopStepping() {
            // analogWrite(stepPin, 0);
            noTone(stepPin);
        }

        void _enable() {
            digitalWrite(enablePin, HIGH);
        }

        void _disable() {
            digitalWrite(enablePin, LOW);
        }
};
