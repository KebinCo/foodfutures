// Market data structure
const FUTURES = {
    'GRAIN-1W': { name: 'Grain (1 Week)', basePrice: 245, volatility: 2.5 },
    'WHEAT-1W': { name: 'Wheat (1 Week)', basePrice: 310, volatility: 3.0 },
    'CORN-1W': { name: 'Corn (1 Week)', basePrice: 189, volatility: 2.8 },
    'RICE-1W': { name: 'Rice (1 Week)', basePrice: 425, volatility: 2.2 },
    'PORK-1W': { name: 'Pork (1 Week)', basePrice: 890, volatility: 4.5 },
    'BEEF-1W': { name: 'Beef (1 Week)', basePrice: 1250, volatility: 5.0 },
    'CHICKEN-1W': { name: 'Chicken (1 Week)', basePrice: 340, volatility: 3.8 },
    'MILK-1W': { name: 'Milk (1 Week)', basePrice: 78, volatility: 1.8 },
    'SUGAR-1W': { name: 'Sugar (1 Week)', basePrice: 165, volatility: 3.2 },
    'COFFEE-1W': { name: 'Coffee (1 Week)', basePrice: 520, volatility: 6.0 },
    'SOYBEAN-1W': { name: 'Soybean (1 Week)', basePrice: 395, volatility: 3.5 },
    'POTATO-1W': { name: 'Potato (1 Week)', basePrice: 145, volatility: 2.0 }
};

const NEWS_ITEMS = [
    "Breaking: Drought in midwest expected to impact grain yields by 15%",
    "New farming technology promises 20% increase in wheat production",
    "Consumer demand for pasta surges as restaurants reopen nationwide",
    "Pig shortage looms as African swine fever spreads in Asia",
    "Global coffee prices volatile amid climate concerns in Brazil",
    "Record corn harvest expected this quarter, analysts say",
    "Beef futures climb on strong export demand from China",
    "Chicken producers struggle with rising feed costs",
    "Milk prices stabilize after months of volatility",
    "Sugar demand spikes as beverage companies ramp up production",
    "Soybean tariffs lifted, market reacts positively",
    "Potato blight concerns in Europe affect global supply chains",
    "Major food processor announces shift to grain-based products",
    "Weather patterns favorable for rice cultivation in Southeast Asia",
    "Food inflation concerns drive investors to commodity futures",
    "Supply chain disruptions continue to affect pork availability",
    "Government subsidies for wheat farmers announced",
    "Alternative protein demand impacts traditional meat futures"
];

// User data (placeholder - get from URL params or localStorage)
let userData = {
    username: new URLSearchParams(window.location.search).get('user') || 'Guest',
    balance: parseFloat(localStorage.getItem('balance')) || 10000,
    holdings: JSON.parse(localStorage.getItem('holdings')) || {}
};

// Market state
let currentFuture = 'GRAIN-1W';
let priceHistory = [];
let chartCanvas, chartCtx;
const MAX_HISTORY = 60;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    initializeChart();
    initializeSearch();
    updatePriceHistory();
    startMarketSimulation();
    displayNews();
    updateHoldings();
    
    setInterval(updatePriceHistory, 1000);
    setInterval(displayNews, 15000);
    setInterval(updateTicker, 2000);
});

function initializeUser() {
    document.getElementById('username').textContent = userData.username;
    document.getElementById('balance').textContent = userData.balance.toFixed(2);
}

function initializeChart() {
    chartCanvas = document.getElementById('priceChart');
    chartCtx = chartCanvas.getContext('2d');
    chartCanvas.width = chartCanvas.offsetWidth;
    chartCanvas.height = 400;
}

function initializeSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchResults = document.getElementById('searchResults');
    
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toUpperCase();
        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const matches = Object.keys(FUTURES).filter(key => 
            key.includes(query) || FUTURES[key].name.toUpperCase().includes(query)
        );
        
        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(key => 
                `<div class="search-result" onclick="selectFuture('${key}')">${FUTURES[key].name} (${key})</div>`
            ).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    });
}

