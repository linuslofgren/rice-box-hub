# Arduino Code for RICE control

Arduino may be tricky to work nicely in VSCode. This is how we did.
1. Install VSCode Extensions: 'Arduino' and 'C/C++ Extension Pack'.
1. Key was having the main `.ino` file named same as parent folder. This also means `sketch` field in `./.vscode/arduino.json` should be `arduino.ino` for this project.
1. Then run `Arduino: Verify`. This generates `./.vscode/c_cpp_properties.json`. It can manually be recreated by running `Arduino: Rebuild Intellisense Configuration`. Generating this file did not work when the Arduino sketch contained errors (which paradoxically was the case before having a good `c_cpp_properties.json`). In that case, comment out all code in `arduino.ino` and replace with the following error-free code before verifying again:
```
void setup() {}
void loop() {}
```
