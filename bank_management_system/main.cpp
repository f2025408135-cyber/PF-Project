// Bank Management System
// Semester Project for Programming Fundamentals (PF)
// Adheres strictly to fundamental C++ concepts (Structs, Pointers, Arrays, Dynamic Memory, I/O streams, File Handling)

#include <iostream>
#include <fstream>
#include <iomanip>
#include <cstring>

using namespace std;

// 1. Struct Definition to hold Account Details
struct Account {
    int id;
    char name[100];
    double balance;
};

// 2. Global variables for dynamic memory management
Account* accounts = nullptr; // Pointer to dynamically allocated array of Accounts
int accountCount = 0;       // Current number of accounts loaded in memory
int accountCapacity = 10;   // Initial capacity of the dynamic array

// Helper: Clear standard input stream on errors to prevent infinite loops
void clearInputBuffer() {
    cin.clear();
    cin.ignore(10000, '\n');
}

// Helper: Safely read an integer with validation
int readInteger(const char* prompt) {
    int val;
    while (true) {
        cout << prompt;
        if (cin >> val) {
            return val;
        } else {
            cout << "Error: Invalid input. Please enter a valid integer.\n";
            clearInputBuffer();
        }
    }
}

// Helper: Safely read a double with validation
double readDouble(const char* prompt) {
    double val;
    while (true) {
        cout << prompt;
        if (cin >> val) {
            return val;
        } else {
            cout << "Error: Invalid input. Please enter a valid number.\n";
            clearInputBuffer();
        }
    }
}

// 3. Dynamic Array Management: Double capacity when array is full
void resizeAccounts() {
    accountCapacity *= 2;
    Account* newAccounts = new Account[accountCapacity];
    
    // Copy existing accounts to new allocated memory
    for (int i = 0; i < accountCount; ++i) {
        newAccounts[i] = accounts[i];
    }
    
    // Deallocate old heap memory
    delete[] accounts;
    
    // Re-point accounts to new heap memory
    accounts = newAccounts;
    cout << "[System Log] DB resized. New capacity: " << accountCapacity << " accounts.\n";
}

// Initialize dynamic array on heap
void initAccounts() {
    accounts = new Account[accountCapacity];
    accountCount = 0;
}

// Clean up heap memory at exit to prevent memory leaks
void freeMemory() {
    if (accounts != nullptr) {
        delete[] accounts;
        accounts = nullptr;
    }
}

// 4. File Handling: Load accounts from accounts.txt
void loadAccountsFromFile() {
    ifstream inFile("accounts.txt");
    if (!inFile) {
        // File does not exist, which is normal for first-time runs
        cout << "[System Log] accounts.txt not found. Starting with empty database.\n";
        return;
    }
    
    char line[256];
    // Read and ignore the CSV header line: "AccountID,Name,Balance"
    if (!inFile.getline(line, sizeof(line))) {
        inFile.close();
        return;
    }
    
    // Read line-by-line and manually parse values (CSV parser)
    while (inFile.getline(line, sizeof(line))) {
        if (line[0] == '\0') {
            continue; // Skip empty lines
        }
        
        int i = 0;
        
        // A. Parse Account ID
        int id = 0;
        while (line[i] != ',' && line[i] != '\0') {
            if (line[i] >= '0' && line[i] <= '9') {
                id = id * 10 + (line[i] - '0');
            }
            i++;
        }
        
        if (line[i] == ',') i++; // Skip comma
        
        // B. Parse Account Holder Name
        char name[100];
        int j = 0;
        while (line[i] != ',' && line[i] != '\0' && j < 99) {
            name[j] = line[i];
            i++;
            j++;
        }
        name[j] = '\0';
        
        if (line[i] == ',') i++; // Skip comma
        
        // C. Parse Balance
        double balance = 0.0;
        double divisor = 10.0;
        bool decimal = false;
        while (line[i] != '\0') {
            if (line[i] == '.') {
                decimal = true;
            } else if (line[i] >= '0' && line[i] <= '9') {
                if (!decimal) {
                    balance = balance * 10.0 + (line[i] - '0');
                } else {
                    balance = balance + (line[i] - '0') / divisor;
                    divisor *= 10.0;
                }
            }
            i++;
        }
        
        // If array is full, double the size
        if (accountCount >= accountCapacity) {
            resizeAccounts();
        }
        
        // Store parsed account in the database
        accounts[accountCount].id = id;
        strcpy(accounts[accountCount].name, name);
        accounts[accountCount].balance = balance;
        accountCount++;
    }
    
    inFile.close();
    cout << "[System Log] Successfully loaded " << accountCount << " accounts from accounts.txt.\n";
}

