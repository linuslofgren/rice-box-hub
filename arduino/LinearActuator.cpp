#include "LinActStepper.cpp"

class LinearActuator : private LinActStepper {
    public:
        float position = 0;

        LinearActuator() {}

        LinearActuator(uint8_t stepPin, uint8_t dirPin, uint8_t stallPin, uint8_t enablePin) : LinActStepper(stepPin, dirPin, stallPin, enablePin) {}

        /*
        Sets position in m from front end. Negative direction is defined as "backwards" i.e. towards the motor.
        Must be calibrated before use.
        */
        void setPosition(float newPosition) {
            newPosition = newPosition*1000;
            if (newPosition < position) {
                setDirBackward();
                step(position-newPosition);
            } else {
                setDirForward();
                step(newPosition-position);
            }
            position = newPosition;
        }

        /*
        NOT RECOMMENDED. Placeholder for actual calibration method incorporating stall detection.
        This one just yeets the actuator into the wall and let's it stall until it's certainly at the end.
        */
        void calibratePositionCursed() {
            setDirBackward();
            step(82.0);
            position = 0.0;
        }

        void testSpeed() {
            setDirForward();
            _testSpeed();
        }
};