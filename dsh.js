document.addEventListener('DOMContentLoaded', () => {
    // Set welcome message based on login status
    const userData = JSON.parse(localStorage.getItem('newUser'));
    if (userData && userData.firstName) {
        document.getElementById('welcomeMessage').textContent = `Welcome, ${userData.firstName}!`;
    }

    // Sample data for dashboard
    const user = {
        balance: 25000,
        currency: '$'
    };

    const positions = [
        { symbol: 'WHEAT-US-JUN26', side: 'long', quantity: 50, entry: 0.65, current: 0.71 },
        { symbol: 'CORN-US-MAR26', side: 'short', quantity: 100, entry: 0.42, current: 0.45 },
        { symbol: 'SOY-BR-SEP26', side: 'long', quantity: 20, entry: 0.98, current: 0.95 }
    ];

    const history = [
        { symbol: 'RICE-AS-DEC25', side: 'long', profit: 125, date: '2025-08-20' },
        { symbol: 'COFFEE-US-MAY26', side: 'short', profit: -75, date: '2025-08-15' }
    ];

    // Functions to render data
    function renderBalance() {
        const balanceValue = document.getElementById('balanceValue');
        balanceValue.textContent = `${user.currency}${user.balance.toLocaleString()}`;
    }

    function renderSummary() {
        // Render portfolio value and P&L
        const portfolioValue = document.getElementById('portfolioValue');
        const totalPnL = document.getElementById('totalPnL');
        const changePercentage = document.getElementById('changePercentage');
        
        let currentValue = user.balance;
        positions.forEach(pos => {
            currentValue += (pos.current - pos.entry) * pos.quantity;
        });

        const totalProfitLoss = currentValue - user.balance;

        portfolioValue.textContent = `${user.currency}${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        totalPnL.textContent = `${user.currency}${totalProfitLoss.toFixed(2)}`;
        
        const pnLClass = totalProfitLoss >= 0 ? 'positive' : 'negative';
        totalPnL.className = `summary-price ${pnLClass}`;
        
        const percentage = (totalProfitLoss / user.balance) * 100;
        changePercentage.textContent = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
        changePercentage.className = `summary-change ${pnLClass}`;
    }

    function renderPositions() {
        const positionsTableBody = document.getElementById('positionsTable');
        positionsTableBody.innerHTML = '';

        positions.forEach(pos => {
            const profitLoss = (pos.current - pos.entry) * pos.quantity;
            const profitClass = profitLoss >= 0 ? 'positive' : 'negative';
            const row = `
                <tr>
                    <td><span class="position-symbol">${pos.symbol}</span></td>
                    <td><span class="position-side ${pos.side}">${pos.side.toUpperCase()}</span></td>
                    <td>${pos.quantity}</td>
                    <td>$${pos.entry.toFixed(2)}</td>
                    <td>$${pos.current.toFixed(2)}</td>
                    <td class="position-profit ${profitClass}">${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}</td>
                    <td>
                        <button class="action-btn">Close</button>
                    </td>
                </tr>
            `;
            positionsTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function renderHistory() {
        const historyList = document.getElementById('tradeHistory');
        historyList.innerHTML = '';

        history.forEach(item => {
            const profitClass = item.profit >= 0 ? 'profit' : 'loss';
            const html = `
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-symbol">${item.symbol}</span>
                        <span class="history-details">${item.side.toUpperCase()} • ${item.date}</span>
                    </div>
                    <div class="history-price">
                        <span class="${profitClass}">${item.profit >= 0 ? '+' : ''}$${item.profit.toFixed(2)}</span>
                    </div>
                </div>
            `;
            historyList.insertAdjacentHTML('beforeend', html);
        });
    }

    // Initial render
    renderBalance();
    renderSummary();
    renderPositions();
    renderHistory();
});
