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
    function getDailyPriceChange(basePrice) {
        const today = new Date().toDateString();
        const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dailyFactor = (Math.sin(hash) + 1) / 2;
        const dailyChange = (dailyFactor - 0.5) * 0.10;
        return basePrice * dailyChange;
    }

    function getConsistentPrice(basePrice, dailyChange) {
        const now = Date.now();
        const secondsInDay = 24 * 60 * 60;
        const timeFactor = (now / 1000) % secondsInDay;
        const volatility = dailyChange / (secondsInDay / 2);
        return basePrice + (volatility * timeFactor) + dailyChange;
    }

    function findMarketBySymbol(symbol) {
        const marketData = JSON.parse(localStorage.getItem('marketData'));
        if (!marketData) return null;
        const market = marketData.find(m => m.symbol === symbol);
        if (market) {
            if (!market.dailyChange) {
                 market.dailyChange = getDailyPriceChange(market.basePrice);
            }
            market.price = getConsistentPrice(market.basePrice, market.dailyChange);
            market.change = ((market.price - market.basePrice) / market.basePrice) * 100;
        }
        return market;
    }

    function renderOpenPositions() {
        const tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
        const openPositions = {};
        
        tradeHistory.forEach(trade => {
            if (trade.action === 'buy') {
                if (openPositions[trade.symbol]) {
                    openPositions[trade.symbol].quantity += trade.quantity;
                    openPositions[trade.symbol].cost += trade.quantity * trade.price;
                } else {
                    openPositions[trade.symbol] = {
                        symbol: trade.symbol,
                        name: trade.name,
                        quantity: trade.quantity,
                        cost: trade.quantity * trade.price,
                        currentPrice: 0,
                        profitLoss: 0
                    };
                }
            } else if (trade.action === 'sell') {
                if (openPositions[trade.symbol]) {
                    openPositions[trade.symbol].quantity -= trade.quantity;
                    openPositions[trade.symbol].cost -= trade.quantity * trade.price;
                    if (openPositions[trade.symbol].quantity <= 0) {
                        delete openPositions[trade.symbol];
                    }
                }
            }
        });
        
        positionsList.innerHTML = '';
        let totalPortfolioValue = 0;
        let totalProfitLoss = 0;
        let positionCount = 0;

        for (const symbol in openPositions) {
            const position = openPositions[symbol];
            positionCount++;

            const currentMarket = findMarketBySymbol(symbol);
            if (currentMarket) {
                position.currentPrice = currentMarket.price;
                position.currentValue = position.quantity * position.currentPrice;
                position.profitLoss = position.currentValue - position.cost;
                position.profitLossPercent = (position.profitLoss / position.cost) * 100;

                const profitLossClass = position.profitLoss >= 0 ? 'positive' : 'negative';
                const profitLossSign = position.profitLoss >= 0 ? '+' : '';
                
                totalPortfolioValue += position.currentValue;
                totalProfitLoss += position.profitLoss;

                const positionHtml = `
                    <div class="position-card">
                        <div class="position-info">
                            <h3>${position.name} (${position.symbol})</h3>
                            <p>Quantity: ${position.quantity}</p>
                        </div>
                        <div class="position-details">
                            <div class="detail-item">
                                <span class="detail-label">Current Price</span>
                                <span class="detail-value">$${position.currentPrice.toFixed(2)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">P/L ($)</span>
                                <span class="detail-value ${profitLossClass}">${profitLossSign}$${position.profitLoss.toFixed(2)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">P/L (%)</span>
                                <span class="detail-value ${profitLossClass}">${profitLossSign}${position.profitLossPercent.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                `;
                positionsList.insertAdjacentHTML('beforeend', positionHtml);
            }
        }
        
        if (positionCount === 0) {
            positionsList.innerHTML = '<p class="no-positions">You have no open positions.</p>';
        }

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
