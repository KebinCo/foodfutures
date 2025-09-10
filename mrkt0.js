document.addEventListener('DOMContentLoaded', () => {
    // Sample market data
    const marketData = [
        { symbol: 'BEEF-US-MAR26', name: 'US Beef Futures', category: 'livestock', price: 0.73, change: 8.2, featured: true },
        { symbol: 'WHEAT-US-SEP26', name: 'Wheat Futures', category: 'grains', price: 0.52, change: -1.4, featured: true },
        { symbol: 'CORN-US-JUN26', name: 'Corn Price Index', category: 'grains', price: 0.45, change: -3.1, featured: false },
        { symbol: 'SOY-BR-MAY26', name: 'Brazilian Soy Futures', category: 'grains', price: 0.98, change: 0.5, featured: false },
        { symbol: 'SUGAR-AU-JUL26', name: 'Australian Sugar', category: 'softs', price: 0.34, change: 1.2, featured: false },
        { symbol: 'COFFEE-BR-DEC26', name: 'Brazilian Coffee', category: 'softs', price: 1.21, change: -0.9, featured: false },
        { symbol: 'PORK-US-AUG26', name: 'US Pork Futures', category: 'livestock', price: 0.65, change: 5.4, featured: false },
        { symbol: 'COTTON-IN-OCT26', name: 'Indian Cotton', category: 'softs', price: 0.88, change: 2.3, featured: false }
    ];

    const featuredMarketsContainer = document.getElementById('featuredMarkets');
    const allMarketsTableBody = document.getElementById('allMarketsTable');
    let currentMarkets = [...marketData];

    // Function to render featured markets
    function renderFeaturedMarkets() {
        featuredMarketsContainer.innerHTML = '';
        const featured = currentMarkets.filter(market => market.featured);
        featured.forEach(market => {
            const changeClass = market.change >= 0 ? 'positive' : 'negative';
            const html = `
                <div class="market-card">
                    <div class="market-card-header">
                        <h4>${market.symbol}</h4>
                        <span class="status-badge success">Live</span>
                    </div>
                    <p class="market-card-info">${market.name}</p>
                    <div class="market-card-details">
                        <span class="market-card-price">$${market.price.toFixed(2)}</span>
                        <span class="market-card-change ${changeClass}">${market.change >= 0 ? '+' : ''}${market.change.toFixed(1)}%</span>
                    </div>
                </div>
            `;
            featuredMarketsContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    // Function to render all markets table
    function renderAllMarkets() {
        allMarketsTableBody.innerHTML = '';
        currentMarkets.forEach(market => {
            const changeClass = market.change >= 0 ? 'positive' : 'negative';
            const html = `
                <tr>
                    <td>
                        <div class="market-info">
                            <span class="market-symbol">${market.symbol}</span>
                            <span class="market-name">${market.name}</span>
                        </div>
                    </td>
                    <td class="market-price-col">$${market.price.toFixed(2)}</td>
                    <td class="market-change-col ${changeClass}">${market.change >= 0 ? '+' : ''}${market.change.toFixed(1)}%</td>
                    <td>
                        <div class="market-actions">
                            <button class="action-btn buy" onclick="openTradeModal('${market.symbol}', 'buy')">Buy</button>
                            <button class="action-btn" onclick="viewMarketDetails('${market.symbol}')">Details</button>
                        </div>
                    </td>
                </tr>
            `;
            allMarketsTableBody.insertAdjacentHTML('beforeend', html);
        });
    }

    // Function to filter markets by category
    function filterByCategory(category) {
        if (category === 'all') {
            currentMarkets = [...marketData];
        } else {
            currentMarkets = marketData.filter(market => market.category === category);
        }
        renderAllMarkets();
    }

    // Function to sort markets
    function sortMarkets(by) {
        if (by === 'price_asc') {
            currentMarkets.sort((a, b) => a.price - b.price);
        } else if (by === 'price_desc') {
            currentMarkets.sort((a, b) => b.price - a.price);
        } else if (by === 'change_asc') {
            currentMarkets.sort((a, b) => a.change - b.change);
        } else if (by === 'change_desc') {
            currentMarkets.sort((a, b) => b.change - a.change);
        }
        renderAllMarkets();
    }

    // Function to search markets
    function searchMarkets(query) {
        const lowerCaseQuery = query.toLowerCase();
        currentMarkets = marketData.filter(market => 
            market.symbol.toLowerCase().includes(lowerCaseQuery) ||
            market.name.toLowerCase().includes(lowerCaseQuery)
        );
        renderAllMarkets();
    }

    // Initial render
    renderFeaturedMarkets();
    renderAllMarkets();

    // Event listeners
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterByCategory(this.dataset.category);
        });
    });

    // Sort select
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortMarkets(this.value);
    });

    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        searchMarkets(this.value);
    });

    // Open trade modal (placeholder function)
    function openTradeModal(symbol, action) {
        alert(`${action.toUpperCase()} ${symbol} - Trading interface coming soon!`);
    }

    // View market details (placeholder function)
    function viewMarketDetails(symbol) {
        alert(`Viewing details for ${symbol} - Detailed view coming soon!`);
    }

    // Update market prices (simulate real-time updates)
    function updateMarketPrices() {
        marketData.forEach(market => {
            const variation = (Math.random() - 0.5) * 0.1;
            const oldPrice = market.price;
            market.price = Math.max(0.1, market.price + variation);
            market.change = ((market.price - oldPrice) / oldPrice) * 100;
        });
        
        renderFeaturedMarkets();
        renderAllMarkets();
    }

    // Start price updates
    setInterval(updateMarketPrices, 8000);
});
