#include "LinearActuator.cpp"

const float HALF_WAVELENGTH = 0.062456762083333; //m

const int NUM_ELEMENTS = 10;
const uint8_t DIR_PINS[NUM_ELEMENTS]   = {22, 24, 26, 28, 30, 32, 34, 36, 38, 40};
const uint8_t STEP_PINS[NUM_ELEMENTS]  = {13, 12, 11, 10, 9,  8,  7,  6,  5,  4};
const uint8_t STALL_PINS[NUM_ELEMENTS] = {2,  2,  2,  2,  2,  2,  2,  2,  2,  2};
const uint8_t ENABLE_PIN[NUM_ELEMENTS] = {23, 25, 27, 29, 31, 33, 35, 37, 39, 41};

float configuration[NUM_ELEMENTS];
LinearActuator linActs[NUM_ELEMENTS];

void setup() {
    Serial.begin(9600);
    for (int i=0; i<NUM_ELEMENTS; i++) {
        linActs[i] = LinearActuator(STEP_PINS[i], DIR_PINS[i], STALL_PINS[i], ENABLE_PIN[i]);
    }
    Serial.print("Calibrating. This may take ");
    Serial.print(LinActStepper::invSpeed*0.082*10);
    Serial.println(" seconds.");

    for (int i=0; i<NUM_ELEMENTS; i++) {
        linActs[i].calibratePositionCursed();
    }
    Serial.print("Calibrated!");
}

void loop() {
    while (Serial.read() != '<') {} // eat bytes until '<' is encountered

    for (int i=0; i<NUM_ELEMENTS; i++) {
        float incomingFloat = Serial.parseFloat(SKIP_ALL, '\n');
        configuration[i] = incomingFloat;
    }
    Serial.readStringUntil('|');
    String jobID = Serial.readStringUntil('>');

    for (int j=0; j<NUM_ELEMENTS; j++) {
        // float x = j*dx;
        // configuration[j] = x - HALF_WAVELENGTH*round(x/HALF_WAVELENGTH);
        linActs[j].setPosition(configuration[j]);
    }

    Serial.print('<');
    for (int i=0; i<NUM_ELEMENTS; i++)
    {
        Serial.print(configuration[i], 4); // 4 decimal precision for printing back positions is enough  
        if(i != NUM_ELEMENTS-1) Serial.print(',');
    }
    Serial.print('|' + jobID + '>');
}