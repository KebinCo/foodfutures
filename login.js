document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const demoButtons = document.querySelectorAll('.demo-btn');
    const authButton = document.querySelector('.auth-button');
    const buttonText = document.querySelector('.button-text');
    const buttonLoader = document.querySelector('.button-loader');
    const marketPrices = document.querySelectorAll('.market-price');

    // Cursor glow effect
    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.cursor-glow');
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Password visibility toggle
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // Form submission handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show loader, hide text
        buttonText.classList.add('hidden');
        buttonLoader.classList.remove('hidden');

        // Simulate form submission delay
        setTimeout(() => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // A simple validation for a successful login
            if (email && password) {
                // Store user login info in localStorage (in a real app, this would be a secure token)
                const newUser = {
                    email: email,
                    firstName: email.split('@')[0]
                };
                localStorage.setItem('newUser', JSON.stringify(newUser));
                window.location.href = 'trdngdshbrd.html';
            } else {
                alert('Please enter a valid email and password.');
                buttonText.classList.remove('hidden');
                buttonLoader.classList.add('hidden');
            }
        }, 1500);
    });

    // Demo login handler
    demoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const role = e.currentTarget.dataset.role;
            const demoAccount = {
                role: role
            };
            localStorage.setItem('demoAccount', JSON.stringify(demoAccount));
            window.location.href = 'trdngdshbrd.html';
        });
    });

    // Live market data update simulation
    function updateMarketPrices() {
        marketPrices.forEach(priceElement => {
            const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
            const variation = (Math.random() - 0.5) * 0.1;
            const newPrice = Math.max(0.1, currentPrice + variation);
            
            priceElement.textContent = `$${newPrice.toFixed(2)}`;
            
            const changeElement = priceElement.nextElementSibling;
            const change = ((newPrice - currentPrice) / currentPrice * 100);
            changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
            changeElement.className = `market-change ${change >= 0 ? 'positive' : 'negative'}`;
        });
    }

    // Start updating prices every 4 seconds
    setInterval(updateMarketPrices, 4000);
});
