# Semester Project: Bank Management System Documentation

This document describes the structure, implemented functions, and sample inputs/outputs of the **Bank Management System** C++ project, designed for the Programming Fundamentals (PF) class.

---

## 1. Program Structure

The program is developed as a single, modular C++ file (`main.cpp`) which makes it very simple to compile and run. It operates in a procedural style utilizing fundamental programming concepts:

*   **Struct (`struct Account`)**: Groups related variables: a unique integer ID (`id`), a character array for the holder's name (`name`), and a double-precision floating-point value for the balance (`balance`).
*   **Pointers & Dynamic Heap Memory**: Rather than using a fixed-size array or advanced structures like `std::vector`, it maintains a dynamic array of `Account` structs via a heap pointer (`Account* accounts`). It implements a resizing algorithm that doubles the allocated memory when the database capacity is reached, and releases it on exit using `delete[]` to prevent memory leaks.
*   **Custom CSV Parsing**: Read operations parse records line-by-line from `accounts.txt` using manual character traversal, splitting fields by commas, and converting characters to integers/doubles manually.
*   **Data Consistency**: The program loads all accounts from `accounts.txt` into the heap array at startup, updates them in memory during execution, and saves the updated array back to `accounts.txt` after every transaction.

---

## 2. Functions Implemented

Here is a summary of all functions implemented in `main.cpp` and their purpose:

| Function Name | Return Type | Description / Purpose |
| :--- | :--- | :--- |
| `initAccounts` | `void` | Allocates the initial memory (capacity of 10) for the accounts database on the heap. |
| `freeMemory` | `void` | Deallocates the dynamically allocated array from the heap when the program exits. |
| `resizeAccounts` | `void` | Doubles the dynamic memory capacity when the current account count equals capacity, copying all data over to the new block. |
| `loadAccountsFromFile` | `void` | Reads and parses the `accounts.txt` CSV file, populating the database array at startup. |
| `saveAccountsToFile` | `void` | Writes all account details from the database array back to `accounts.txt` in CSV format. |
| `findAccountIndex` | `int` | Takes an account ID and performs a linear search, returning the array index if found, or `-1` if not found. |
| `toLowerCase` | `void` | Standardizes character arrays to lowercase to allow case-insensitive comparisons during searching. |
| `containsSubstring` | `bool` | Implements a substring matching algorithm to check if a search query is contained within an account name (supports partial matching). |
| `clearInputBuffer` | `void` | Discards invalid characters in the input buffer to prevent infinite loops when bad input is entered. |
| `readInteger` / `readDouble` | `int`/`double` | Prompts the user and reads numerical values, validation looping until valid numbers are entered. |
| `createAccount` | `void` | Handles new account creation: prompts for ID, Name, Deposit, checks for duplicates, and saves. |
| `deposit` | `void` | Deposits money into an account: locates the account, validates the amount, updates balance and file. |
| `withdraw` | `void` | Withdraws money: checks ID, verifies sufficient funds, deducts amount, updates balance and file. |
| `transfer` | `void` | Transfers money: verifies source and destination exist, checks source balance, modifies both, and saves. |
| `viewAccountDetails` | `void` | Displays details (ID, Name, Balance) of a single account given its ID. |
| `viewAllAccounts` | `void` | Prints all accounts in a neatly formatted table. |
| `searchByName` | `void` | Prompts for a search query and displays all accounts whose names contain the query (case-insensitive). |
| `searchByBalance` | `void` | Displays all accounts with a balance greater than or equal to a user-entered threshold. |
| `deleteAccount` | `void` | Deletes an account: shifts elements in the array to fill the gap, decrements count, and saves. |
| `main` | `int` | Instantiates resources, loads database, and drives the interactive CLI menu loop. |

---

## 3. Sample Inputs and Outputs

Below are examples of running different operations within the system:

### Sample 1: Viewing All Accounts
```text
Welcome to the Bank Management System!
--------------------------------------
1. Create New Account
2. Deposit Money
3. Withdraw Money
4. Transfer Money
5. View Account Details
6. View All Accounts
7. Search Account by Name
8. Search Accounts by Balance Greater Than
9. Delete Account
10. Exit
--------------------------------------
Enter your choice: 6

--- All Bank Accounts ---
-------------------------------------------------------------
Account ID     Account Holder                Balance        
-------------------------------------------------------------
1001           John Doe                      $5000.00
1002           Jane Smith                    $3000.00
1003           Ali Ahmed                     $2500.00
-------------------------------------------------------------
```

### Sample 2: Creating a New Account
```text
Enter your choice: 1

--- Create New Account ---
Enter Account ID (positive integer): 1004
Enter Account Holder's Name: Test User
Enter Initial Deposit: 1500
Success: Account created successfully and saved to file!
```

### Sample 3: Deposit and Withdrawal
```text
Enter your choice: 2

--- Deposit Money ---
Enter Account ID: 1002
Enter Amount to Deposit: 500
Success: Deposited $500.00. New Balance: $3500.00

Enter your choice: 3

--- Withdraw Money ---
Enter Account ID: 1002
Enter Amount to Withdraw: 200
Success: Withdrew $200.00. Remaining Balance: $3300.00
```

### Sample 4: Transferring Money
```text
Enter your choice: 4

--- Transfer Money ---
Enter Source Account ID: 1001
Enter Destination Account ID: 1003
Enter Amount to Transfer: 1000
Success: Transferred $1000.00 from Account 1001 to Account 1003.
```

### Sample 5: Searching by Name (Partial)
```text
Enter your choice: 7

--- Search Account by Name ---
Enter part or full name to search: Ali

Search Results:
-------------------------------------------------------------
Account ID     Account Holder                Balance        
-------------------------------------------------------------
1003           Ali Ahmed                     $3500.00
-------------------------------------------------------------
```

### Sample 6: Search by Balance Threshold
```text
Enter your choice: 8

--- Search Accounts by Balance Greater Than ---
Enter balance threshold: 2800

Accounts with balance >= $2800.00:
-------------------------------------------------------------
Account ID     Account Holder                Balance        
-------------------------------------------------------------
1001           John Doe                      $4000.00
1002           Jane Smith                    $3300.00
1003           Ali Ahmed                     $3500.00
-------------------------------------------------------------
```

### Sample 7: Deleting an Account
```text
Enter your choice: 9

--- Delete Account ---
Enter Account ID to delete: 1004
Success: Account ID 1004 has been deleted and removed from the file.
```
