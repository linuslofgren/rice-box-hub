#include "LinearActuator.cpp"

const float HALF_WAVELENGTH = 0.062456762083333;

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
    for (int i=0; i<1; i++) {
        // awaits next float
        while (Serial.available() == 0) {}

        float dx = Serial.parseFloat(SKIP_ALL, '\n');
        
        for (int j=0; j<NUM_ELEMENTS; j++) {
            float x = j*dx;
            configuration[j] = x - HALF_WAVELENGTH*round(x/HALF_WAVELENGTH);
            linActs[j].setPosition(configuration[j]);
        }
    }

}