function selectFuture(futureKey) {
    currentFuture = futureKey;
    priceHistory = [];
    document.getElementById('selectedFuture').textContent = futureKey;
    document.getElementById('searchBar').value = '';
    document.getElementById('searchResults').style.display = 'none';
    updateEstCost();
}

function getCurrentPrice(futureKey = currentFuture) {
    const future = FUTURES[futureKey];
    if (!priceHistory.length) {
        return future.basePrice;
    }
    const lastDataPoint = priceHistory[priceHistory.length - 1];
    return lastDataPoint.prices[futureKey] || future.basePrice;
}

function updatePriceHistory() {
    const newPrices = {};
    
    Object.keys(FUTURES).forEach(key => {
        const future = FUTURES[key];
        const lastPrice = getCurrentPrice(key);
        
        // Market movement with volatility and trend
        const randomChange = (Math.random() - 0.5) * future.volatility;
        const trendFactor = (Math.random() - 0.48) * 0.5; // Slight upward bias
        const buyPressure = (key === currentFuture && Math.random() > 0.7) ? 0.3 : 0;
        
        newPrices[key] = Math.max(
            future.basePrice * 0.7,
            Math.min(
                future.basePrice * 1.3,
                lastPrice + randomChange + trendFactor + buyPressure
            )
        );
    });
    
    priceHistory.push({
        time: Date.now(),
        prices: newPrices
    });
    
    if (priceHistory.length > MAX_HISTORY) {
        priceHistory.shift();
    }
    
    updatePriceDisplay();
    drawChart();
}

