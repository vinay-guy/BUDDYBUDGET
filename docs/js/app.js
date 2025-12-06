// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCurrency();
    initData();
    initMobileMenu();
    initGamification();
    initInteractiveBackground();

    // Page specific inits
    if (document.getElementById('transactionForm')) initTransactionForm();
    if (document.getElementById('expenseChart')) initCharts();
    if (document.getElementById('friendsList')) renderFriends();
    if (document.getElementById('profileView')) initProfile();

    // Auto-save check
    checkAutoSave();
});

// --- Database (LocalStorage Wrapper) ---
const DB = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    add: (key, item) => {
        const data = DB.get(key);
        data.push(item);
        DB.set(key, data);
    },
    update: (key, item) => {
        const data = DB.get(key);
        const index = data.findIndex(i => i.id === item.id);
        if (index !== -1) {
            data[index] = item;
            DB.set(key, data);
        }
    },
    delete: (key, id) => {
        const data = DB.get(key);
        const newData = data.filter(i => i.id !== id);
        DB.set(key, newData);
    }
};

// --- Profile Logic ---
function initProfile() {
    const profile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: 'User',
        title: 'Novice Saver',
        bio: 'No bio set yet.',
        avatar: '<i class="ri-user-line"></i>'
    };

    // View Mode
    setText('viewName', profile.name);
    setText('viewTitle', profile.title);
    document.getElementById('viewBio').innerHTML = profile.bio.replace(/\n/g, '<br>');
    document.getElementById('viewAvatar').innerHTML = profile.avatar;

    // Edit Mode Inputs
    const nameInput = document.getElementById('editName');
    if (nameInput) {
        nameInput.value = profile.name;
        document.getElementById('editTitle').value = profile.title;
        document.getElementById('editBio').value = profile.bio;

        // Avatar Selection
        const radios = document.querySelectorAll('input[name="avatar"]');
        radios.forEach(r => {
            if (r.value === profile.avatar) r.checked = true;
        });
    }

    // Stats in Profile
    const streak = localStorage.getItem('streak') || '0';
    const xp = parseInt(localStorage.getItem('xp') || '0');
    const level = Math.floor(xp / 1000) + 1;

    setText('viewLevel', level);
    setText('viewStreak', streak);
    setText('viewXP', xp);
}

function toggleEditMode() {
    const view = document.getElementById('profileView');
    const form = document.getElementById('profileForm');

    if (view.classList.contains('hidden')) {
        view.classList.remove('hidden');
        form.classList.add('hidden');
    } else {
        view.classList.add('hidden');
        form.classList.remove('hidden');
    }
}

function saveProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const profile = {
        name: formData.get('name'),
        title: formData.get('title'),
        bio: formData.get('bio'),
        avatar: formData.get('avatar')
    };

    localStorage.setItem('userProfile', JSON.stringify(profile));
    showToast('Profile Updated!');
    initProfile();
    toggleEditMode();
}

// --- Gamification Logic ---
function initGamification() {
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const lastLogin = localStorage.getItem('lastLogin');

    if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLogin === yesterday.toDateString()) {
            streak++;
        } else {
            streak = 1;
        }
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastLogin', today);
    }

    updateGamificationUI();
}

function updateGamificationUI() {
    const streak = localStorage.getItem('streak') || '0';
    const xp = parseInt(localStorage.getItem('xp') || '0');
    const level = Math.floor(xp / 1000) + 1;
    const progress = (xp % 1000) / 10;

    document.querySelectorAll('#streakCount').forEach(el => el.textContent = streak);
    document.querySelectorAll('#userLevel').forEach(el => el.textContent = `Lvl ${level}`);
    document.querySelectorAll('#xpBar').forEach(el => el.style.width = `${progress}%`);
}

function addXP(amount) {
    let xp = parseInt(localStorage.getItem('xp') || '0');
    xp += 10 + Math.floor(amount / 10);
    localStorage.setItem('xp', xp);
    updateGamificationUI();

    const oldLevel = Math.floor((xp - (10 + Math.floor(amount / 10))) / 1000) + 1;
    const newLevel = Math.floor(xp / 1000) + 1;
    if (newLevel > oldLevel) {
        showToast(`<i class="ri-party-line"></i> Level Up! You are now Level ${newLevel}!`);
        triggerConfetti();
    }
}

