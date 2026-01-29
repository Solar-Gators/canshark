# CANshark

## Installation

- Install git
- Install [Node.js v25](https://nodejs.org/en/download/current) with pnpm

```sh
git clone https://github.com/solar-gators/canshark.git
cd canshark
pnpm run dev
```

- Plug in debugger
- On Windows, download Zadig and use it to install WinUSB for the "CAN Debugger" device

Then go to [http://localhost:3000/](http://localhost:3000/)

## Requirements

- Platform support for WebUSB
- [Browser support for WebUSB](https://caniuse.com/webusb)
    - Chrome 61+
    - Edge 79+
    - Opera 48+

## License

MIT
