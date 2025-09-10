document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.auth-form');
    const messageBox = document.querySelector('.message-box');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;

        let foundUser = null;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                const user = JSON.parse(localStorage.getItem(key));
                if (user.email === email) {
                    foundUser = user;
                    break;
                }
            }
        }

        if (foundUser) {
            localStorage.setItem('currentUserId', foundUser.id);
            localStorage.setItem('isLoggedIn', 'true');
            
            messageBox.classList.remove('error');
            messageBox.classList.add('success');
            messageBox.classList.add('show');
            messageBox.textContent = 'Login successful! Redirecting...';
            
            setTimeout(() => {
                window.location.href = 'dsh.html';
            }, 1000);
        } else {
            messageBox.classList.remove('success');
            messageBox.classList.add('error');
            messageBox.classList.add('show');
            messageBox.textContent = 'Login failed. Please check your email.';
        }
    });
});