// --- Social Logic (Dynamic Leaderboard) ---
function renderFriends() {
    const container = document.getElementById('friendsList');
    if (!container) return;

    // Initialize mock friends if not exists
    let friends = JSON.parse(localStorage.getItem('friendsData'));
    if (!friends) {
        friends = [
            { name: 'Alice', level: 5, streak: 12, avatar: '<i class="ri-user-3-line"></i>' },
            { name: 'Bob', level: 3, streak: 4, avatar: '<i class="ri-user-star-line"></i>' },
            { name: 'Charlie', level: 7, streak: 30, avatar: '<i class="ri-user-heart-line"></i>' },
            { name: 'Dave', level: 2, streak: 1, avatar: '<i class="ri-user-smile-line"></i>' }
        ];
        localStorage.setItem('friendsData', JSON.stringify(friends));
    }

    // Simulate dynamic changes (randomly increase stats occasionally)
    if (Math.random() > 0.7) {
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        randomFriend.streak += 1;
        if (Math.random() > 0.5) randomFriend.level += 1;
        localStorage.setItem('friendsData', JSON.stringify(friends));
    }

    const profile = JSON.parse(localStorage.getItem('userProfile')) || { name: 'You', avatar: '<i class="ri-user-line"></i>' };
    const streak = localStorage.getItem('streak') || '0';
    const xp = parseInt(localStorage.getItem('xp') || '0');
    const level = Math.floor(xp / 1000) + 1;

    // Combine user and friends
    const allUsers = [...friends, { name: profile.name, level: level, streak: parseInt(streak), avatar: profile.avatar, isUser: true }];

    // Sort by Level then Streak
    allUsers.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.streak - a.streak;
    });

    container.innerHTML = allUsers.map((f, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'rank-1';
        else if (index === 1) rankClass = 'rank-2';
        else if (index === 2) rankClass = 'rank-3';

        const isFriend = !f.isUser;
        const removeBtn = isFriend ? `<button onclick="removeFriend('${f.name}')" class="icon-btn delete small" title="Remove Friend" style="margin-left:auto;"><i class="ri-user-unfollow-line"></i></button>` : '';

        return `
        <div class="friend-item ${rankClass}" style="${f.isUser ? 'background:var(--surface-hover); border: 1px solid var(--primary-color);' : ''}">
            <div class="friend-info">
                <span style="font-weight:700; color:var(--text-muted); width:20px;">#${index + 1}</span>
                <div class="friend-avatar">${f.avatar}</div>
                <div>
                    <h4 style="margin:0;">${f.name} ${f.isUser ? '(You)' : ''}</h4>
                    <span class="friend-level">Lvl ${f.level}</span>
                </div>
            </div>
            <div class="friend-stats" style="display:flex; align-items:center; gap:0.5rem;">
                <div style="font-weight:700; color:#f59e0b;"><i class="ri-fire-line"></i> ${f.streak}</div>
                ${removeBtn}
            </div>
        </div>
    `}).join('');
}

function addFriend() {
    const name = prompt("Enter friend's username:");
    if (name) {
        // Check if already exists
        let friends = JSON.parse(localStorage.getItem('friendsData')) || [];
        if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
            alert('Friend already added!');
            return;
        }

        showToast(`Friend request sent to ${name}!`);
        // In a real app, this would send a request. Here we just mock it.
        friends.push({ name: name, level: 1, streak: 0, avatar: '<i class="ri-user-line"></i>' });
        localStorage.setItem('friendsData', JSON.stringify(friends));
        renderFriends();
    }
}

function removeFriend(name) {
    if (confirm(`Remove ${name} from friends?`)) {
        let friends = JSON.parse(localStorage.getItem('friendsData')) || [];
        friends = friends.filter(f => f.name !== name);
        localStorage.setItem('friendsData', JSON.stringify(friends));
        renderFriends();
        showToast(`${name} removed.`);
    }
}

function shareStats() {
    const streak = localStorage.getItem('streak') || '0';
    const xp = parseInt(localStorage.getItem('xp') || '0');
    const level = Math.floor(xp / 1000) + 1;

    const text = `🚀 I'm Level ${level} with a ${streak}-day streak on BuddyBudget! Can you beat me? #BuddyBudget`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Stats copied to clipboard! <i class="ri-clipboard-line"></i>');
    });
}

// --- Currency Logic ---
let currentCurrency = '$';

