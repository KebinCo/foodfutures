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
        { id: 1, symbol: 'WHEAT', name: 'Wheat', category: 'grains', basePrice: 7.25, dailyChange: 0 },
        { id: 2, symbol: 'CORN', name: 'Corn', category: 'grains', basePrice: 5.80, dailyChange: 0 },
        { id: 3, symbol: 'SOYBEAN', name: 'Soybean', category: 'grains', basePrice: 13.50, dailyChange: 0 },
        { id: 4, symbol: 'RICE', name: 'Rice', category: 'grains', basePrice: 15.10, dailyChange: 0 },
        { id: 5, symbol: 'OATS', name: 'Oats', category: 'grains', basePrice: 3.90, dailyChange: 0 },
        { id: 6, symbol: 'BEEF', name: 'Beef', category: 'livestock', basePrice: 1.85, dailyChange: 0 },
        { id: 7, symbol: 'PORK', name: 'Pork', category: 'livestock', basePrice: 1.10, dailyChange: 0 },
        { id: 8, symbol: 'CHICKEN', name: 'Chicken', category: 'livestock', basePrice: 0.95, dailyChange: 0 },
        { id: 9, symbol: 'SUGAR', name: 'Sugar', category: 'softs', basePrice: 0.18, dailyChange: 0 },
        { id: 10, symbol: 'COFFEE', name: 'Coffee', category: 'softs', basePrice: 2.15, dailyChange: 0 },
        { id: 11, symbol: 'COCOA', name: 'Cocoa', category: 'softs', basePrice: 2.50, dailyChange: 0 },
        { id: 12, symbol: 'ORANGE', name: 'Orange Juice', category: 'softs', basePrice: 1.70, dailyChange: 0 },
        { id: 13, symbol: 'DAIRY', name: 'Dairy', category: 'dairy', basePrice: 1.55, dailyChange: 0 },
        { id: 14, symbol: 'LUMBER', name: 'Lumber', category: 'other', basePrice: 450.00, dailyChange: 0 },
        { id: 15, symbol: 'COTTON', name: 'Cotton', category: 'softs', basePrice: 0.85, dailyChange: 0 }
    ];

    let filteredMarkets = [...marketData];
    const marketGrid = document.getElementById('marketGrid');

    // New function for consistent pricing
    function getDailyPriceChange(basePrice) {
        // Generate a consistent daily change based on the day
        const today = new Date().toDateString();
        const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dailyFactor = (Math.sin(hash) + 1) / 2; // Value between 0 and 1
        const dailyChange = (dailyFactor - 0.5) * 0.10; // -5% to +5%
        return basePrice * dailyChange;
    }

    function getConsistentPrice(basePrice, dailyChange) {
        const now = Date.now();
        const secondsInDay = 24 * 60 * 60;
        const timeFactor = (now / 1000) % secondsInDay;
        const volatility = dailyChange / (secondsInDay / 2);
        return basePrice + (volatility * timeFactor) + dailyChange;
    }

    function updateMarketPrices() {
        marketData.forEach(market => {
            if (market.dailyChange === 0) {
                market.dailyChange = getDailyPriceChange(market.basePrice);
            }
            market.price = getConsistentPrice(market.basePrice, market.dailyChange);
            market.change = ((market.price - market.basePrice) / market.basePrice) * 100;
        });

        localStorage.setItem('marketData', JSON.stringify(marketData));
        renderMarkets();
    }

    function renderMarkets() {
        marketGrid.innerHTML = ''; // Clear previous cards
        if (filteredMarkets.length === 0) {
            marketGrid.innerHTML = '<p class="no-results">No markets found for this search/filter.</p>';
        }

        filteredMarkets.forEach(market => {
            const changeClass = market.change >= 0 ? 'positive' : 'negative';
            const changeSign = market.change >= 0 ? '+' : '';
            const cardHtml = `
                <div class="market-card" data-symbol="${market.symbol}" onclick="location.href='trade.html?symbol=${market.symbol}'">
                    <div class="market-info">
                        <span class="market-symbol">${market.symbol}</span>
                        <span class="market-name">${market.name}</span>
                        <span class="market-category">${market.category}</span>
                    </div>
                    <div class="market-price-details">
                        <span class="market-price">$${market.price.toFixed(2)}</span>
                        <span class="market-change ${changeClass}">${changeSign}${market.change.toFixed(2)}%</span>
                    </div>
                </div>
            `;
            marketGrid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function filterMarkets(category) {
        filteredMarkets = category === 'all' ? [...marketData] : marketData.filter(market => market.category === category);
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
