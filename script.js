// Ultra Finance Pro - Advanced Financial Management System
class UltraFinancePro {
    constructor() {
        this.transactions = this.loadTransactions();
        this.budgets = this.loadBudgets();
        this.settings = this.loadSettings();
        this.categories = {
            income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Business', 'Rental', 'Other'],
            expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Housing', 'Utilities', 'Insurance', 'Refund', 'Other']
        };
        
        this.charts = {};
        this.isSubmitting = false;
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.updateCategoryDropdown();
        this.updateSummary();
        this.updateStats();
        this.displayTransactions();
        this.displayBudgets();
        this.initializeCharts();
        this.setupThemeToggle();
        this.animateElements();
    }

    setupEventListeners() {
        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.isSubmitting) {
                this.addTransaction();
            }
        });

        // Transaction type change
        document.getElementById('transactionType').addEventListener('change', () => {
            this.updateCategoryDropdown();
            this.toggleSourceField();
        });

        // Budget form
        document.getElementById('setBudget').addEventListener('click', () => {
            this.setBudget();
        });

        // Filters
        document.getElementById('filterType').addEventListener('change', () => {
            this.displayTransactions();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.displayTransactions();
        });

        document.getElementById('filterDate').addEventListener('change', () => {
            this.displayTransactions();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Amount input validation
        document.getElementById('amount').addEventListener('input', (e) => {
            this.validateAmount(e.target);
            this.formatCurrency(e.target);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        document.getElementById('transactionForm').focus();
                        break;
                    case 'b':
                        e.preventDefault();
                        document.getElementById('budgetCategory').focus();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportData();
                        break;
                }
            }
        });
    }

    updateCategoryDropdown() {
        const typeSelect = document.getElementById('transactionType');
        const categorySelect = document.getElementById('category');
        const selectedType = typeSelect.value;

        categorySelect.innerHTML = '<option value="">Select Category</option>';

        if (selectedType && this.categories[selectedType]) {
            this.categories[selectedType].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        this.updateFilterCategories();
    }

    toggleSourceField() {
        const typeSelect = document.getElementById('transactionType');
        const sourceGroup = document.getElementById('sourceGroup');
        
        if (typeSelect.value === 'income') {
            sourceGroup.style.display = 'block';
            sourceGroup.style.animation = 'fadeInUp 0.3s ease';
        } else {
            sourceGroup.style.display = 'none';
        }
    }

    validateAmount(input) {
        const value = parseFloat(input.value);
        
        if (input.value && isNaN(value)) {
            input.setCustomValidity('Please enter a valid number');
        } else {
            input.setCustomValidity('');
        }
    }

    formatCurrency(input) {
        if (input.value) {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                input.style.color = value < 0 ? '#ff4444' : '#00ff88';
            }
        }
    }

    addTransaction() {
        // Prevent double submission
        if (this.isSubmitting) return;
        
        this.isSubmitting = true;
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        const form = document.getElementById('transactionForm');
        
        const transaction = {
            id: Date.now() + Math.random(),
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            source: document.getElementById('source').value || null,
            description: document.getElementById('description').value || '',
            date: new Date().toISOString(),
            tags: this.extractTags(document.getElementById('description').value)
        };

        if (!transaction.type || !transaction.category || isNaN(transaction.amount)) {
            this.showMessage('Please fill in all required fields with valid values.', 'error');
            this.resetSubmitButton(submitBtn, originalText);
            return;
        }

        if (transaction.amount === 0) {
            this.showMessage('Amount cannot be zero.', 'error');
            this.resetSubmitButton(submitBtn, originalText);
            return;
        }

        // Simulate processing time for better UX
        setTimeout(() => {
            this.transactions.push(transaction);
            this.saveTransactions();
            
            this.updateSummary();
            this.updateStats();
            this.displayTransactions();
            this.displayBudgets();
            this.updateCharts();
            
            form.reset();
            document.getElementById('sourceGroup').style.display = 'none';
            
            const message = transaction.amount < 0 
                ? `Refund/Adjustment of $${Math.abs(transaction.amount).toFixed(2)} added successfully!`
                : `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount.toFixed(2)} added successfully!`;
            
            this.showMessage(message, 'success');
            
            if (transaction.type === 'expense') {
                this.checkBudgetAlerts(transaction.category, transaction.amount);
            }

            // Add animation to new transaction
            this.animateNewTransaction(transaction);
            
            // Reset button after success
            this.resetSubmitButton(submitBtn, originalText);
        }, 500);
    }

    resetSubmitButton(button, originalText) {
        this.isSubmitting = false;
        button.disabled = false;
        button.innerHTML = originalText;
    }

    extractTags(description) {
        const tags = [];
        const tagRegex = /#(\w+)/g;
        let match;
        while ((match = tagRegex.exec(description)) !== null) {
            tags.push(match[1]);
        }
        return tags;
    }

    animateNewTransaction(transaction) {
        const list = document.getElementById('transactionList');
        const firstItem = list.firstElementChild;
        if (firstItem) {
            firstItem.style.animation = 'fadeInUp 0.5s ease';
        }
    }

    setBudget() {
        const category = document.getElementById('budgetCategory').value.trim();
        const amount = parseFloat(document.getElementById('budgetAmount').value);

        if (!category || isNaN(amount) || amount <= 0) {
            this.showMessage('Please enter a valid category name and budget amount.', 'error');
            return;
        }

        this.budgets[category] = amount;
        this.saveBudgets();
        this.displayBudgets();
        this.updateCharts();

        document.getElementById('budgetCategory').value = '';
        document.getElementById('budgetAmount').value = '';

        this.showMessage(`Budget set for ${category}: $${amount.toFixed(2)}`, 'success');
    }

    checkBudgetAlerts(category, amount) {
        if (this.budgets[category]) {
            const monthlyExpenses = this.getMonthlyExpensesByCategory(category);
            const budget = this.budgets[category];
            
            if (monthlyExpenses > budget) {
                this.showMessage(
                    `⚠️ Budget Alert: You've exceeded your ${category} budget by $${(monthlyExpenses - budget).toFixed(2)}!`,
                    'warning'
                );
            } else if (monthlyExpenses > budget * 0.8) {
                this.showMessage(
                    `⚠️ Budget Warning: You've used ${((monthlyExpenses/budget)*100).toFixed(1)}% of your ${category} budget`,
                    'warning'
                );
            }
        }
    }

    displayTransactions() {
        const container = document.getElementById('transactionList');
        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        const filterDate = document.getElementById('filterDate').value;

        let filteredTransactions = this.transactions;

        // Apply filters
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
        }

        if (filterCategory !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
        }

        if (filterDate !== 'all') {
            const now = new Date();
            const startDate = this.getStartDate(filterDate, now);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
        }

        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredTransactions.length === 0) {
            container.innerHTML = '<div class="transaction-item"><p style="text-align: center; color: var(--text-secondary);">No transactions found.</p></div>';
            return;
        }

        container.innerHTML = filteredTransactions.map(transaction => {
            const date = new Date(transaction.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            const amountClass = transaction.amount < 0 ? 'negative' : transaction.type;
            const amountPrefix = transaction.amount < 0 ? '-' : '';
            const tags = transaction.tags && transaction.tags.length > 0 
                ? transaction.tags.map(tag => `<span style="background: rgba(0,255,136,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-right: 5px; color: #00ff88;">#${tag}</span>`).join('')
                : '';
            
            return `
                <div class="transaction-item" data-id="${transaction.id}">
                    <div class="transaction-info">
                        <h4>${transaction.category}</h4>
                        <p>${dateStr} at ${timeStr}</p>
                        ${transaction.description ? `<p>${transaction.description}</p>` : ''}
                        ${transaction.source ? `<p>Source: ${transaction.source}</p>` : ''}
                        ${tags}
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix}$${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-icon delete" onclick="financeTracker.deleteTransaction('${transaction.id}')" title="Delete Transaction">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id.toString() === id.toString());
        
        if (!transaction) {
            this.showMessage('Transaction not found.', 'error');
            return;
        }

        const confirmMessage = `Are you sure you want to delete this ${transaction.type} transaction of $${Math.abs(transaction.amount).toFixed(2)}?`;
        
        if (confirm(confirmMessage)) {
            this.transactions = this.transactions.filter(t => t.id.toString() !== id.toString());
            this.saveTransactions();
            this.updateSummary();
            this.updateStats();
            this.displayTransactions();
            this.displayBudgets();
            this.updateCharts();
            this.showMessage('Transaction deleted successfully!', 'success');
        }
    }

    getStartDate(filterType, now) {
        switch(filterType) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week':
                const dayOfWeek = now.getDay();
                const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(0);
        }
    }

    displayBudgets() {
        const container = document.getElementById('budgetList');
        
        if (Object.keys(this.budgets).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No budgets set.</p>';
            return;
        }

        container.innerHTML = Object.entries(this.budgets).map(([category, budget]) => {
            const spent = this.getMonthlyExpensesByCategory(category);
            const percentage = (spent / budget) * 100;
            const isExceeded = percentage > 100;
            const remaining = budget - spent;
            
            return `
                <div class="budget-item ${isExceeded ? 'exceeded' : ''}">
                    <div class="budget-info">
                        <h4>${category}</h4>
                        <div class="budget-progress">
                            <div class="budget-progress-bar ${isExceeded ? 'exceeded' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    </div>
                    <div class="budget-amounts">
                        <div class="budget-spent">$${spent.toFixed(2)}</div>
                        <div class="budget-total">of $${budget.toFixed(2)}</div>
                        <div style="font-size: 0.8rem; color: ${remaining >= 0 ? '#00ff88' : '#ff4444'}">
                            ${remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpenses;

        // Calculate monthly changes
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthIncome = this.transactions
            .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthIncome = this.transactions
            .filter(t => t.type === 'income' && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const currentMonthExpenses = this.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthExpenses = this.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100) : 0;
        const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;
        const balanceChange = (currentMonthIncome - currentMonthExpenses) - (lastMonthIncome - lastMonthExpenses);

        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('netBalance').textContent = `$${netBalance.toFixed(2)}`;

        document.getElementById('incomeChange').textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% this month`;
        document.getElementById('expenseChange').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% this month`;
        document.getElementById('balanceChange').textContent = `${balanceChange >= 0 ? '+' : ''}$${balanceChange.toFixed(2)} this month`;
    }

    updateStats() {
        const totalTransactions = this.transactions.length;
        const activeBudgets = Object.keys(this.budgets).length;
        
        const currentMonthIncome = this.transactions
            .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentMonthExpenses = this.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const savingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome * 100) : 0;

        document.getElementById('totalTransactions').textContent = totalTransactions;
        document.getElementById('activeBudgets').textContent = activeBudgets;
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
    }

    initializeCharts() {
        this.createCategoryChart();
        this.createTrendChart();
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#00ff88', '#00cc6a', '#00aa55', '#008844',
                        '#ff4444', '#ff6666', '#ff8888', '#ffaaaa',
                        '#ffaa00', '#ffcc44', '#ffdd66', '#ffee88'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Income',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Expenses',
                    data: [],
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateTrendChart();
    }

    updateCategoryChart() {
        const expenseCategories = {};
        let totalExpenses = 0;

        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
                totalExpenses += t.amount;
            });

        const labels = Object.keys(expenseCategories);
        const data = Object.values(expenseCategories);

        this.charts.category.data.labels = labels;
        this.charts.category.data.datasets[0].data = data;
        this.charts.category.update();
    }

    updateTrendChart() {
        const monthlyData = {};
        const months = [];

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthKey);
            monthlyData[monthKey] = { income: 0, expenses: 0 };
        }

        this.transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                if (t.type === 'income') {
                    monthlyData[monthKey].income += t.amount;
                } else {
                    monthlyData[monthKey].expenses += t.amount;
                }
            }
        });

        const incomeData = months.map(month => monthlyData[month].income);
        const expenseData = months.map(month => monthlyData[month].expenses);

        this.charts.trend.data.labels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        this.charts.trend.data.datasets[0].data = incomeData;
        this.charts.trend.data.datasets[1].data = expenseData;
        this.charts.trend.update();
    }

    updateFilterCategories() {
        const container = document.getElementById('filterCategory');
        const allCategories = [...new Set(this.transactions.map(t => t.category))];
        
        container.innerHTML = '<option value="all">All Categories</option>';
        
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            container.appendChild(option);
        });
    }

    clearFilters() {
        document.getElementById('filterType').value = 'all';
        document.getElementById('filterCategory').value = 'all';
        document.getElementById('filterDate').value = 'all';
        this.displayTransactions();
    }

    getMonthlyExpensesByCategory(category) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.transactions
            .filter(t => 
                t.type === 'expense' && 
                t.category === category &&
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear
            )
            .reduce((sum, t) => sum + t.amount, 0);
    }

    showMessage(text, type = 'success') {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-exclamation-triangle';
        
        message.innerHTML = `<i class="${icon}"></i>${text}`;
        container.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'slideInRight 0.5s ease reverse';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 500);
            }
        }, 5000);
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            budgets: this.budgets,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ultra_finance_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.transactions && data.budgets) {
                            this.transactions = data.transactions;
                            this.budgets = data.budgets;
                            if (data.settings) this.settings = data.settings;
                            
                            this.saveTransactions();
                            this.saveBudgets();
                            this.saveSettings();
                            
                            this.initializeApp();
                            this.showMessage('Data imported successfully!', 'success');
                        } else {
                            this.showMessage('Invalid file format.', 'error');
                        }
                    } catch (error) {
                        this.showMessage('Error reading file.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.transactions = [];
            this.budgets = {};
            this.saveTransactions();
            this.saveBudgets();
            this.initializeApp();
            this.showMessage('All data cleared successfully!', 'success');
        }
    }

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        const icon = toggle.querySelector('i');
        
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                icon.className = 'fas fa-sun';
                this.settings.theme = 'light';
            } else {
                icon.className = 'fas fa-moon';
                this.settings.theme = 'dark';
            }
            this.saveSettings();
        });

        // Apply saved theme
        if (this.settings.theme === 'light') {
            document.body.classList.add('light-theme');
            icon.className = 'fas fa-sun';
        }
    }

    animateElements() {
        const cards = document.querySelectorAll('.card, .summary-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.animation = 'fadeInUp 0.8s ease-out forwards';
        });
    }

    // Local storage functions
    loadTransactions() {
        const stored = localStorage.getItem('ultraFinanceTransactions');
        return stored ? JSON.parse(stored) : [];
    }

    saveTransactions() {
        localStorage.setItem('ultraFinanceTransactions', JSON.stringify(this.transactions));
    }

    loadBudgets() {
        const stored = localStorage.getItem('ultraFinanceBudgets');
        return stored ? JSON.parse(stored) : {};
    }

    saveBudgets() {
        localStorage.setItem('ultraFinanceBudgets', JSON.stringify(this.budgets));
    }

    loadSettings() {
        const stored = localStorage.getItem('ultraFinanceSettings');
        return stored ? JSON.parse(stored) : { theme: 'dark' };
    }

    saveSettings() {
        localStorage.setItem('ultraFinanceSettings', JSON.stringify(this.settings));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.financeTracker = new UltraFinancePro();
});

// Add light theme styles
const lightThemeStyles = `
    body.light-theme {
        --bg-dark: #f8f9fa;
        --bg-card: rgba(255, 255, 255, 0.9);
        --bg-card-hover: rgba(255, 255, 255, 0.95);
        --text-primary: #333333;
        --text-secondary: #666666;
        --text-muted: #999999;
        --border-color: rgba(0, 0, 0, 0.1);
        --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        --shadow-hover: 0 16px 64px rgba(0, 0, 0, 0.15);
    }
    
    body.light-theme::before {
        background: 
            radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 255, 136, 0.02) 0%, transparent 50%);
    }
    
    body.light-theme .form-group input,
    body.light-theme .form-group select,
    body.light-theme .form-group textarea {
        background: rgba(255, 255, 255, 0.8);
        color: #333;
        border-color: rgba(0, 0, 0, 0.1);
    }
    
    body.light-theme select option {
        background: #ffffff;
        color: #333;
    }
    
    body.light-theme .transaction-list {
        background: rgba(255, 255, 255, 0.8);
    }
    
    body.light-theme .budget-item {
        background: rgba(255, 255, 255, 0.8);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = lightThemeStyles;
document.head.appendChild(styleSheet); 