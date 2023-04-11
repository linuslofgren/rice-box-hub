# Positioning Engine

Module for configuring the RIS. Communicates with the hub via Unix Domain Socket.

Start the socket in the julia REPL by running
```bash
julia positioning.jl
```

## Operations

The system supports three operations (which are more or less WIP):
- `angle`: configures the RIS to reflect in given angle to the surface normal
- `couple`: configures the RIS to enable a direct channel between a tranceiver and a receiver
- `focus`: configures the RIS to focus the signal at a point in front of it