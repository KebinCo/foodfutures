document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }

    const positionsList = document.getElementById('positionsList');
    const portfolioValueElement = document.getElementById('portfolioValue');
    const totalProfitLossElement = document.getElementById('totalProfitLoss');

    // Function to calculate a consistent price based on time
    function getCyclicalPrice(basePrice, volatility, durationMinutes = 30) {
        const now = Date.now();
        const cycleDuration = durationMinutes * 60 * 1000;
        const phase = (now % cycleDuration) / cycleDuration;
        const fluctuation = Math.sin(phase * 2 * Math.PI) * volatility;
        return basePrice * (1 + fluctuation);
    }

    function renderOpenPositions() {
        const tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
        const marketData = JSON.parse(localStorage.getItem('marketData')) || [];
        
        if (tradeHistory.length === 0) {
            positionsList.innerHTML = '<p class="no-positions">You have no open positions.</p>';
            portfolioValueElement.textContent = '$0.00';
            totalProfitLossElement.textContent = '0.00%';
            return;
        }

        positionsList.innerHTML = '';
        let totalPortfolioValue = 0;
        let totalProfitLoss = 0;
        
        tradeHistory.forEach(trade => {
            const currentMarket = marketData.find(m => m.symbol === trade.symbol);
            if (!currentMarket) return;
            
            const currentValue = currentMarket.price * trade.quantity;
            const initialValue = trade.price * trade.quantity;
            const profitLoss = currentValue - initialValue;
            const profitLossPercent = (profitLoss / initialValue) * 100;

            totalPortfolioValue += currentValue;
            totalProfitLoss += profitLoss;

            const profitLossClass = profitLoss >= 0 ? 'positive' : 'negative';
            const actionClass = trade.action === 'buy' ? 'positive' : 'negative';

            const positionHtml = `
                <div class="position-card">
                    <div class="position-header">
                        <span class="position-symbol">${trade.symbol}</span>
                        <span class="position-name">${trade.name}</span>
                    </div>
                    <div class="position-details">
                        <div class="detail-item">
                            <span class="detail-label">Action</span>
                            <span class="detail-value ${actionClass}">${trade.action.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Quantity</span>
                            <span class="detail-value">${trade.quantity}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Entry Price</span>
                            <span class="detail-value">$${trade.price.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Current Price</span>
                            <span class="detail-value">$${currentMarket.price.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">P/L ($)</span>
                            <span class="detail-value ${profitLossClass}">$${profitLoss.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">P/L (%)</span>
                            <span class="detail-value ${profitLossClass}">${profitLossPercent.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            `;
            positionsList.insertAdjacentHTML('beforeend', positionHtml);
        });
        
        // Update summary values
        const totalInitialValue = tradeHistory.reduce((sum, trade) => sum + trade.price * trade.quantity, 0);
        const totalProfitLossPercent = (totalProfitLoss / totalInitialValue) * 100;
        
        portfolioValueElement.textContent = `$${totalPortfolioValue.toFixed(2)}`;
        const totalProfitLossClass = totalProfitLossPercent >= 0 ? 'positive' : 'negative';
        totalProfitLossElement.textContent = `${totalProfitLossPercent >= 0 ? '+' : ''}${totalProfitLossPercent.toFixed(2)}%`;
        totalProfitLossElement.className = `summary-value ${totalProfitLossClass}`;
    }

    // Initial render and set up a refresh interval
    renderOpenPositions();
    setInterval(renderOpenPositions, 10000); // Refresh every 10 seconds
});