function initCurrency() {
    console.log('Initializing Currency...');
    const saved = localStorage.getItem('currency') || 'USD';
    const symbols = { 'USD': '$', 'INR': '₹', 'EUR': '€' };
    const icons = {
        'USD': 'ri-money-dollar-circle-fill',
        'INR': 'ri-money-rupee-circle-fill',
        'EUR': 'ri-money-euro-circle-fill'
    };
    currentCurrency = symbols[saved] || '$';

    // Custom Selector Logic
    const selector = document.getElementById('customCurrencySelector');
    const optionsContainer = document.getElementById('currencyOptions');
    const currentIcon = document.getElementById('currentCurrencyIcon');
    const budgetModalIcon = document.getElementById('budgetModalCurrencyIcon');
    const options = document.querySelectorAll('.currency-option');

    console.log('Currency elements:', { selector: !!selector, optionsContainer: !!optionsContainer, options: options.length });

    // Set initial icon
    const iconClass = icons[saved] || 'ri-money-dollar-circle-fill';
    if (currentIcon) {
        currentIcon.className = iconClass;
        console.log('Set icon to:', iconClass);
    }
    if (budgetModalIcon) budgetModalIcon.className = iconClass;

    if (selector && optionsContainer) {
        const trigger = selector.querySelector('.selected-currency');

        // Toggle dropdown
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            optionsContainer.classList.toggle('active');
            console.log('Dropdown toggled, active:', optionsContainer.classList.contains('active'));
        };

        if (trigger) {
            trigger.addEventListener('click', clickHandler);
            console.log('Listener attached to trigger');
        } else {
            selector.addEventListener('click', clickHandler);
            console.log('Listener attached to selector');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                optionsContainer.classList.remove('active');
            }
        });

        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                console.log('Currency selected:', value);
                localStorage.setItem('currency', value);
                currentCurrency = symbols[value];

                // Update icon
                const newIconClass = icons[value];
                if (currentIcon) currentIcon.className = newIconClass;
                if (budgetModalIcon) budgetModalIcon.className = newIconClass;

                // Close dropdown
                optionsContainer.classList.remove('active');

                // Refresh data display
                if (typeof initData === 'function') initData();
                if (typeof initCharts === 'function') initCharts();
            });
        });
    } else {
        console.error('Currency selector elements not found!');
    }
}

function formatMoney(amount) {
    return `${currentCurrency}${amount.toFixed(2)}`;
}

function initData() {
    const transactions = DB.get('transactions');
    updateStats(transactions);
    renderRecentTransactions(transactions);
    if (document.getElementById('budgetList')) renderBudgets();
    if (document.getElementById('goalsList')) renderGoals();
    if (document.getElementById('healthScore')) calculateHealthScore();
}

