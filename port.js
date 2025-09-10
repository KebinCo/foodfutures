document.addEventListener('DOMContentLoaded', () => {
    // Check for login status and render the correct nav bar
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // Sample data for a more detailed portfolio view
    let currentPositions = [
        { id: 1, symbol: 'WHEAT-US-JUN26', side: 'long', quantity: 50, entryPrice: 0.65, currentPrice: 0.71, assetClass: 'Grains' },
        { id: 2, symbol: 'CORN-US-MAR26', side: 'short', quantity: 100, entryPrice: 0.42, currentPrice: 0.45, assetClass: 'Grains' },
        { id: 3, symbol: 'BEEF-US-AUG26', side: 'long', quantity: 20, entryPrice: 0.98, currentPrice: 0.95, assetClass: 'Livestock' },
        { id: 4, symbol: 'SUGAR-AU-DEC26', side: 'long', quantity: 75, entryPrice: 0.34, currentPrice: 0.38, assetClass: 'Softs' }
    ];

    let historicalTrades = [
        { id: 5, symbol: 'RICE-AS-DEC25', side: 'long', quantity: 40, profit: 125, date: '2025-08-20', assetClass: 'Grains' },
        { id: 6, symbol: 'COFFEE-US-MAY26', side: 'short', quantity: 50, profit: -75, date: '2025-08-15', assetClass: 'Softs' },
        { id: 7, symbol: 'PORK-US-FEB26', side: 'long', quantity: 30, profit: 90, date: '2025-08-10', assetClass: 'Livestock' }
    ];

    const portfolioValueElement = document.getElementById('portfolioValue');
    const positionsTableBody = document.getElementById('positionsTable');
    const historyTableBody = document.getElementById('historyTable');
    const positionCountElement = document.getElementById('positionCount');
    const portfolioChartCanvas = document.getElementById('portfolioChart');

    // Function to calculate and render portfolio value
    function renderPortfolioValue() {
        const baseBalance = 25000;
        let totalPnL = 0;
        currentPositions.forEach(pos => {
            totalPnL += (pos.currentPrice - pos.entryPrice) * pos.quantity;
        });
        const totalValue = baseBalance + totalPnL;
        portfolioValueElement.textContent = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Function to render current positions table
    function renderPositions() {
        positionsTableBody.innerHTML = '';
        currentPositions.forEach(pos => {
            const profitLoss = (pos.currentPrice - pos.entryPrice) * pos.quantity;
            const profitClass = profitLoss >= 0 ? 'positive' : 'negative';
            const row = `
                <tr>
                    <td><span class="position-symbol">${pos.symbol}</span></td>
                    <td><span class="position-side ${pos.side}">${pos.side.toUpperCase()}</span></td>
                    <td>${pos.quantity}</td>
                    <td><span class="position-profit ${profitClass}">${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}</span></td>
                    <td>
                        <button class="action-btn close-btn" data-id="${pos.id}">Close</button>
                        <a href="trade-details.html?id=${pos.id}" class="action-btn">Details</a>
                    </td>
                </tr>
            `;
            positionsTableBody.insertAdjacentHTML('beforeend', row);
        });
        positionCountElement.textContent = `${currentPositions.length} Positions`;
    }

    // Function to handle "Close Position" button
    function closePosition(id) {
        const positionToClose = currentPositions.find(pos => pos.id === id);
        if (positionToClose) {
            // Calculate final P&L and move to history
            const profitLoss = (positionToClose.currentPrice - positionToClose.entryPrice) * positionToClose.quantity;
            historicalTrades.push({
                id: Date.now(), // New unique ID
                symbol: positionToClose.symbol,
                side: positionToClose.side,
                profit: profitLoss,
                date: new Date().toISOString().slice(0, 10),
                assetClass: positionToClose.assetClass
            });
            
            // Remove from current positions
            currentPositions = currentPositions.filter(pos => pos.id !== id);
            
            // Re-render
            renderPositions();
            renderHistory();
            renderPortfolioChart();
            renderPortfolioValue();
        }
    }

    // Function to render historical trades table
    function renderHistory() {
        historyTableBody.innerHTML = '';
        historicalTrades.forEach(trade => {
            const profitClass = trade.profit >= 0 ? 'positive' : 'negative';
            const row = `
                <tr>
                    <td><span class="history-symbol">${trade.symbol}</span></td>
                    <td><span class="history-side ${trade.side}">${trade.side.toUpperCase()}</span></td>
                    <td><span class="history-profit ${profitClass}">${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}</span></td>
                </tr>
            `;
            historyTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Function to render pie chart
    function renderPortfolioChart() {
        const assetBreakdown = {};
        let totalValue = 0;
        currentPositions.forEach(pos => {
            const value = pos.currentPrice * pos.quantity;
            totalValue += value;
            if (assetBreakdown[pos.assetClass]) {
                assetBreakdown[pos.assetClass] += value;
            } else {
                assetBreakdown[pos.assetClass] = value;
            }
        });

        const assetLabels = Object.keys(assetBreakdown);
        const assetValues = Object.values(assetBreakdown);
        const backgroundColors = [
            '#00ff88', '#ffa726', '#ff4757', '#a0a0a0', '#00bcd4'
        ];

        new Chart(portfolioChartCanvas, {
            type: 'doughnut',
            data: {
                labels: assetLabels,
                datasets: [{
                    data: assetValues,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percentage = (value / totalValue * 100).toFixed(2);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Event listener for "Close Position" button
    positionsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-btn')) {
            const id = parseInt(event.target.dataset.id);
            closePosition(id);
        }
    });

    // Initial render of all components
    renderPortfolioValue();
    renderPositions();
    renderHistory();
    renderPortfolioChart();
});
