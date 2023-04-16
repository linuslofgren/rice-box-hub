const int numElements = 10;
float configuration[numElements];

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    for (int i=0; i<numElements; i++)
    {
        // awaits next float
        while (Serial.available() == 0) {}

        float incomingFloat = Serial.parseFloat(SKIP_ALL, '\n');
        configuration[i] = incomingFloat;
    }

    for (int i=0; i<numElements; i++)
    {
        Serial.print(configuration[i]);
        Serial.print(' ');
    }
    Serial.print('\n');
}