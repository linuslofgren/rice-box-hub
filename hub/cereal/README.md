# Rust Serial Interface

This program listens to a Redis server for commands to forward through Serial to a microcontroller connected via USB.

Start:
```
cargo run
```

For hot reload in development: 
```
cargo watch -x 'run'
```

You will be propted to choose USB port. If port is already known to be eg. COM8, run:
```
cargo watch -x 'run -- COM8'
```

In the absence of a microcontroller, one can be simulated with:
```
cargo watch -x 'run -- mock'
```