# Bank Management System - Semester Project

Welcome to the **Bank Management System** semester project, developed for the Programming Fundamentals (PF) class. 

This repository contains two fully integrated versions of the system:
1.  **C++ CLI System**: A classic, modular console application built strictly with fundamental C++ concepts.
2.  **Web UI System**: A premium, locally hosted Single Page Application (SPA) dashboard built with an Express API backend and a responsive, beautiful vanilla HTML/CSS/JS frontend.

Both systems read and write to the **exact same database file (`accounts.txt`) in real-time**, ensuring complete parity between CLI and Web transactions.

---

## Repository Structure

```text
PF Project/
│
├── README.md                           # Main documentation guide
├── .gitignore                          # Standard git ignore file
│
├── bank_management_system/             # C++ Console Application folder
│   ├── main.cpp                        # C++ source code file
│   ├── accounts.txt                    # The shared CSV database file
│   └── project_structure.md            # CLI function list & documentation
│
└── bank_management_web/                # Web Dashboard Application folder
    ├── server.js                       # Express API server interfacing with accounts.txt
    ├── package.json                    # Node dependencies & run scripts
    └── public/                         # SPA Web Interface assets
        ├── index.html                  # Structure of the dashboard
        ├── style.css                   # Custom CSS (Glassmorphism layout)
        └── app.js                      # Core JS state manager
```

---

## 1. C++ CLI Application

The CLI version adheres strictly to the Programming Fundamentals syllabus (using custom structures, pointers, dynamic heap array resizing, and custom file parsing without advanced standard library wrappers).

### Compilation (Windows MSVC)
Open your terminal in `bank_management_system/` and run:
```cmd
cl /EHsc /O2 main.cpp /Fe:bank_system.exe
```

### Execution
Run the compiled binary:
```cmd
.\bank_system.exe
```

---

## 2. Web UI Application

The Web dashboard is a modern, responsive Single Page Application featuring dark mode, glassmorphism, slide-in widgets, and custom HSL color palettes.

### Execution
1.  Open your terminal in `bank_management_web/`.
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the Express server:
    ```bash
    node server.js
    ```
4.  Open your browser and navigate to:
    **`http://localhost:3000`**

---

## Features Implemented

*   **Account Management**: Create new account (validates unique ID, non-empty name, non-negative initial deposit) and delete account (removes from memory and shifts elements to maintain alignment).
*   **Banking Operations**: Perform deposits, withdrawals (checks for non-negative balance limit), and transfers between different accounts.
*   **Real-time File Synchronization**: Both programs load from `accounts.txt` at startup and overwrite the file immediately after any transaction.
*   **Filters & Search**: Fast search by full/partial account name (case-insensitive) and balance threshold filtering (greater than or equal to).
*   **Robust Input Handling**: Custom buffers clean numeric inputs to prevent infinite console loop crashes.
