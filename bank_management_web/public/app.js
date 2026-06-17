// Nexus Bank - Frontend Core Controller
// Single Page Application (SPA) state & UI logic

const API_BASE = '/api';

// 1. Application State
let state = {
    accounts: [],
    filters: {
        name: '',
        minBalance: 0
    },
    activeTab: 'dashboard',
    activeOp: 'deposit'
};

// 2. DOM Elements
const elements = {
    dateText: document.getElementById('current-date'),
    btnRefresh: document.getElementById('btn-refresh'),
    totalBalance: document.getElementById('metric-total-balance'),
    totalAccounts: document.getElementById('metric-total-accounts'),
    avgBalance: document.getElementById('metric-avg-balance'),
    recordCount: document.getElementById('record-count'),
    tableBody: document.getElementById('table-body'),
    
    // Navigation & Tabs
    navItems: document.querySelectorAll('.nav-item'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // Forms
    formCreate: document.getElementById('form-create'),
    formDeposit: document.getElementById('form-deposit'),
    formWithdraw: document.getElementById('form-withdraw'),
    formTransfer: document.getElementById('form-transfer'),
    
    // Panels
    panelCreate: document.getElementById('panel-create'),
    panelTransactions: document.getElementById('panel-transactions'),
    panelSearch: document.getElementById('panel-search'),
    
    // Filters
    searchName: document.getElementById('search-name'),
    searchBalance: document.getElementById('search-balance'),
    balanceSliderVal: document.getElementById('balance-slider-val'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    
    // Toast Container
    toastBox: document.getElementById('toast-box')
};

// 3. UI Helpers
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' 
        ? `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    elements.toastBox.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.dateText.innerText = new Date().toLocaleDateString('en-US', options);
}

// 4. API Service Calls
async function fetchAccounts() {
    try {
        const res = await fetch(`${API_BASE}/accounts`);
        if (!res.ok) throw new Error('Failed to load accounts from database.');
        state.accounts = await res.json();
        renderDashboard();
    } catch (err) {
        showToast(err.message, 'error');
        elements.tableBody.innerHTML = `<tr><td colspan="4" class="table-loader" style="color: var(--danger)">Error: ${err.message}</td></tr>`;
    }
}

async function createAccount(id, name, initialDeposit) {
    try {
        const res = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, initialDeposit })
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to create account.');
        }
        
        showToast(`Account ID ${data.id} created successfully!`, 'success');
        elements.formCreate.reset();
        await fetchAccounts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleDeposit(id, amount) {
    try {
        const res = await fetch(`${API_BASE}/accounts/${id}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to deposit.');
        }
        
        showToast(`Deposited $${parseFloat(amount).toFixed(2)} to Account ID ${data.id}!`, 'success');
        elements.formDeposit.reset();
        await fetchAccounts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleWithdraw(id, amount) {
    try {
        const res = await fetch(`${API_BASE}/accounts/${id}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to withdraw.');
        }
        
        showToast(`Withdrew $${parseFloat(amount).toFixed(2)} from Account ID ${data.id}!`, 'success');
        elements.formWithdraw.reset();
        await fetchAccounts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleTransfer(sourceId, destId, amount) {
    try {
        const res = await fetch(`${API_BASE}/accounts/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceId, destId, amount })
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to execute transfer.');
        }
        
        showToast(`Transferred $${parseFloat(amount).toFixed(2)} from ID ${data.source.id} to ID ${data.destination.id}!`, 'success');
        elements.formTransfer.reset();
        await fetchAccounts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteAccount(id) {
    if (!confirm(`Are you sure you want to permanently delete Account ID ${id}?`)) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/accounts/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to delete account.');
        }
        
        showToast(data.message, 'success');
        await fetchAccounts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// 5. Data Rendering & Computation
function renderDashboard() {
    // A. Filter Accounts
    const query = state.filters.name.toLowerCase();
    const minBal = state.filters.minBalance;
    
    const filtered = state.accounts.filter(acc => {
        const nameMatch = acc.name.toLowerCase().includes(query);
        const balMatch = acc.balance >= minBal;
        return nameMatch && balMatch;
    });
    
    // B. Calculate Metrics (from full account list)
    const count = state.accounts.length;
    const totalBalVal = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const avgBalVal = count > 0 ? (totalBalVal / count) : 0;
    
    // C. Update Metrics UI
    elements.totalAccounts.innerText = count;
    elements.totalBalance.innerText = `$${totalBalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.avgBalance.innerText = `$${avgBalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.recordCount.innerText = `${filtered.length} of ${count} Records`;
    
    // D. Render Table Body
    if (filtered.length === 0) {
        elements.tableBody.innerHTML = `<tr><td colspan="4" class="table-loader">No accounts found matching filters.</td></tr>`;
        return;
    }
    
    elements.tableBody.innerHTML = filtered.map(acc => `
        <tr class="account-row">
            <td><span class="acc-id-badge">${acc.id}</span></td>
            <td><span class="acc-name">${escapeHTML(acc.name)}</span></td>
            <td><span class="acc-balance">$${acc.balance.toFixed(2)}</span></td>
            <td class="text-right">
                <button class="btn-delete-row" onclick="deleteAccount(${acc.id})" title="Delete Account">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// 6. Navigation Control: Tab switcher
function switchTab(tabName) {
    state.activeTab = tabName;
    
    // Update active nav links
    elements.navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show/Hide Panels based on tab selection
    if (tabName === 'dashboard') {
        elements.panelCreate.classList.remove('hide');
        elements.panelTransactions.classList.remove('hide');
        elements.panelSearch.classList.remove('hide');
    } else if (tabName === 'create') {
        elements.panelCreate.classList.remove('hide');
        elements.panelTransactions.classList.add('hide');
        elements.panelSearch.classList.add('hide');
    } else if (tabName === 'transactions') {
        elements.panelCreate.classList.add('hide');
        elements.panelTransactions.classList.remove('hide');
        elements.panelSearch.classList.add('hide');
    } else if (tabName === 'search-panel') {
        elements.panelCreate.classList.add('hide');
        elements.panelTransactions.classList.add('hide');
        elements.panelSearch.classList.remove('hide');
    }
}

// Switch operational forms inside "Banking Ops"
function switchOperation(opName) {
    state.activeOp = opName;
    
    elements.tabBtns.forEach(btn => {
        if (btn.getAttribute('data-op') === opName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    elements.formDeposit.classList.add('hide');
    elements.formWithdraw.classList.add('hide');
    elements.formTransfer.classList.add('hide');
    
    if (opName === 'deposit') elements.formDeposit.classList.remove('hide');
    if (opName === 'withdraw') elements.formWithdraw.classList.remove('hide');
    if (opName === 'transfer') elements.formTransfer.classList.remove('hide');
}

// 7. Event Listeners
function registerEvents() {
    // Refresh button
    elements.btnRefresh.addEventListener('click', () => {
        showToast('Refreshing records from accounts.txt...', 'success');
        fetchAccounts();
    });
    
    // Nav sidebar links
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.getAttribute('data-tab'));
        });
    });
    
    // Sub-operation tabs (Deposit, Withdraw, Transfer)
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchOperation(btn.getAttribute('data-op'));
        });
    });
    
    // Create Account form submission
    elements.formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('create-id').value;
        const name = document.getElementById('create-name').value;
        const deposit = document.getElementById('create-deposit').value;
        createAccount(id, name, deposit);
    });
    
    // Deposit form submission
    elements.formDeposit.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('deposit-id').value;
        const amount = document.getElementById('deposit-amount').value;
        handleDeposit(id, amount);
    });
    
    // Withdraw form submission
    elements.formWithdraw.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('withdraw-id').value;
        const amount = document.getElementById('withdraw-amount').value;
        handleWithdraw(id, amount);
    });
    
    // Transfer form submission
    elements.formTransfer.addEventListener('submit', (e) => {
        e.preventDefault();
        const src = document.getElementById('transfer-src').value;
        const dest = document.getElementById('transfer-dest').value;
        const amount = document.getElementById('transfer-amount').value;
        handleTransfer(src, dest, amount);
    });
    
    // Name filtering input
    elements.searchName.addEventListener('input', (e) => {
        state.filters.name = e.target.value;
        renderDashboard();
    });
    
    // Balance range slider filtering
    elements.searchBalance.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.filters.minBalance = val;
        elements.balanceSliderVal.innerText = `$${val.toLocaleString()}`;
        renderDashboard();
    });
    
    // Reset filters
    elements.btnClearFilters.addEventListener('click', () => {
        elements.searchName.value = '';
        elements.searchBalance.value = 0;
        elements.balanceSliderVal.innerText = '$0';
        state.filters.name = '';
        state.filters.minBalance = 0;
        renderDashboard();
    });
}

// 8. Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
    updateDate();
    registerEvents();
    fetchAccounts();
    
    // Make delete globally available for onclick row actions
    window.deleteAccount = deleteAccount;
});