// --- Auto Savings Logic ---
function checkAutoSave() {
    const config = JSON.parse(localStorage.getItem('autoSaveConfig'));
    if (!config || !config.enabled) return;

    const lastRun = config.lastRun ? new Date(config.lastRun) : new Date(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastRun.setHours(0, 0, 0, 0);

    if (today > lastRun) {
        const goals = DB.get('goals');
        if (goals.length > 0) {
            const targetGoal = goals[0];
            targetGoal.current += config.amount;
            DB.update('goals', targetGoal);

            DB.add('transactions', {
                id: Date.now(),
                type: 'expense',
                amount: config.amount,
                category: 'investment',
                date: new Date().toISOString().split('T')[0],
                description: `Auto-Save: ${targetGoal.name}`
            });

            config.lastRun = new Date().toISOString();
            localStorage.setItem('autoSaveConfig', JSON.stringify(config));
            showToast(`Auto-saved ${formatMoney(config.amount)} to ${targetGoal.name}`);
        }
    }
}

function toggleAutoSave() {
    const config = JSON.parse(localStorage.getItem('autoSaveConfig')) || { enabled: false, amount: 10 };

    const amount = prompt("Enter daily auto-save amount:", config.amount);
    if (amount && !isNaN(amount)) {
        config.amount = parseFloat(amount);
        config.enabled = true;
        config.lastRun = new Date().toISOString();
        localStorage.setItem('autoSaveConfig', JSON.stringify(config));
        showToast(`Auto-save enabled: ${formatMoney(config.amount)}/day`);
    } else {
        config.enabled = false;
        localStorage.setItem('autoSaveConfig', JSON.stringify(config));
        showToast("Auto-save disabled");
    }
}

// --- Stats & Insights ---
function updateStats(transactions) {
    let income = 0, expense = 0;
    transactions.forEach(t => t.type === 'income' ? income += t.amount : expense += t.amount);
    const balance = income - expense;

    setText('totalIncome', `+${formatMoney(income)}`);
    setText('totalExpense', `-${formatMoney(expense)}`);
    setText('netBalance', `${formatMoney(balance)}`);
    setText('totalSavings', `${formatMoney(balance)}`);

    const balanceEl = document.getElementById('netBalance');
    if (balanceEl) balanceEl.className = `amount ${balance >= 0 ? 'positive' : 'negative'}`;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function calculateHealthScore() {
    const transactions = DB.get('transactions');
    const budgets = DB.get('budgets');

    let income = 0, expense = 0;
    transactions.forEach(t => t.type === 'income' ? income += t.amount : expense += t.amount);

    // Fix: Handle zero income case
    let savingsRate = 0;
    let savingsScore = 0;

    if (income > 0) {
        savingsRate = (income - expense) / income;
        savingsScore = Math.min((savingsRate / 0.2) * 50, 50);
        if (savingsScore < 0) savingsScore = 0;
    } else if (expense > 0) {
        // Penalize if no income but spending exists
        savingsScore = 0;
    } else {
        // Neutral start (no income, no expense)
        savingsScore = 50;
    }

    let budgetScore = 50;
    if (budgets.length > 0) {
        let overBudgetCount = 0;
        budgets.forEach(b => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((sum, t) => sum + t.amount, 0);
            if (spent > b.limit) overBudgetCount++;
        });
        // Fix: Ensure budget score doesn't go negative
        budgetScore = Math.max(0, 50 - (overBudgetCount * 15));
    }

    const totalScore = Math.round(savingsScore + budgetScore);
    const scoreEl = document.getElementById('healthScore');
    const msgEl = document.getElementById('healthMsg');

    if (scoreEl) {
        scoreEl.textContent = totalScore;
        scoreEl.style.color = totalScore > 80 ? 'var(--success-color)' : (totalScore > 50 ? 'var(--primary-color)' : 'var(--danger-color)');

        // Update SVG circle stroke
        const circle = document.querySelector('.circular-chart .circle');
        if (circle) {
            circle.setAttribute('stroke-dasharray', `${totalScore}, 100`);
            circle.style.stroke = totalScore > 80 ? 'var(--success-color)' : (totalScore > 50 ? 'var(--primary-color)' : 'var(--danger-color)');
        }
    }

    if (msgEl) {
        if (totalScore > 80) msgEl.innerHTML = "Excellent! You're a financial master. <i class='ri-trophy-line'></i>";
        else if (totalScore > 50) msgEl.innerHTML = "Good job! Keep watching those budgets. <i class='ri-thumb-up-line'></i>";
        else msgEl.innerHTML = "Needs attention. Try to save more! <i class='ri-alert-line'></i>";
    }
}

function exportData() {
    const transactions = DB.get('transactions');
    if (transactions.length === 0) {
        alert('No data to export!');
        return;
    }
    let csv = 'Date,Type,Category,Amount,Description\n';
    transactions.forEach(t => {
        csv += `${t.date},${t.type},${t.category},${t.amount},"${t.description || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buddybudget_data.csv';
    a.click();
}

// --- Transactions ---
let editingTransactionId = null;

function initTransactionForm() {
    const form = document.getElementById('transactionForm');
    const dateInput = document.getElementById('date');
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const categoryWrapper = document.getElementById('category-wrapper');
    const inputGrid = document.getElementById('inputGrid');
    const submitText = document.getElementById('submit-text');

    // New: Balance Display Elements
    const balanceDisplay = document.getElementById('currentBalanceDisplay');
    const incomeDisplay = document.getElementById('incomeDisplay');
    const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');

    // Helper to update balance display
    const updateBalanceDisplay = () => {
        const transactions = DB.get('transactions');
        let income = 0, expense = 0;
        transactions.forEach(t => t.type === 'income' ? income += t.amount : expense += t.amount);
        const balance = income - expense;

        if (balanceDisplay) {
            balanceDisplay.textContent = formatMoney(balance);
            balanceDisplay.style.color = balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }
        if (totalIncomeDisplay) {
            totalIncomeDisplay.textContent = formatMoney(income);
        }
    };

    updateBalanceDisplay(); // Initial call

    if (dateInput) dateInput.valueAsDate = new Date();

    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'income') {
                categoryWrapper.classList.add('hidden');
                inputGrid.classList.add('income-mode');
                submitText.textContent = 'Add Funds';
                document.getElementById('category').removeAttribute('required');
                if (incomeDisplay) incomeDisplay.classList.remove('hidden');
            } else {
                categoryWrapper.classList.remove('hidden');
                inputGrid.classList.remove('income-mode');
                submitText.textContent = 'Log Expense';
                document.getElementById('category').setAttribute('required', 'true');
                if (incomeDisplay) incomeDisplay.classList.add('hidden');
            }
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) loadTransactionForEdit(editId);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const type = formData.get('type');
        const amount = parseFloat(formData.get('amount'));
        const category = type === 'income' ? 'salary' : formData.get('category');

        if (type === 'expense') {
            const budgets = DB.get('budgets');
            const budget = budgets.find(b => b.category === category);
            if (budget) {
                const transactions = DB.get('transactions');
                const spent = transactions
                    .filter(t => t.type === 'expense' && t.category === category && t.id != editingTransactionId)
                    .reduce((sum, t) => sum + t.amount, 0);

                if (spent + amount > budget.limit) {
                    alert(`❌ Transaction Invalid!\n\nExceeds budget of ${formatMoney(budget.limit)} for ${category}.\nRemaining: ${formatMoney(budget.limit - spent)}`);
                    return;
                }
            }
        }

        const transaction = {
            id: editingTransactionId || Date.now(),
            type: type,
            amount: amount,
            category: category,
            date: formData.get('date'),
            description: formData.get('description')
        };

        if (editingTransactionId) {
            DB.update('transactions', transaction);
            showToast('Transaction Updated!');
            editingTransactionId = null;
            window.history.replaceState({}, document.title, window.location.pathname);
            document.querySelector('.form-title').textContent = 'New Entry';
            submitText.textContent = 'Log Expense';
        } else {
            DB.add('transactions', transaction);
            addXP(amount); // Gain XP
            triggerConfetti();
            playMoneySound(); // Cha-ching!
            showToast(type === 'income' ? 'Funds Added!' : 'Expense Logged!');
        }

        form.reset();
        if (dateInput) dateInput.valueAsDate = new Date();
        document.getElementById('type-expense').checked = true;
        categoryWrapper.classList.remove('hidden');
        inputGrid.classList.remove('income-mode');
        submitText.textContent = 'Log Expense';
        if (incomeDisplay) incomeDisplay.classList.add('hidden');

        initData();
        updateBalanceDisplay(); // Update balance immediately
    });
}

function loadTransactionForEdit(id) {
    const transactions = DB.get('transactions');
    const t = transactions.find(i => i.id == id);
    if (t) {
        editingTransactionId = t.id;
        const inputGrid = document.getElementById('inputGrid');
        if (t.type === 'income') {
            document.getElementById('type-income').checked = true;
            document.getElementById('category-wrapper').classList.add('hidden');
            inputGrid.classList.add('income-mode');
            document.getElementById('submit-text').textContent = 'Update Funds';
            document.getElementById('incomeDisplay').classList.remove('hidden');
        } else {
            document.getElementById('type-expense').checked = true;
            document.getElementById('category-wrapper').classList.remove('hidden');
            inputGrid.classList.remove('income-mode');
            document.getElementById('submit-text').textContent = 'Update Expense';
            document.getElementById('category').value = t.category;
            document.getElementById('incomeDisplay').classList.add('hidden');
        }
        document.getElementById('amount').value = t.amount;
        document.getElementById('date').value = t.date;
        document.getElementById('description').value = t.description;
        document.querySelector('.form-title').textContent = 'Edit Entry';
    }
}



function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        DB.delete('transactions', id);
        initData();
        showToast('Transaction Deleted');
    }
}

function renderRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const recent = transactions.sort((a, b) => b.id - a.id).slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No recent activity.</p>';
        return;
    }

    container.innerHTML = recent.map((t, index) => {
        const desc = t.description && t.description !== 'null' ? t.description : (t.type === 'income' ? 'Income' : t.category.charAt(0).toUpperCase() + t.category.slice(1));
        const delay = index * 0.1; // Stagger animation

        return `
        <div class="transaction-card" style="animation-delay: ${delay}s">
            <div class="t-left">
                <div class="t-icon-box">${getCategoryIcon(t.category)}</div>
                <div class="t-info">
                    <h4>${desc}</h4>
                    <span>${t.date}</span>
                </div>
            </div>
            <div class="t-right">
                <div class="t-amount ${t.type === 'income' ? 'positive' : 'negative'}">
                    ${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}
                </div>
                <div class="t-actions">
                    <button onclick="window.location.href='add.html?edit=${t.id}'" class="icon-btn" title="Edit"><i class="ri-pencil-line"></i></button>
                    <button onclick="deleteTransaction(${t.id})" class="icon-btn delete" title="Delete"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
        </div>
    `}).join('');
}

function getCategoryIcon(cat) {
    const icons = {
        food: '<i class="ri-restaurant-2-line"></i>',
        transport: '<i class="ri-car-line"></i>',
        utilities: '<i class="ri-lightbulb-line"></i>',
        entertainment: '<i class="ri-movie-2-line"></i>',
        shopping: '<i class="ri-shopping-bag-3-line"></i>',
        other: '<i class="ri-box-3-line"></i>',
        salary: '<i class="ri-money-dollar-circle-line"></i>',
        investment: '<i class="ri-stock-line"></i>',
        health: '<i class="ri-heart-pulse-line"></i>',
        education: '<i class="ri-book-open-line"></i>',
        travel: '<i class="ri-plane-line"></i>',
        subscriptions: '<i class="ri-calendar-check-line"></i>'
    };
    return icons[cat] || '<i class="ri-file-list-line"></i>';
}

// --- Budgets ---
let editingBudgetId = null;

function openBudgetModal(id = null) {
    const modal = document.getElementById('budgetModal');
    const form = document.getElementById('budgetForm');
    modal.classList.add('active');

    if (id) {
        const budget = DB.get('budgets').find(b => b.id === id);
        if (budget) {
            editingBudgetId = id;
            form.category.value = budget.category;
            form.limit.value = budget.limit;
            modal.querySelector('h3').textContent = 'Edit Budget';
            modal.querySelector('button[type="submit"]').textContent = 'Update Budget';
        }
    } else {
        editingBudgetId = null;
        form.reset();
        modal.querySelector('h3').textContent = 'Set New Budget';
        modal.querySelector('button[type="submit"]').textContent = 'Set Budget';
    }
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
}

function saveBudget(e) {
    e.preventDefault();
    const form = document.getElementById('budgetForm');
    const formData = new FormData(form);

    const budget = {
        id: editingBudgetId || Date.now(),
        category: formData.get('category'),
        limit: parseFloat(formData.get('limit'))
    };

    if (editingBudgetId) {
        DB.update('budgets', budget);
        showToast('Budget Updated!');
    } else {
        DB.add('budgets', budget);
        showToast('Budget Set!');
    }
    closeBudgetModal();
    renderBudgets();
    form.reset();
}

function deleteBudget(id) {
    if (confirm('Delete this budget?')) {
        DB.delete('budgets', id);
        renderBudgets();
        showToast('Budget Deleted');
    }
}

function renderBudgets() {
    const container = document.getElementById('budgetList');
    if (!container) return;

    const budgets = DB.get('budgets');
    const transactions = DB.get('transactions');

    if (budgets.length === 0) {
        container.innerHTML = '<p class="text-muted">No budgets set. Create one to start tracking!</p>';
        return;
    }

    container.className = 'budget-grid';
    container.innerHTML = budgets.map(b => {
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);

        const percent = Math.min((spent / b.limit) * 100, 100);
        const color = percent > 90 ? 'var(--danger-color)' : 'var(--primary-color)';
        const icon = getCategoryIcon(b.category);

        return `
        <div class="budget-card">
            <div class="budget-card-header">
                <div class="budget-icon">${icon}</div>
                <div class="budget-actions">
                    <button onclick="openBudgetModal(${b.id})" class="icon-btn"><i class="ri-pencil-line"></i></button>
                    <button onclick="deleteBudget(${b.id})" class="icon-btn delete"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
            <h3 style="margin-bottom:0.5rem;">${b.category.charAt(0).toUpperCase() + b.category.slice(1)}</h3>
            <div class="energy-bar-container">
                <div class="energy-bar" style="width: ${percent}%; background: ${color}"></div>
            </div>
            <div class="budget-details">
                <span>Spent: ${formatMoney(spent)}</span>
                <span>Limit: ${formatMoney(b.limit)}</span>
            </div>
        </div>`;
    }).join('');
}

// --- Goals ---
let editingGoalId = null;

function openGoalModal(id = null) {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    modal.classList.add('active');

    if (id) {
        const goal = DB.get('goals').find(g => g.id === id);
        if (goal) {
            editingGoalId = id;
            form.name.value = goal.name;
            form.target.value = goal.target;
            form.current.value = goal.current;
            modal.querySelector('h3').textContent = 'Update Goal';
            modal.querySelector('button[type="submit"]').textContent = 'Update Goal';
        }
    } else {
        editingGoalId = null;
        form.reset();
        modal.querySelector('h3').textContent = 'New Savings Goal';
        modal.querySelector('button[type="submit"]').textContent = 'Create Goal';
    }
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
}

function saveGoal(e) {
    e.preventDefault();
    const form = document.getElementById('goalForm');
    const formData = new FormData(form);

    const goal = {
        id: editingGoalId || Date.now(),
        name: formData.get('name'),
        target: parseFloat(formData.get('target')),
        current: parseFloat(formData.get('current') || 0)
    };

    if (editingGoalId) {
        DB.update('goals', goal);
        showToast('Goal Updated!');
    } else {
        DB.add('goals', goal);
        showToast('Goal Added!');
    }
    closeGoalModal();
    renderGoals();
    form.reset();
}

function deleteGoal(id) {
    if (confirm('Delete this goal?')) {
        DB.delete('goals', id);
        renderGoals();
        showToast('Goal Deleted');
    }
}

function depositToGoal(id) {
    const amount = prompt("Enter amount to deposit:");
    if (amount && !isNaN(amount)) {
        const goal = DB.get('goals').find(g => g.id === id);
        if (goal) {
            goal.current += parseFloat(amount);
            DB.update('goals', goal);

            DB.add('transactions', {
                id: Date.now(),
                type: 'expense',
                amount: parseFloat(amount),
                category: 'investment',
                date: new Date().toISOString().split('T')[0],
                description: `Deposit to ${goal.name}`
            });

            renderGoals();
            playMoneySound();
            showToast(`Deposited ${formatMoney(parseFloat(amount))}`);
        }
    }
}

function renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;

    const goals = DB.get('goals');

    let html = `
        <div style="margin-bottom:1rem; display:flex; justify-content:flex-end; width:100%;">
            <button onclick="toggleAutoSave()" class="btn-outline" style="font-size:0.9rem;">⚙️ Auto-Save Settings</button>
        </div>
    `;

    if (goals.length === 0) {
        html += '<p class="text-muted">No goals yet. Dream big!</p>';
        container.innerHTML = html;
        return;
    }

    container.className = 'budget-grid'; // Use Grid Layout

    // We need to render the button outside the grid, so we append the grid items to a string
    const cardsHtml = goals.map(g => {
        const percent = Math.min((g.current / g.target) * 100, 100);
        return `
        <div class="budget-card">
            <div class="budget-card-header">
                <div class="budget-icon"><i class="ri-focus-3-line"></i></div>
                <div class="budget-actions">
                    <button onclick="depositToGoal(${g.id})" class="icon-btn" title="Deposit Money"><i class="ri-add-line"></i></button>
                    <button onclick="openGoalModal(${g.id})" class="icon-btn"><i class="ri-pencil-line"></i></button>
                    <button onclick="deleteGoal(${g.id})" class="icon-btn delete"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
            <h3 style="margin-bottom:0.5rem;">${g.name}</h3>
            <div class="energy-bar-container">
                <div class="energy-bar" style="width: ${percent}%; background: var(--success-color)"></div>
            </div>
            <div class="budget-details">
                <span>Saved: ${formatMoney(g.current)}</span>
                <span>Target: ${formatMoney(g.target)}</span>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html + cardsHtml;
}

// --- Charts (Simplified) ---
let currentChart = null;

function initCharts(type = 'doughnut') {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    if (currentChart) {
        currentChart.destroy();
    }

    const transactions = DB.get('transactions');

    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    const btnMap = { 'doughnut': 0, 'bar': 1, 'line': 2, 'weekly': 3 };
    const btn = document.querySelectorAll('.chart-btn')[btnMap[type]];
    if (btn) btn.classList.add('active');

    if (transactions.length === 0) return;

    let config = {};

    if (type === 'doughnut') {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categories = {};
        expenses.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });

        config = {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#64748b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter' } } }
                }
            }
        };
    } else if (type === 'bar') {
        let income = 0, expense = 0;
        transactions.forEach(t => t.type === 'income' ? income += t.amount : expense += t.amount);

        config = {
            type: 'bar',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    label: 'Amount',
                    data: [income, expense],
                    backgroundColor: ['#10b981', '#f43f5e'],
                    borderRadius: 12,
                    barThickness: 50
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        };
    } else if (type === 'line') {
        const sorted = transactions.sort((a, b) => a.id - b.id).slice(-10);
        let balance = 0;
        const data = sorted.map(t => {
            if (t.type === 'income') balance += t.amount;
            else balance -= t.amount;
            return balance;
        });

        config = {
            type: 'line',
            data: {
                labels: sorted.map(t => t.date),
                datasets: [{
                    label: 'Balance',
                    data: data,
                    borderColor: '#8b5cf6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    pointRadius: 4,
                    pointBackgroundColor: '#8b5cf6'
                }]
            },
            options: {
                scales: {
                    y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        };
    } else if (type === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        const incomeData = new Array(7).fill(0);
        const expenseData = new Array(7).fill(0);

        transactions.forEach(t => {
            const tDate = t.date;
            const index = last7Days.indexOf(tDate);
            if (index !== -1) {
                if (t.type === 'income') incomeData[index] += t.amount;
                else expenseData[index] += t.amount;
            }
        });

        const labels = last7Days.map(dateStr => {
            const d = new Date(dateStr);
            return days[d.getDay()];
        });

        config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Expense',
                        data: expenseData,
                        backgroundColor: '#f43f5e',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: true, labels: { color: '#94a3b8' } } }
            }
        };
    }

    if (!config.options) config.options = {};
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;

    if (typeof Chart !== 'undefined') {
        currentChart = new Chart(ctx, config);
    }
}