// File Handling: Write updated memory database back to accounts.txt
void saveAccountsToFile() {
    ofstream outFile("accounts.txt");
    if (!outFile) {
        cout << "Error: Could not open accounts.txt for writing.\n";
        return;
    }
    
    // Write CSV Header
    outFile << "AccountID,Name,Balance\n";
    
    // Write all data
    for (int i = 0; i < accountCount; ++i) {
        outFile << accounts[i].id << "," << accounts[i].name << "," 
                << fixed << setprecision(2) << accounts[i].balance << "\n";
    }
    
    outFile.close();
}

// 5. Account Operations & Verification Helpers
int findAccountIndex(int id) {
    for (int i = 0; i < accountCount; ++i) {
        if (accounts[i].id == id) {
            return i; // Found account, return its index in the array
        }
    }
    return -1; // Account ID does not exist
}

// Case-insensitive custom string comparison helper for searchByName
void toLowerCase(char* dest, const char* src) {
    int i = 0;
    while (src[i] != '\0') {
        if (src[i] >= 'A' && src[i] <= 'Z') {
            dest[i] = src[i] + 32; // ASCII conversion
        } else {
            dest[i] = src[i];
        }
        i++;
    }
    dest[i] = '\0';
}

// Custom substring matcher for partial search queries
bool containsSubstring(const char* str, const char* sub) {
    char lowerStr[128];
    char lowerSub[128];
    toLowerCase(lowerStr, str);
    toLowerCase(lowerSub, sub);
    
    int i = 0;
    while (lowerStr[i] != '\0') {
        int j = 0;
        while (lowerSub[j] != '\0' && lowerStr[i + j] == lowerSub[j]) {
            j++;
        }
        if (lowerSub[j] == '\0') {
            return true; // Match found
        }
        i++;
    }
    return false;
}

// OPERATION 1: Create New Account
void createAccount() {
    cout << "\n--- Create New Account ---\n";
    int id = readInteger("Enter Account ID (positive integer): ");
    
    if (id <= 0) {
        cout << "Error: Account ID must be positive.\n";
        return;
    }
    
    // Duplicate ID validation
    if (findAccountIndex(id) != -1) {
        cout << "Error: An account with this ID already exists.\n";
        return;
    }
    
    cin.ignore(); // Flush the newline character before reading name string
    char name[100];
    cout << "Enter Account Holder's Name: ";
    cin.getline(name, sizeof(name));
    
    // Check if name is empty
    if (strlen(name) == 0) {
        cout << "Error: Name cannot be empty.\n";
        return;
    }
    
    double initialDeposit = readDouble("Enter Initial Deposit: ");
    if (initialDeposit < 0) {
        cout << "Error: Initial deposit must be non-negative.\n";
        return;
    }
    
    // If the array runs out of capacity, resize it dynamically
    if (accountCount >= accountCapacity) {
        resizeAccounts();
    }
    
    // Save to our array
    accounts[accountCount].id = id;
    strcpy(accounts[accountCount].name, name);
    accounts[accountCount].balance = initialDeposit;
    accountCount++;
    
    // Persist changes to file
    saveAccountsToFile();
    
    cout << "Success: Account created successfully and saved to file!\n";
}

// OPERATION 2: Deposit Money
void deposit() {
    cout << "\n--- Deposit Money ---\n";
    int id = readInteger("Enter Account ID: ");
    
    int index = findAccountIndex(id);
    if (index == -1) {
        cout << "Error: Account ID " << id << " not found.\n";
        return;
    }
    
    double amount = readDouble("Enter Amount to Deposit: ");
    if (amount <= 0) {
        cout << "Error: Deposit amount must be greater than zero.\n";
        return;
    }
    
    // Update balance
    accounts[index].balance += amount;
    
    // Save changes to file
    saveAccountsToFile();
    
    cout << "Success: Deposited $" << fixed << setprecision(2) << amount 
         << ". New Balance: $" << accounts[index].balance << "\n";
}

