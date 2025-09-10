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

    // This function is now the single source of truth for the dashboard
    // It reads all its data from localStorage, which is updated by mrkt.js
    function renderOpenPositions() {
        const tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
        const marketData = JSON.parse(localStorage.getItem('marketData')) || [];
        
        if (tradeHistory.length === 0) {
            positionsList.innerHTML = '<p class="no-positions">You have no open positions.</p>';
            portfolioValueElement.textContent = '$0.00';
            totalProfitLossElement.textContent = '0.00%';
            return;
        }

        // Use a Set to track unique symbols to correctly calculate portfolio value
        const uniqueSymbols = new Set(tradeHistory.map(trade => trade.symbol));
        let totalPortfolioValue = 0;
        let totalProfitLoss = 0;

        positionsList.innerHTML = ''; // Clear the list before rendering
        
        uniqueSymbols.forEach(symbol => {
            const relevantTrades = tradeHistory.filter(trade => trade.symbol === symbol);
            
            // Calculate total quantity for the symbol
            const totalQuantity = relevantTrades.reduce((sum, trade) => {
                if (trade.action === 'buy') {
                    return sum + trade.quantity;
                } else {
                    return sum - trade.quantity;
                }
            }, 0);

            // Find the current market price for this symbol
            const currentMarket = marketData.find(market => market.symbol === symbol);

            // Only render the position if the total quantity is greater than 0
            if (currentMarket && totalQuantity > 0) {
                // Calculate the current value and profit/loss
                const initialValue = relevantTrades.reduce((sum, trade) => sum + trade.price * trade.quantity, 0);
                const currentValue = totalQuantity * currentMarket.price;
                const profitLoss = currentValue - initialValue;
                const profitLossPercent = (profitLoss / initialValue) * 100;
                
                totalPortfolioValue += currentValue;
                totalProfitLoss += profitLoss;

                const profitLossClass = profitLoss >= 0 ? 'positive' : 'negative';
                const positionHtml = `
                    <div class="position-card">
                        <div class="position-info">
                            <span class="position-symbol">${symbol}</span>
                            <span class="position-name">${currentMarket.name}</span>
                        </div>
                        <div class="position-details">
                            <div class="detail-item">
                                <span class="detail-label">Quantity</span>
                                <span class="detail-value">${totalQuantity.toFixed(2)}</span>
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
            }
        });
        
        // Update summary values
        const totalInitialValue = tradeHistory.reduce((sum, trade) => sum + trade.price * trade.quantity, 0);
        const totalProfitLossPercent = (totalProfitLoss / totalInitialValue) * 100;
        
        portfolioValueElement.textContent = `$${totalPortfolioValue.toFixed(2)}`;
        const totalProfitLossClass = totalProfitLoss >= 0 ? 'positive' : 'negative';
        totalProfitLossElement.textContent = `${totalProfitLoss >= 0 ? '+' : ''}${totalProfitLossPercent.toFixed(2)}%`;
        totalProfitLossElement.className = `summary-value ${totalProfitLossClass}`;
    }

    // Initial render and set up a refresh interval
    renderOpenPositions();
    setInterval(renderOpenPositions, 5000); // Refresh every 5 seconds to sync with markets page
});
