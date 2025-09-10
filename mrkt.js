document.addEventListener('DOMContentLoaded', () => {
    // Check for login status and render the correct nav bar
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // New, more extensive market data
    let marketData = JSON.parse(localStorage.getItem('marketData')) || [
        { id: 1, symbol: 'WHEAT', name: 'Wheat', category: 'grains', basePrice: 7.25, volatility: 0.15 },
        { id: 2, symbol: 'CORN', name: 'Corn', category: 'grains', basePrice: 5.80, volatility: 0.12 },
        { id: 3, symbol: 'SOYBEAN', name: 'Soybean', category: 'grains', basePrice: 13.50, volatility: 0.18 },
        { id: 4, symbol: 'RICE', name: 'Rice', category: 'grains', basePrice: 15.10, volatility: 0.10 },
        { id: 5, symbol: 'OATS', name: 'Oats', category: 'grains', basePrice: 3.90, volatility: 0.08 },
        { id: 6, symbol: 'BEEF', name: 'Beef', category: 'livestock', basePrice: 1.85, volatility: 0.25 },
        { id: 7, symbol: 'PORK', name: 'Pork', category: 'livestock', basePrice: 1.20, volatility: 0.20 },
        { id: 8, symbol: 'CHICKEN', name: 'Chicken', category: 'livestock', basePrice: 0.95, volatility: 0.18 },
        { id: 9, symbol: 'SUGAR', name: 'Sugar', category: 'softs', basePrice: 0.19, volatility: 0.30 },
        { id: 10, symbol: 'COFFEE', name: 'Coffee', category: 'softs', basePrice: 2.15, volatility: 0.22 },
        { id: 11, symbol: 'COCOA', name: 'Cocoa', category: 'softs', basePrice: 2.80, volatility: 0.28 },
        { id: 12, symbol: 'COTTON', name: 'Cotton', category: 'softs', basePrice: 0.85, volatility: 0.17 },
        { id: 13, symbol: 'ORANGE_JUICE', name: 'Orange Juice', category: 'softs', basePrice: 1.60, volatility: 0.20 },
        { id: 14, symbol: 'MILK', name: 'Milk', category: 'dairy', basePrice: 0.35, volatility: 0.14 },
        { id: 15, symbol: 'CHEESE', name: 'Cheese', category: 'dairy', basePrice: 2.50, volatility: 0.16 }
    ];

    let filteredMarkets = [...marketData];

    // Function to calculate a consistent price based on time
    function getCyclicalPrice(basePrice, volatility, durationMinutes = 30) {
        const now = Date.now();
        const cycleDuration = durationMinutes * 60 * 1000;
        const phase = (now % cycleDuration) / cycleDuration;
        const fluctuation = Math.sin(phase * 2 * Math.PI) * volatility;
        return basePrice * (1 + fluctuation);
    }

    // Function to update market prices and save to localStorage
    function updateMarketPrices() {
        const updatedMarkets = marketData.map(market => {
            const oldPrice = market.price || market.basePrice;
            const newPrice = getCyclicalPrice(market.basePrice, market.volatility);
            const change = ((newPrice - oldPrice) / oldPrice) * 100;
            return {
                ...market,
                price: newPrice,
                change: change,
                lastUpdated: Date.now()
            };
        });
        
        marketData = updatedMarkets;
        localStorage.setItem('marketData', JSON.stringify(marketData));
        renderMarkets();
    }

    // Function to render all market cards
    function renderMarkets() {
        const marketGrid = document.getElementById('marketGrid');
        marketGrid.innerHTML = '';
        
        filteredMarkets.forEach(market => {
            const changeClass = market.change >= 0 ? 'positive' : 'negative';
            const card = `
                <div class="market-card" data-category="${market.category}" data-symbol="${market.symbol}">
                    <div class="market-info">
                        <span class="market-symbol">${market.symbol}</span>
                        <span class="market-name">${market.name}</span>
                        <span class="market-category status-badge">${market.category}</span>
                    </div>
                    <div class="market-price-details">
                        <span class="market-price">$${market.price.toFixed(2)}</span>
                        <span class="market-change ${changeClass}">${market.change >= 0 ? '+' : ''}${market.change.toFixed(2)}%</span>
                    </div>
                    <div class="market-actions">
                        <a href="trade.html?symbol=${market.symbol}&action=buy" class="trade-btn buy-btn">BUY</a>
                        <a href="trade.html?symbol=${market.symbol}&action=sell" class="trade-btn sell-btn">SELL</a>
                    </div>
                </div>
            `;
            marketGrid.insertAdjacentHTML('beforeend', card);
        });
    }

    // Filter and sort functions
    function filterMarkets(category) {
        if (category === 'all') {
            filteredMarkets = [...marketData];
        } else {
            filteredMarkets = marketData.filter(market => market.category === category);
        }
        renderMarkets();
    }

    function sortMarkets(value) {
        switch (value) {
            case 'name-asc':
                filteredMarkets.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-desc':
                filteredMarkets.sort((a, b) => b.price - a.price);
                break;
            case 'change-desc':
                filteredMarkets.sort((a, b) => b.change - a.change);
                break;
        }
        renderMarkets();
    }

    function searchMarkets(query) {
        filteredMarkets = marketData.filter(market => 
            market.name.toLowerCase().includes(query.toLowerCase()) || 
            market.symbol.toLowerCase().includes(query.toLowerCase())
        );
        renderMarkets();
    }

    // Initialize and start price updates
    updateMarketPrices();
    setInterval(updateMarketPrices, 10000); // Update every 10 seconds

    // Event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMarkets(this.dataset.category);
        });
    });

    document.getElementById('sortSelect').addEventListener('change', function() {
        sortMarkets(this.value);
    });

    document.getElementById('searchInput').addEventListener('input', function() {
        searchMarkets(this.value);
    });
});
