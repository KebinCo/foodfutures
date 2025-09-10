document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    
    const tradeTitle = document.getElementById('tradeTitle');
    const tradePriceElement = document.getElementById('tradePrice');
    const tradeChangeElement = document.getElementById('tradeChange');
    const tradeChartCanvas = document.getElementById('tradeChart');
    const tradeForm = document.getElementById('tradeForm');
    const quantityInput = document.getElementById('quantity');
    const messageBox = document.getElementById('messageBox');
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');

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

    function renderTradePage() {
        // Read the latest market data from localStorage
        const marketData = JSON.parse(localStorage.getItem('marketData')) || [];
        currentMarket = marketData.find(market => market.symbol === symbol);

        if (!currentMarket) {
            tradeTitle.textContent = 'Market Not Found';
            showMessage('The selected market could not be found.', 'error');
            return;
        }

        tradeTitle.textContent = currentMarket.name;
        tradePriceElement.textContent = `$${currentMarket.price.toFixed(2)}`;
        
        const changeClass = currentMarket.change >= 0 ? 'positive' : 'negative';
        const changeSign = currentMarket.change >= 0 ? '+' : '';
        tradeChangeElement.textContent = `${changeSign}${currentMarket.changePercent.toFixed(2)}%`;
        tradeChangeElement.className = `trade-change ${changeClass}`;

        // Update the price history for the chart
        if (!priceHistory[symbol]) {
            priceHistory[symbol] = [];
        }
        
        // Add the new price point to the history
        priceHistory[symbol].push(currentMarket.price.toFixed(2));
        // Keep the history at a reasonable length (e.g., last 20 points)
        if (priceHistory[symbol].length > 20) {
            priceHistory[symbol].shift();
        }
        
        // Save the updated history to localStorage
        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));

        // Update the chart
        if (priceChart) {
            priceChart.data.labels = priceHistory[symbol].map((_, i) => i);
            priceChart.data.datasets[0].data = priceHistory[symbol];
            priceChart.update();
        } else {
            initChart();
        }
    }

    function initChart() {
        if (!priceHistory[symbol] || priceHistory[symbol].length === 0) {
            // Initialize with the current price if history is empty
            priceHistory[symbol] = [currentMarket.price.toFixed(2)];
        }

        const ctx = tradeChartCanvas.getContext('2d');
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: priceHistory[symbol].map((_, i) => i + 1),
                datasets: [{
                    label: 'Price',
                    data: priceHistory[symbol],
                    borderColor: 'rgba(0, 255, 136, 1)',
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    tradeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const quantity = parseFloat(quantityInput.value);

        if (isNaN(quantity) || quantity <= 0) {
            showMessage('Quantity must be a positive number.', 'error');
            return;
        }

        // Get the action from the buttons
        const tradeAction = event.submitter.id === 'buyBtn' ? 'buy' : 'sell';
        
        // Retrieve the latest market data from localStorage before placing a trade
        const marketData = JSON.parse(localStorage.getItem('marketData')) || [];
        const currentMarketForTrade = marketData.find(m => m.symbol === symbol);

        if (!currentMarketForTrade) {
            showMessage('Could not find market data. Please try again.', 'error');
            return;
        }

        // Retrieve existing trades or initialize an empty array
        let trades = JSON.parse(localStorage.getItem('tradeHistory')) || [];
        
        // Create a new trade object
        const newTrade = {
            id: Date.now(),
            symbol: currentMarketForTrade.symbol,
            name: currentMarketForTrade.name,
            action: tradeAction,
            quantity: quantity,
            price: currentMarketForTrade.price,
            timestamp: new Date().toISOString()
        };

        // Add the new trade to the array and save to localStorage
        trades.unshift(newTrade);
        localStorage.setItem('tradeHistory', JSON.stringify(trades));

        showMessage(`Successfully placed a ${tradeAction} order for ${quantity} units of ${currentMarketForTrade.symbol}!`, 'success');

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
    
    // Initial render and set up a refresh interval to sync with markets
    renderTradePage();
    setInterval(renderTradePage, 5000); // Refresh every 5 seconds to sync with markets page
});
