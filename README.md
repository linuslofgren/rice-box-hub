# 🍚 RICE BOX
_Re-configurable Interactively Changing Education Box_

Finalist entry in [2023 IEEE AP-S Student Design Contest](https://2023.apsursi.org/sdc.php).

## Physical Design
[Design prosal](proposal/RIS_BOX_proposal.pdf)
<p align="middle">
<img src="https://user-images.githubusercontent.com/10536269/228491378-2cd12f8b-7679-4333-b89e-cce22ee04e4a.png" width="400">
<img src="https://user-images.githubusercontent.com/10536269/228491397-378220ef-6450-40f4-ae17-631b61dbda23.png" width="300">
</p>

## Software
The software stack has three parts;
- AR iOS app
- Positioning Engine written in Julia
- WebSocket server which connects the two (the hub)

### Positioning Engine
Entrypoint: `positioning/positioning.jl`

### WebSocket server, the hub
Start the web interface by running `npm run dev` from `hub/web`.

Run the WebSocket server (which connects to the app) from the `server` directory
with
```bash
deno run --allow-net --unstable --allow-write --allow-read --allow-run index.ts
```
Run the test suite with
```bash
deno test --allow-net --unstable --allow-write --allow-read --allow-run
```

### iOS app
🍎
