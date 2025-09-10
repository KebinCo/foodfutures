document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const accountTypeButtons = document.querySelectorAll('.account-type');
    
    // Cursor glow effect
    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.cursor-glow');
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Animate chart bars on page load
    function animateChart() {
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                const height = Math.random() * 80 + 20; // Random height between 20% and 100%
                bar.style.height = height + '%';
            }, index * 50);
        });
    }
    animateChart();
    
    // Animate chart every 5 seconds
    setInterval(animateChart, 5000);

    // Account type selection
    accountTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            accountTypeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    // Form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.auth-button');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoader = submitBtn.querySelector('.button-loader');
        
        // Show loading state
        submitBtn.disabled = true;
        buttonText.classList.add('hidden');
        buttonLoader.classList.remove('hidden');
        
        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            accountType: document.querySelector('.account-type.selected').dataset.type,
            signupTime: new Date().toISOString()
        };
        
        // Store user data in localStorage
        localStorage.setItem('newUser', JSON.stringify(formData));
        
        // Simulate signup process
        setTimeout(() => {
            // Redirect to dashboard
            window.location.href = 'trdngdshbrd.html';
        }, 2500);
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
});
