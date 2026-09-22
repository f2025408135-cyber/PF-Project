const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to shared accounts.txt file
const ACCOUNTS_FILE = path.join(__dirname, '../bank_management_system/accounts.txt');

// Ensure parent directories exist
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// Read and parse CSV file
function readAccounts() {
    ensureDirectoryExistence(ACCOUNTS_FILE);
    if (!fs.existsSync(ACCOUNTS_FILE)) {
        // If file doesn't exist, write headers and return empty list
        fs.writeFileSync(ACCOUNTS_FILE, 'AccountID,Name,Balance\n', 'utf8');
        return [];
    }
    
    try {
        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        const lines = data.split('\n');
        const accounts = [];
        
        // Loop skipping the CSV header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length >= 3) {
                const id = parseInt(parts[0]);
                const name = parts[1];
                const balance = parseFloat(parts[2]);
                
                if (!isNaN(id) && name && !isNaN(balance)) {
                    accounts.push({ id, name, balance });
                }
            }
        }
        return accounts;
    } catch (err) {
        console.error('Error reading accounts file:', err);
        return [];
    }
}

// Write accounts back to CSV file
function writeAccounts(accounts) {
    ensureDirectoryExistence(ACCOUNTS_FILE);
    try {
        let content = 'AccountID,Name,Balance\n';
        accounts.forEach(acc => {
            content += `${acc.id},${acc.name},${acc.balance.toFixed(2)}\n`;
        });
        fs.writeFileSync(ACCOUNTS_FILE, content, 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing accounts file:', err);
        return false;
    }
}

// API Endpoints:

// 1. Get all accounts
app.get('/api/accounts', (req, res) => {
    const accounts = readAccounts();
    res.json(accounts);
});

// 2. Create a new account
app.post('/api/accounts', (req, res) => {
    const { id, name, initialDeposit } = req.body;
    
    // Input validation
    const parsedId = parseInt(id);
    const parsedDeposit = parseFloat(initialDeposit);
    
    if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({ error: 'Account ID must be a positive integer.' });
    }
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Account holder name is required.' });
    }
    if (isNaN(parsedDeposit) || parsedDeposit < 0) {
        return res.status(400).json({ error: 'Initial deposit must be a non-negative number.' });
    }
    
    const accounts = readAccounts();
    
    // Check duplicate ID
    const duplicate = accounts.find(acc => acc.id === parsedId);
    if (duplicate) {
        return res.status(409).json({ error: 'An account with this ID already exists.' });
    }
    
    // Add account
    const newAccount = {
        id: parsedId,
        name: name.trim(),
        balance: parsedDeposit
    };
    accounts.push(newAccount);
    
    if (writeAccounts(accounts)) {
        res.status(201).json(newAccount);
    } else {
        res.status(500).json({ error: 'Failed to write data to accounts.txt.' });
    }
});

// 3. Deposit money into an account
app.post('/api/accounts/:id/deposit', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Deposit amount must be greater than zero.' });
    }
    
    const accounts = readAccounts();
    const index = accounts.findIndex(acc => acc.id === id);
    if (index === -1) {
        return res.status(404).json({ error: `Account with ID ${id} not found.` });
    }
    
    // Update balance
    accounts[index].balance += parsedAmount;
    
    if (writeAccounts(accounts)) {
        res.json(accounts[index]);
    } else {
        res.status(500).json({ error: 'Failed to update data file.' });
    }
});

// 4. Withdraw money from an account
app.post('/api/accounts/:id/withdraw', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Withdrawal amount must be greater than zero.' });
    }
    
    const accounts = readAccounts();
    const index = accounts.findIndex(acc => acc.id === id);
    if (index === -1) {
        return res.status(404).json({ error: `Account with ID ${id} not found.` });
    }
    
    if (parsedAmount > accounts[index].balance) {
        return res.status(400).json({ error: `Insufficient balance. Current balance is $${accounts[index].balance.toFixed(2)}.` });
    }
    
    // Update balance
    accounts[index].balance -= parsedAmount;
    
    if (writeAccounts(accounts)) {
        res.json(accounts[index]);
    } else {
        res.status(500).json({ error: 'Failed to update data file.' });
    }
});

// 5. Transfer money between two accounts
app.post('/api/accounts/transfer', (req, res) => {
    const { sourceId, destId, amount } = req.body;
    
    const parsedSourceId = parseInt(sourceId);
    const parsedDestId = parseInt(destId);
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedSourceId) || isNaN(parsedDestId)) {
        return res.status(400).json({ error: 'Valid Source and Destination IDs are required.' });
    }
    if (parsedSourceId === parsedDestId) {
        return res.status(400).json({ error: 'Source and Destination accounts must be different.' });
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Transfer amount must be greater than zero.' });
    }
    
    const accounts = readAccounts();
    const sourceIndex = accounts.findIndex(acc => acc.id === parsedSourceId);
    const destIndex = accounts.findIndex(acc => acc.id === parsedDestId);
    
    if (sourceIndex === -1) {
        return res.status(404).json({ error: `Source account with ID ${parsedSourceId} not found.` });
    }
    if (destIndex === -1) {
        return res.status(404).json({ error: `Destination account with ID ${parsedDestId} not found.` });
    }
    
    if (parsedAmount > accounts[sourceIndex].balance) {
        return res.status(400).json({ error: `Insufficient balance. Source account has $${accounts[sourceIndex].balance.toFixed(2)}.` });
    }
    
    // Perform transfer
    accounts[sourceIndex].balance -= parsedAmount;
    accounts[destIndex].balance += parsedAmount;
    
    if (writeAccounts(accounts)) {
        res.json({
            source: accounts[sourceIndex],
            destination: accounts[destIndex]
        });
    } else {
        res.status(500).json({ error: 'Failed to update data file.' });
    }
});

// 6. Delete an account
app.delete('/api/accounts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const accounts = readAccounts();
    const index = accounts.findIndex(acc => acc.id === id);
    if (index === -1) {
        return res.status(404).json({ error: `Account with ID ${id} not found.` });
    }
    
    // Remove account
    accounts.splice(index, 1);
    
    if (writeAccounts(accounts)) {
        res.json({ success: true, message: `Account ID ${id} deleted successfully.` });
    } else {
        res.status(500).json({ error: 'Failed to update data file.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
