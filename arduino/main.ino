#include "LinearActuator.cpp"


const int NUM_ELEMENTS = 1;

const uint8_t DIR_PINS[NUM_ELEMENTS] = {8};
const uint8_t STEP_PINS[NUM_ELEMENTS] = {9};
const uint8_t STALL_PINS[NUM_ELEMENTS] = {2};

float configuration[NUM_ELEMENTS];
LinearActuator linActs[NUM_ELEMENTS];


void setup() {
    for (int i=0; i<NUM_ELEMENTS; i++) {
        linActs[i] = LinearActuator(STEP_PINS[i], DIR_PINS[i], STALL_PINS[i]);
        linActs[i].calibratePositionCursed();
    }

    Serial.begin(9600);
}

void loop() {
    for (int i=0; i<NUM_ELEMENTS; i++) {
        // awaits next float
        while (Serial.available() == 0) {}

        float incomingFloat = Serial.parseFloat(SKIP_ALL, '\n');
        configuration[i] = incomingFloat;
    }

    for (int i=0; i<NUM_ELEMENTS; i++) {
        linActs[i].setPosition(configuration[i]);
    }
}