// OPERATION 3: Withdraw Money
void withdraw() {
    cout << "\n--- Withdraw Money ---\n";
    int id = readInteger("Enter Account ID: ");
    
    int index = findAccountIndex(id);
    if (index == -1) {
        cout << "Error: Account ID " << id << " not found.\n";
        return;
    }
    
    double amount = readDouble("Enter Amount to Withdraw: ");
    if (amount <= 0) {
        cout << "Error: Withdrawal amount must be greater than zero.\n";
        return;
    }
    
    if (amount > accounts[index].balance) {
        cout << "Error: Insufficient balance. Current Balance is $" 
             << fixed << setprecision(2) << accounts[index].balance << ".\n";
        return;
    }
    
    // Update balance
    accounts[index].balance -= amount;
    
    // Save changes to file
    saveAccountsToFile();
    
    cout << "Success: Withdrew $" << fixed << setprecision(2) << amount 
         << ". Remaining Balance: $" << accounts[index].balance << "\n";
}

// OPERATION 4: Transfer Money
void transfer() {
    cout << "\n--- Transfer Money ---\n";
    int sourceId = readInteger("Enter Source Account ID: ");
    int sourceIndex = findAccountIndex(sourceId);
    if (sourceIndex == -1) {
        cout << "Error: Source account ID " << sourceId << " not found.\n";
        return;
    }
    
    int destId = readInteger("Enter Destination Account ID: ");
    if (sourceId == destId) {
        cout << "Error: Source and destination accounts cannot be the same.\n";
        return;
    }
    
    int destIndex = findAccountIndex(destId);
    if (destIndex == -1) {
        cout << "Error: Destination account ID " << destId << " not found.\n";
        return;
    }
    
    double amount = readDouble("Enter Amount to Transfer: ");
    if (amount <= 0) {
        cout << "Error: Transfer amount must be greater than zero.\n";
        return;
    }
    
    if (amount > accounts[sourceIndex].balance) {
        cout << "Error: Insufficient balance in source account. Current Balance is $" 
             << fixed << setprecision(2) << accounts[sourceIndex].balance << ".\n";
        return;
    }
    
    // Deduct and credit
    accounts[sourceIndex].balance -= amount;
    accounts[destIndex].balance += amount;
    
    // Save changes to file
    saveAccountsToFile();
    
    cout << "Success: Transferred $" << fixed << setprecision(2) << amount 
         << " from Account " << sourceId << " to Account " << destId << ".\n";
}

// OPERATION 5: View Account Details
void viewAccountDetails() {
    cout << "\n--- View Account Details ---\n";
    int id = readInteger("Enter Account ID: ");
    
    int index = findAccountIndex(id);
    if (index == -1) {
        cout << "Error: Account ID " << id << " not found.\n";
        return;
    }
    
    cout << "-------------------------------\n";
    cout << "Account ID    : " << accounts[index].id << "\n";
    cout << "Account Holder: " << accounts[index].name << "\n";
    cout << "Balance       : $" << fixed << setprecision(2) << accounts[index].balance << "\n";
    cout << "-------------------------------\n";
}

// OPERATION 6: View All Accounts
void viewAllAccounts() {
    cout << "\n--- All Bank Accounts ---\n";
    if (accountCount == 0) {
        cout << "No accounts available to display.\n";
        return;
    }
    
    cout << "-------------------------------------------------------------\n";
    cout << left << setw(15) << "Account ID" << setw(30) << "Account Holder" << setw(15) << "Balance" << "\n";
    cout << "-------------------------------------------------------------\n";
    for (int i = 0; i < accountCount; ++i) {
        cout << left << setw(15) << accounts[i].id 
             << setw(30) << accounts[i].name 
             << "$" << fixed << setprecision(2) << accounts[i].balance << "\n";
    }
    cout << "-------------------------------------------------------------\n";
}