function switchChart(type) {
    initCharts(type);
}

// --- UI Utilities ---
function initTheme() {
    const toggleContainer = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    if (toggleContainer) {
        toggleContainer.innerHTML = `
            <div class="theme-toggle-tab">
                <div class="theme-option ${saved === 'light' ? 'active' : ''}" onclick="setTheme('light')"><i class="ri-sun-line"></i></div>
                <div class="theme-option ${saved === 'dark' ? 'active' : ''}" onclick="setTheme('dark')"><i class="ri-moon-line"></i></div>
                <div class="theme-option ${saved === 'midnight' ? 'active' : ''}" onclick="setTheme('midnight')"><i class="ri-star-line"></i></div>
            </div>
        `;
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    initTheme();
}

function initMobileMenu() {
    const btn = document.getElementById('menuBtn');
    const nav = document.getElementById('navGroup');
    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('active');
            btn.innerHTML = nav.classList.contains('active') ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-line"></i>';
        });
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: var(--primary-color); color: white;
        padding: 1rem 2rem; border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease; z-index: 2000;
        font-family: var(--font-body);
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 100
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            if (p.life > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                p.size *= 0.95;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        if (active) requestAnimationFrame(animate);
        else canvas.remove();
    }

    animate();
}

function resetTransactions() {
    if (confirm('⚠️ Are you sure? This will delete ALL income and expense history permanently!')) {
        DB.set('transactions', []);
        initData();
        showToast('All transactions cleared!');
        const balanceDisplay = document.getElementById('currentBalanceDisplay');
        const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
        if (balanceDisplay) {
            balanceDisplay.textContent = formatMoney(0);
            balanceDisplay.style.color = 'var(--text-color)';
        }
        if (totalIncomeDisplay) {
            totalIncomeDisplay.textContent = formatMoney(0);
        }
    }
}

