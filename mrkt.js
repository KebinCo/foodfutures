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
    // It will first check localStorage for existing data.
    // If not found, it initializes with a base set.
    let marketData = JSON.parse(localStorage.getItem('marketData')) || [
        { id: 1, symbol: 'WHEAT', name: 'Wheat', category: 'grains', basePrice: 7.25, volatility: 0.15 },
        { id: 2, symbol: 'CORN', name: 'Corn', category: 'grains', basePrice: 5.80, volatility: 0.12 },
        { id: 3, symbol: 'SOYBEAN', name: 'Soybean', category: 'grains', basePrice: 13.50, volatility: 0.18 },
        { id: 4, symbol: 'RICE', name: 'Rice', category: 'grains', basePrice: 15.10, volatility: 0.10 },
        { id: 5, symbol: 'OATS', name: 'Oats', category: 'grains', basePrice: 3.90, volatility: 0.08 },
        { id: 6, symbol: 'BEEF', name: 'Beef', category: 'livestock', basePrice: 1.85, volatility: 0.25 },
        { id: 7, symbol: 'PORK', name: 'Pork', category: 'livestock', basePrice: 1.20, volatility: 0.20 },
        { id: 8, symbol: 'CHICKEN', name: 'Chicken', category: 'livestock', basePrice: 2.10, volatility: 0.18 },
        { id: 9, symbol: 'SUGAR', name: 'Sugar', category: 'softs', basePrice: 0.15, volatility: 0.30 },
        { id: 10, symbol: 'COFFEE', name: 'Coffee', category: 'softs', basePrice: 1.65, volatility: 0.28 },
        { id: 11, symbol: 'COCOA', name: 'Cocoa', category: 'softs', basePrice: 2.50, volatility: 0.35 },
        { id: 12, symbol: 'ORANGEJUICE', name: 'Orange Juice', category: 'softs', basePrice: 2.70, volatility: 0.22 },
        { id: 13, symbol: 'COTTON', name: 'Cotton', category: 'softs', basePrice: 0.95, volatility: 0.16 },
        { id: 14, symbol: 'MILK', name: 'Milk', category: 'dairy', basePrice: 0.25, volatility: 0.05 },
        { id: 15, symbol: 'BUTTER', name: 'Butter', category: 'dairy', basePrice: 3.10, volatility: 0.12 },
    ];

    let filteredMarkets = [...marketData];
    const marketGrid = document.getElementById('marketGrid');

    // Function to calculate a consistent price based on a cyclical pattern
    function getCyclicalPrice(basePrice, volatility, durationMinutes = 30) {
        const now = Date.now();
        const cycleDuration = durationMinutes * 60 * 1000;
        const phase = (now % cycleDuration) / cycleDuration;
        const fluctuation = Math.sin(phase * 2 * Math.PI) * volatility;
        return basePrice * (1 + fluctuation);
    }

    // The core function that updates all market prices and saves to localStorage
    function updateMarketPrices() {
        marketData = marketData.map(market => {
            // Use the last known price or the base price for comparison
            const oldPrice = parseFloat(market.price) || market.basePrice;
            const newPrice = getCyclicalPrice(market.basePrice, market.volatility);
            const change = newPrice - oldPrice;
            const changePercent = (change / oldPrice) * 100;
            
            return {
                ...market,
                price: newPrice,
                change: change,
                changePercent: changePercent
            };
        });

        // Save the entire updated array back to localStorage
        localStorage.setItem('marketData', JSON.stringify(marketData));

        // Re-render the markets with the updated data
        renderMarkets();
    }

    // Renders the market cards based on the filtered data
    function renderMarkets() {
        marketGrid.innerHTML = ''; // Clear the grid before rendering
        if (filteredMarkets.length === 0) {
            marketGrid.innerHTML = '<p class="no-results">No markets found for the selected filter or search.</p>';
            return;
        }

        filteredMarkets.forEach(market => {
            const price = parseFloat(market.price);
            const change = parseFloat(market.change);
            const changePercent = parseFloat(market.changePercent);

            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSign = change >= 0 ? '+' : '';

            const marketCard = document.createElement('a');
            marketCard.href = `trade.html?symbol=${market.symbol}`;
            marketCard.className = 'market-card';
            marketCard.innerHTML = `
                <div class="market-info">
                    <span class="market-symbol">${market.symbol}</span>
                    <span class="market-name">${market.name}</span>
                    <span class="market-category">${market.category}</span>
                </div>
                <div class="market-price-details">
                    <span class="market-price">$${price.toFixed(2)}</span>
                    <span class="market-change ${changeClass}">${changeSign}${changePercent.toFixed(2)}%</span>
                </div>
            `;
            marketGrid.appendChild(marketCard);
        });
    }

    // Event handlers for filtering, sorting, and searching
    let currentCategory = 'all';

    function filterMarkets(category) {
        currentCategory = category;
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
                filteredMarkets.sort((a, b) => b.changePercent - a.changePercent);
                break;
        }
        renderMarkets();
    }

    function searchMarkets(query) {
        if (!query) {
            filterMarkets(currentCategory); // Re-apply current category filter if search is cleared
            return;
        }
        filteredMarkets = marketData.filter(market => 
            market.name.toLowerCase().includes(query.toLowerCase()) || 
            market.symbol.toLowerCase().includes(query.toLowerCase())
        );
        renderMarkets();
    }

    // Initialize and start price updates
    updateMarketPrices();
    setInterval(updateMarketPrices, 5000); // Update every 5 seconds to show faster synchronization

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