// OPERATION 7: Search Account by Name
void searchByName() {
    cout << "\n--- Search Account by Name ---\n";
    cin.ignore(); // Clean standard input
    char query[100];
    cout << "Enter part or full name to search: ";
    cin.getline(query, sizeof(query));
    
    bool foundAny = false;
    cout << "\nSearch Results:\n";
    cout << "-------------------------------------------------------------\n";
    cout << left << setw(15) << "Account ID" << setw(30) << "Account Holder" << setw(15) << "Balance" << "\n";
    cout << "-------------------------------------------------------------\n";
    
    for (int i = 0; i < accountCount; ++i) {
        if (containsSubstring(accounts[i].name, query)) {
            cout << left << setw(15) << accounts[i].id 
                 << setw(30) << accounts[i].name 
                 << "$" << fixed << setprecision(2) << accounts[i].balance << "\n";
            foundAny = true;
        }
    }
    cout << "-------------------------------------------------------------\n";
    
    if (!foundAny) {
        cout << "No matching accounts found for query: \"" << query << "\"\n";
    }
}

// OPERATION 8: Search Accounts by Balance Greater Than
void searchByBalance() {
    cout << "\n--- Search Accounts by Balance Greater Than ---\n";
    double threshold = readDouble("Enter balance threshold: ");
    
    bool foundAny = false;
    cout << "\nAccounts with balance >= $" << fixed << setprecision(2) << threshold << ":\n";
    cout << "-------------------------------------------------------------\n";
    cout << left << setw(15) << "Account ID" << setw(30) << "Account Holder" << setw(15) << "Balance" << "\n";
    cout << "-------------------------------------------------------------\n";
    
    for (int i = 0; i < accountCount; ++i) {
        if (accounts[i].balance >= threshold) {
            cout << left << setw(15) << accounts[i].id 
                 << setw(30) << accounts[i].name 
                 << "$" << fixed << setprecision(2) << accounts[i].balance << "\n";
            foundAny = true;
        }
    }
    cout << "-------------------------------------------------------------\n";
    
    if (!foundAny) {
        cout << "No accounts found with balance greater than or equal to $" 
             << fixed << setprecision(2) << threshold << ".\n";
    }
}

// OPERATION 9: Delete Account
void deleteAccount() {
    cout << "\n--- Delete Account ---\n";
    int id = readInteger("Enter Account ID to delete: ");
    
    int index = findAccountIndex(id);
    if (index == -1) {
        cout << "Error: Account ID " << id << " not found.\n";
        return;
    }
    
    // Shift elements left to overwrite deleted element
    for (int i = index; i < accountCount - 1; ++i) {
        accounts[i] = accounts[i + 1];
    }
    accountCount--;
    
    // Save updated list to file
    saveAccountsToFile();
    
    cout << "Success: Account ID " << id << " has been deleted and removed from the file.\n";
}

// 6. Entry point with main menu loop
int main() {
    // Initialize heap memory database
    initAccounts();
    
    // Load existing records from file at startup
    loadAccountsFromFile();
    
    int choice = 0;
    
    do {
        cout << "\nWelcome to the Bank Management System!\n";
        cout << "--------------------------------------\n";
        cout << "1. Create New Account\n";
        cout << "2. Deposit Money\n";
        cout << "3. Withdraw Money\n";
        cout << "4. Transfer Money\n";
        cout << "5. View Account Details\n";
        cout << "6. View All Accounts\n";
        cout << "7. Search Account by Name\n";
        cout << "8. Search Accounts by Balance Greater Than\n";
        cout << "9. Delete Account\n";
        cout << "10. Exit\n";
        cout << "--------------------------------------\n";
        
        choice = readInteger("Enter your choice: ");
        
        switch (choice) {
            case 1:
                createAccount();
                break;
            case 2:
                deposit();
                break;
            case 3:
                withdraw();
                break;
            case 4:
                transfer();
                break;
            case 5:
                viewAccountDetails();
                break;
            case 6:
                viewAllAccounts();
                break;
            case 7:
                searchByName();
                break;
            case 8:
                searchByBalance();
                break;
            case 9:
                deleteAccount();
                break;
            case 10:
                cout << "\nExiting the Bank Management System. Goodbye!\n";
                break;
            default:
                cout << "Error: Invalid option. Please enter a choice between 1 and 10.\n";
                break;
        }
    } while (choice != 10);
    
    // Free dynamic array heap memory before exiting
    freeMemory();
    
    return 0;
}