// --- Sound Effects ---
function playMoneySound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2000, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
    }, 100);
}

// --- Interactive Background ---
function initInteractiveBackground() {
    let canvas = document.getElementById('interactive-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'interactive-bg';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    const initParticles = () => {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const style = getComputedStyle(document.body);
        const color = style.getPropertyValue('--primary-color').trim();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.globalAlpha = 0.1 * (1 - dist / 100);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        if (mouse.x !== null) {
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.globalAlpha = 0.2 * (1 - dist / 150);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            });
        }

        animationId = requestAnimationFrame(draw);
    };

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
}

function resetGamification() {
    if (confirm('Are you sure you want to reset your Level and Streak? This cannot be undone.')) {
        localStorage.setItem('level', 1);
        localStorage.setItem('xp', 0);
        localStorage.setItem('streak', 0);
        localStorage.setItem('lastLogin', new Date().toDateString());

        initGamification();
        showToast('Level and Streak reset!', 'success');

        if (window.location.pathname.includes('profile.html')) {
            document.getElementById('viewLevel').textContent = 1;
            document.getElementById('viewStreak').textContent = 0;
            document.getElementById('viewXP').textContent = 0;
            document.getElementById('streakCount').textContent = 0;
            document.getElementById('userLevel').textContent = 'Lvl 1';
            document.getElementById('xpBar').style.width = '0%';
        }
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCurrency();
    initGamification();
    initData();
    initMobileMenu();
    initInteractiveBackground();

    if (window.location.pathname.includes('profile.html')) {
        initProfile();
        renderFriends();
    }
    if (window.location.pathname.includes('add.html')) {
        initTransactionForm();
    }
    if (window.location.pathname.includes('insights.html')) {
        initCharts('doughnut');
        renderFriends();
    }

    checkAutoSave();
});
