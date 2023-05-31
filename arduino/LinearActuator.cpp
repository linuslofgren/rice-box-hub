#include "LinActStepper.cpp"

class LinearActuator : private LinActStepper {
    public:
        float position = 0;

        LinearActuator() {}

        LinearActuator(uint8_t stepPin, uint8_t dirPin, uint8_t stallPin) : LinActStepper(stepPin, dirPin, stallPin) {}

        /*
        Sets position in mm from front end. Positive direction is defined as "backwards" i.e. towards the motor.
        Must be calibrated before use.
        */
        void setPosition(float newPosition) {
            if (newPosition > position) {
                setDirBackward();
                step(newPosition-position);
            } else {
                setDirForward();
                step(position-newPosition);
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

};