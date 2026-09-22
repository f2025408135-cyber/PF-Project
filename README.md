# PF Project — Bank Management System

C++ CLI bank management system with a web-based dashboard. Built as a Programming Fundamentals semester project demonstrating modular C++ design, custom data structures, and full-stack integration.

## Overview

Two fully integrated banking applications sharing a real-time data layer:

1. **C++ CLI System** — modular console application using fundamental C++ concepts (structures, pointers, dynamic arrays, custom file parsing)
2. **Web Dashboard** — responsive SPA with Express backend and vanilla HTML/CSS/JS frontend

Both systems read and write to the same `accounts.txt` file in real-time, ensuring complete parity between CLI and web transactions.

## Quick Start

### C++ CLI (Windows MSVC)

```cmd
cd bank_management_system
cl /EHsc /O2 main.cpp /Fe:bank_system.exe
.\bank_system.exe
```

### Web Dashboard

```bash
cd bank_management_web
npm install
node server.js
# → http://localhost:3000
```

## Features

| Feature | Details |
|---|---|
| Account management | Create (validates unique ID, non-empty name, non-negative deposit), delete |
| Banking operations | Deposit, withdrawal (balance limit check), transfer between accounts |
| Real-time sync | Both programs read/write the same `accounts.txt` instantly |
| Search & filter | Case-insensitive name search, balance threshold filtering |
| Input handling | Custom buffers prevent infinite console loops on bad input |
| Web dashboard | Dark mode, glassmorphism, slide-in widgets, HSL color palette |

## Repository Structure

```
PF-Project/
├── bank_management_system/        # C++ CLI application
│   ├── main.cpp                   # Source code
│   ├── accounts.txt               # Shared CSV database
│   └── project_structure.md       # Function documentation
└── bank_management_web/           # Web dashboard
    ├── server.js                  # Express API server
    ├── package.json               # Node dependencies
    └── public/                    # SPA assets
        ├── index.html             # Dashboard structure
        ├── style.css              # Glassmorphism styles
        └── app.js                 # State manager
```

## C++ Implementation Notes

- **No advanced STL** — uses custom structures, pointers, and dynamic heap arrays
- **Custom file parsing** — reads/writes CSV without external libraries
- **Memory-safe** — proper allocation/deallocation with no leaks
- **Modular** — each banking operation is a separate function

## Tech Stack

- **CLI:** C++ (MSVC-compatible, C++17)
- **Web:** Node.js, Express, vanilla HTML/CSS/JS
- **Data:** Plain-text CSV (shared between both systems)

## License

MIT
