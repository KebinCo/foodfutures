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

    // Function to calculate a consistent price based on time
    function getCyclicalPrice(basePrice, volatility, durationMinutes = 30) {
        const now = Date.now();
        const cycleDuration = durationMinutes * 60 * 1000;
        const phase = (now % cycleDuration) / cycleDuration;
        const fluctuation = Math.sin(phase * 2 * Math.PI) * volatility;
        return basePrice * (1 + fluctuation);
    }

    function renderTradePage() {
        const marketData = JSON.parse(localStorage.getItem('marketData'));
        currentMarket = marketData.find(m => m.symbol === symbol);

        if (!currentMarket) {
            tradeTitle.textContent = 'Market Not Found';
            tradePriceElement.textContent = '';
            tradeChangeElement.textContent = '';
            return;
        }

        tradeTitle.textContent = `${currentMarket.name} (${currentMarket.symbol})`;
        tradePriceElement.textContent = `$${currentMarket.price.toFixed(2)}`;
        const changeClass = currentMarket.change >= 0 ? 'positive' : 'negative';
        tradeChangeElement.textContent = `${currentMarket.change >= 0 ? '+' : ''}${currentMarket.change.toFixed(2)}%`;
        tradeChangeElement.className = `trade-change ${changeClass}`;
        
        // Set the active button based on the URL parameter
        if (action === 'buy') {
            buyBtn.classList.add('active');
            sellBtn.classList.remove('active');
        } else if (action === 'sell') {
            sellBtn.classList.add('active');
            buyBtn.classList.remove('active');
        }

        renderChart();
    }
    
    function updatePrice() {
        if (!currentMarket) return;
        
        const oldPrice = currentMarket.price;
        const newPrice = getCyclicalPrice(currentMarket.basePrice, currentMarket.volatility);
        const change = ((newPrice - oldPrice) / oldPrice) * 100;
        
        currentMarket.price = newPrice;
        currentMarket.change = change;

        tradePriceElement.textContent = `$${newPrice.toFixed(2)}`;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        tradeChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        tradeChangeElement.className = `trade-change ${changeClass}`;

        updateChartData(newPrice);
    }

    function renderChart() {
        if (!priceHistory[symbol]) {
            priceHistory[symbol] = [];
        }
        
        const labels = priceHistory[symbol].map((_, i) => i + 1);
        const data = priceHistory[symbol];
        
        if (priceChart) {
            priceChart.destroy();
        }
        
        priceChart = new Chart(tradeChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: data,
                    borderColor: 'rgba(0, 255, 136, 1)',
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0
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
                            drawBorder: false
                        },
                        ticks: {
                            color: 'white',
                            font: {
                                family: 'JetBrains Mono'
                            }
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
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateChartData(newPrice) {
        if (priceHistory[symbol].length >= 50) {
            priceHistory[symbol].shift();
        }
        priceHistory[symbol].push(newPrice);
        
        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        
        if (priceChart) {
            priceChart.data.labels = priceHistory[symbol].map((_, i) => i + 1);
            priceChart.data.datasets[0].data = priceHistory[symbol];
            priceChart.update();
        }
    }

    // Trade submission logic
    tradeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (!currentMarket) {
            showMessage('Market data is not available.', 'error');
            return;
        }

        const quantity = parseInt(quantityInput.value);
        if (quantity <= 0) {
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
