#include "LinearActuator.cpp"

const float HALF_WAVELENGTH = 0.062456762083333;

const int NUM_ELEMENTS = 10;
const uint8_t DIR_PINS[NUM_ELEMENTS] = {22,24,26,28,30,32,34,36,38,40};
const uint8_t STEP_PINS[NUM_ELEMENTS] = {13,12,11,10,9,8,7,6,5,4};
const uint8_t STALL_PINS[NUM_ELEMENTS] = {2,2,2,2,2,2,2,2,2,2};

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

        float dx = Serial.parseFloat(SKIP_ALL, '\n');

        configuration[i] = dx;
        
        
    }

    for (int j=0; j<NUM_ELEMENTS; j++) {
        // float x = j*dx;
        // configuration[j] = x - HALF_WAVELENGTH*round(x/HALF_WAVELENGTH);
        linActs[j].setPosition(configuration[j]);
    }

    for (int i=0; i<NUM_ELEMENTS; i++)
    {
        Serial.print(configuration[i]);
        Serial.print(' ');
    }
    Serial.print('\n');

}