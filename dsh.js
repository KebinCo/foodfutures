// Mock data for demo
const mockPositions = [
    {
        symbol: 'BEEF-US-MAR26',
        type: 'long',
        size: 5,
        entryPrice: 0.65,
        currentPrice: 0.73,
        pnl: 400
    },
    {
        symbol: 'CORN-US-JUN26',
        type: 'short',
        size: 3,
        entryPrice: 0.48,
        currentPrice: 0.45,
        pnl: 90
    },
    {
        symbol: 'TOMATO-CA-APR26',
        type: 'long',
        size: 2,
        entryPrice: 0.78,
        currentPrice: 0.89,
        pnl: 220
    },
    {
        symbol: 'WHEAT-US-SEP26',
        type: 'long',
        size: 4,
        entryPrice: 0.54,
        currentPrice: 0.52,
        pnl: -80
    },
    {
        symbol: 'RICE-US-DEC26',
        type: 'short',
        size: 6,
        entryPrice: 0.42,
        currentPrice: 0.39,
        pnl: 180
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    populatePositionsTable();
    generatePortfolioChart();
    startDataUpdates();
});

// Cursor glow effect
document.addEventListener('mousemove', (e) => {
    const glow = document.querySelector('.cursor-glow');
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// Load user data
function loadUserData() {
    const demoAccount = JSON.parse(localStorage.getItem('demoAccount'));
    const newUser = JSON.parse(localStorage.getItem('newUser'));
    
    let userName = 'Trader';
    if (newUser && newUser.firstName) {
        userName = newUser.firstName;
    } else if (demoAccount) {
        userName = demoAccount.role === 'beginner' ? 'Beginner Trader' : 'Pro Trader';
    }
    
    document.getElementById('userName').textContent = userName;
    
    // Set portfolio values based on account type
    if (demoAccount) {
        if (demoAccount.role === 'beginner') {
            document.getElementById('totalValue').textContent = '$1,847';
            document.getElementById('totalPnL').textContent = '+$847';
            document.getElementById('dailyPnL').textContent = '+$67';
            document.getElementById('openPositions').textContent = '5';
        } else {
            document.getElementById('totalValue').textContent = '$28,450';
            document.getElementById('totalPnL').textContent = '+$3,450';
            document.getElementById('dailyPnL').textContent = '+$287';
            document.getElementById('openPositions').textContent = '12';
        }
    }
}

// Populate positions table
function populatePositionsTable() {
    const tableBody = document.getElementById('positionsTable');
    tableBody.innerHTML = '';

    mockPositions.forEach(position => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="position-symbol">${position.symbol}</span></td>
            <td><span class="position-type ${position.type}">${position.type.toUpperCase()}</span></td>
            <td>${position.size}</td>
            <td>${position.entryPrice.toFixed(2)}</td>
            <td>${position.currentPrice.toFixed(2)}</td>
            <td><span class="position-pnl ${position.pnl >= 0 ? 'positive' : 'negative'}">
                ${position.pnl >= 0 ? '+' : ''}${position.pnl}</span></td>
            <td>
                <button class="action-btn" onclick="closePosition('${position.symbol}')">Close</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate portfolio chart
function generatePortfolioChart() {
    const chartContainer = document.getElementById('portfolioChart');
    const dataPoints = 30;
    
    for (let i = 0; i < dataPoints; i++) {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        const height = Math.random() * 60 + 20; // Random height between 20-80%
        bar.style.setProperty('--height', height + '%');
        bar.style.height = height + '%';
        chartContainer.appendChild(bar);
    }
}

// Mobile sidebar toggle
document.getElementById('mobileToggle').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
});

// Language toggle
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Sidebar navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
        }
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Close position function
function closePosition(symbol) {
    if (confirm(`Are you sure you want to close your ${symbol} position?`)) {
        // Remove position from mock data
        const index = mockPositions.findIndex(pos => pos.symbol === symbol);
        if (index > -1) {
            mockPositions.splice(index, 1);
            populatePositionsTable();
            
            // Update open positions count
            const openPositionsElement = document.getElementById('openPositions');
            const currentCount = parseInt(openPositionsElement.textContent);
            openPositionsElement.textContent = (currentCount - 1).toString();
        }
    }
}

// Update market prices
function updateMarketPrices() {
    document.querySelectorAll('.summary-price').forEach(priceElement => {
        const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
        const variation = (Math.random() - 0.5) * 0.05; // Smaller variations
        const newPrice = Math.max(0.1, currentPrice + variation);
        
        priceElement.textContent = `${newPrice.toFixed(2)}`;
        
        // Update change indicator
        const changeElement = priceElement.nextElementSibling;
        const change = ((newPrice - currentPrice) / currentPrice * 100);
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = `summary-change ${change >= 0 ? 'positive' : 'negative'}`;
    });

    // Update positions table prices
    mockPositions.forEach((position, index) => {
        const variation = (Math.random() - 0.5) * 0.03;
        position.currentPrice = Math.max(0.1, position.currentPrice + variation);
        
        // Recalculate P&L
        const priceDiff = position.currentPrice - position.entryPrice;
        const multiplier = position.type === 'long' ? 1 : -1;
        position.pnl = Math.round(priceDiff * multiplier * position.size * 100);
    });
    
    populatePositionsTable();
}

// Start regular data updates
function startDataUpdates() {
    setInterval(updateMarketPrices, 5000); // Update every 5 seconds
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('demoAccount');
        localStorage.removeItem('newUser');
        window.location.href = 'index.html';
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !mobileToggle.contains(e.target) && 
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});
