document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.auth-form');
    const accountTypeButtons = document.querySelectorAll('.account-type');
    
    // Account Type Toggle
    accountTypeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            accountTypeButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const submitBtn = document.querySelector('.auth-button');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoader = submitBtn.querySelector('.button-loader');
        
        submitBtn.disabled = true;
        buttonText.classList.add('hidden');
        buttonLoader.classList.remove('hidden');
        
        const userId = 'user_' + Date.now();
        
        const newUser = {
            id: userId,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            accountType: document.querySelector('.account-type.selected').dataset.type,
            signupTime: new Date().toISOString(),
            balance: 10000.00,
            trades: []
        };
        
        localStorage.setItem(userId, JSON.stringify(newUser));
        localStorage.setItem('currentUserId', userId);
        
        setTimeout(() => {
            window.location.href = 'dsh.html';
        }, 1000);
    });
    
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
});
