document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    const action = urlParams.get('action');
    
    const tradeTitle = document.getElementById('tradeTitle');
    const tradePriceElement = document.getElementById('tradePrice');
    const tradeChangeElement = document.getElementById('tradeChange');
    const tradeChartCanvas = document.getElementById('tradeChart');
    const tradeForm = document.getElementById('tradeForm');
    const quantityInput = document.getElementById('quantity');
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    const messageBox = document.getElementById('messageBox');

    let currentMarket = null;
    let priceChart = null;
    let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};

    // Check for login status and render the correct nav bar
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // New function for consistent pricing
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
        // Ensure price is up-to-date
        if (market) {
            if (!market.dailyChange) {
                 market.dailyChange = getDailyPriceChange(market.basePrice);
            }
            market.price = getConsistentPrice(market.basePrice, market.dailyChange);
            market.change = ((market.price - market.basePrice) / market.basePrice) * 100;
        }
        return market;
    }

    function updateChart(newPrice, time) {
        if (priceChart) {
            const timeLabel = new Date(time).toLocaleTimeString();
            priceChart.data.labels.push(timeLabel);
            priceChart.data.datasets[0].data.push(newPrice);
            
            // Limit the number of data points for performance
            const maxPoints = 20;
            if (priceChart.data.labels.length > maxPoints) {
                priceChart.data.labels.shift();
                priceChart.data.datasets[0].data.shift();
            }

            priceChart.update();
        }
    }

    function createChart(data) {
        if (priceChart) {
            priceChart.destroy();
        }

        const ctx = tradeChartCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(point => new Date(point.timestamp).toLocaleTimeString()),
                datasets: [{
                    label: 'Price',
                    data: data.map(point => point.price),
                    borderColor: 'var(--positive-color)',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'var(--text-secondary)' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function updatePrice() {
        if (currentMarket) {
            const marketData = findMarketBySymbol(currentMarket.symbol);
            if (marketData) {
                currentMarket.price = marketData.price;
                currentMarket.change = marketData.change;
                tradePriceElement.textContent = `$${currentMarket.price.toFixed(2)}`;
                const changeClass = currentMarket.change >= 0 ? 'positive' : 'negative';
                const changeSign = currentMarket.change >= 0 ? '+' : '';
                tradeChangeElement.textContent = `${changeSign}${currentMarket.change.toFixed(2)}%`;
                tradeChangeElement.className = `trade-change ${changeClass}`;

                // Update chart
                const newPoint = { price: currentMarket.price, timestamp: Date.now() };
                if (!priceHistory[currentMarket.symbol]) {
                    priceHistory[currentMarket.symbol] = [];
                }
                priceHistory[currentMarket.symbol].push(newPoint);
                localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
                updateChart(newPoint.price, newPoint.timestamp);
            }
        }
    }

    function renderTradePage() {
        currentMarket = findMarketBySymbol(symbol);
        if (!currentMarket) {
            tradeTitle.textContent = 'Market not found.';
            return;
        }

        tradeTitle.textContent = `${currentMarket.name} (${currentMarket.symbol})`;
        tradePriceElement.textContent = `$${currentMarket.price.toFixed(2)}`;
        const changeClass = currentMarket.change >= 0 ? 'positive' : 'negative';
        const changeSign = currentMarket.change >= 0 ? '+' : '';
        tradeChangeElement.textContent = `${changeSign}${currentMarket.change.toFixed(2)}%`;
        tradeChangeElement.className = `trade-change ${changeClass}`;

        if (!priceHistory[currentMarket.symbol]) {
            priceHistory[currentMarket.symbol] = [{ price: currentMarket.price, timestamp: Date.now() }];
            localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        }
        createChart(priceHistory[currentMarket.symbol]);
    }

    tradeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!currentMarket) {
            showMessage('Error: Market not found.', 'error');
            return;
        }

        const quantity = parseInt(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            showMessage('Quantity must be a positive number.', 'error');
            return;
        }

        // Get the action from the buttons
        const tradeAction = event.submitter.id === 'buyBtn' ? 'buy' : 'sell';

        // Retrieve existing trades or initialize an empty array
        let trades = JSON.parse(localStorage.getItem('tradeHistory')) || [];
        
        // Create a new trade object
        const newTrade = {
            id: Date.now(),
            symbol: currentMarket.symbol,
            name: currentMarket.name,
            action: tradeAction,
            quantity: quantity,
            price: currentMarket.price,
            timestamp: new Date().toISOString()
        };

        // Add the new trade to the array and save to localStorage
        trades.unshift(newTrade);
        localStorage.setItem('tradeHistory', JSON.stringify(trades));

        showMessage(`Successfully placed a ${tradeAction} order for ${quantity} units of ${currentMarket.symbol}!`, 'success');

        // Optional: redirect to dashboard after a delay
        setTimeout(() => {
            window.location.href = 'dsh.html';
        }, 1500);
    });

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box show ${type}`;
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000);
    }

    renderTradePage();
    setInterval(updatePrice, 10000); // Update price and chart every 10 seconds
});