function updatePriceDisplay() {
    const currentPrice = getCurrentPrice();
    const previousPrice = priceHistory.length > 1 
        ? priceHistory[priceHistory.length - 2].prices[currentFuture] 
        : currentPrice;
    
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    document.getElementById('currentPrice').textContent = currentPrice.toFixed(2);
    
    const changeEl = document.getElementById('priceChange');
    const sign = change >= 0 ? '+' : '';
    changeEl.textContent = `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
    changeEl.className = change >= 0 ? 'price-change up' : 'price-change down';
}

function drawChart() {
    if (!priceHistory.length) return;
    
    const ctx = chartCtx;
    const canvas = chartCanvas;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Get price range
    const prices = priceHistory.map(d => d.prices[currentFuture]);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;
    const priceRange = maxPrice - minPrice;
    
    // Draw grid
    ctx.strokeStyle = '#2a3f5f';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        const price = maxPrice - (priceRange / 4) * i;
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.fillText(`$${price.toFixed(2)}`, 5, y - 5);
    }
    
    // Draw price line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((price, i) => {
        const x = (width / (MAX_HISTORY - 1)) * i;
        const y = height - ((price - minPrice) / priceRange) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.fill();
}

function startMarketSimulation() {
    // Simulate market events
    setInterval(() => {
        if (Math.random() > 0.95) {
            const randomFuture = Object.keys(FUTURES)[Math.floor(Math.random() * Object.keys(FUTURES).length)];
            const shock = (Math.random() - 0.5) * 10;
            const lastPrice = getCurrentPrice(randomFuture);
            
            if (priceHistory.length > 0) {
                priceHistory[priceHistory.length - 1].prices[randomFuture] = lastPrice + shock;
            }
        }
    }, 3000);
}

function displayNews() {
    const newsBar = document.getElementById('newsBar');
    const randomNews = NEWS_ITEMS[Math.floor(Math.random() * NEWS_ITEMS.length)];
    newsBar.textContent = `📰 ${randomNews}`;
}

function updateTicker() {
    const ticker = document.getElementById('ticker');
    const tickerItems = Object.keys(FUTURES).map(key => {
        const price = getCurrentPrice(key);
        const change = Math.random() - 0.5;
        const className = change >= 0 ? 'up' : 'down';
        const sign = change >= 0 ? '▲' : '▼';
        return `<span class="ticker-item ${className}">${key}: $${price.toFixed(2)} ${sign}</span>`;
    });
    
    ticker.innerHTML = tickerItems.join('') + tickerItems.join('');
}

function updateEstCost() {
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const price = getCurrentPrice();
    document.getElementById('estCost').textContent = (quantity * price).toFixed(2);
}

document.getElementById('quantity').addEventListener('input', updateEstCost);

function executeTrade(action) {
    const quantity = parseFloat(document.getElementById('quantity').value);
    const price = getCurrentPrice();
    const cost = quantity * price;
    
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    if (action === 'buy') {
        if (cost > userData.balance) {
            alert('Insufficient balance');
            return;
        }
        
        userData.balance -= cost;
        
        if (!userData.holdings[currentFuture]) {
            userData.holdings[currentFuture] = { quantity: 0, avgPrice: 0 };
        }
        
        const holding = userData.holdings[currentFuture];
        holding.avgPrice = ((holding.avgPrice * holding.quantity) + (price * quantity)) / (holding.quantity + quantity);
        holding.quantity += quantity;
        
        // Slight price increase from buy pressure
        if (priceHistory.length > 0) {
            priceHistory[priceHistory.length - 1].prices[currentFuture] += 0.2;
        }
        
        alert(`Bought ${quantity}kg of ${currentFuture} at $${price.toFixed(2)}/kg`);
    } else {
        if (!userData.holdings[currentFuture] || userData.holdings[currentFuture].quantity < quantity) {
            alert('Insufficient holdings');
            return;
        }
        
        userData.balance += cost;
        userData.holdings[currentFuture].quantity -= quantity;
        
        if (userData.holdings[currentFuture].quantity === 0) {
            delete userData.holdings[currentFuture];
        }
        
        alert(`Sold ${quantity}kg of ${currentFuture} at $${price.toFixed(2)}/kg`);
    }
    
    saveUserData();
    updateHoldings();
    document.getElementById('balance').textContent = userData.balance.toFixed(2);
}

function updateHoldings() {
    const holdingsDiv = document.getElementById('holdings');
    
    if (Object.keys(userData.holdings).length === 0) {
        holdingsDiv.innerHTML = '<p style="color: #666;">No holdings</p>';
        return;
    }
    
    holdingsDiv.innerHTML = Object.keys(userData.holdings).map(key => {
        const holding = userData.holdings[key];
        const currentPrice = getCurrentPrice(key);
        const totalValue = holding.quantity * currentPrice;
        const totalCost = holding.quantity * holding.avgPrice;
        const profitLoss = totalValue - totalCost;
        const profitLossPercent = (profitLoss / totalCost) * 100;
        const className = profitLoss >= 0 ? '' : 'loss';
        
        return `
            <div class="holding-item ${className}">
                <div><strong>${key}</strong></div>
                <div>Quantity: ${holding.quantity}kg</div>
                <div>Avg Price: $${holding.avgPrice.toFixed(2)}</div>
                <div>Current: $${currentPrice.toFixed(2)}</div>
                <div style="color: ${profitLoss >= 0 ? '#00ff88' : '#ff4444'}">
                    P/L: $${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(2)}%)
                </div>
            </div>
        `;
    }).join('');
}

function saveUserData() {
    localStorage.setItem('balance', userData.balance.toString());
    localStorage.setItem('holdings', JSON.stringify(userData.holdings));
}

// Expose prices for other pages
window.getFoodFuturesPrice = (futureKey) => getCurrentPrice(futureKey);
window.getAllFuturesPrices = () => {
    const prices = {};
    Object.keys(FUTURES).forEach(key => {
        prices[key] = getCurrentPrice(key);
    });
    return prices;
};
