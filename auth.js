// Demo user registration/login (not secure for production)
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

if(registerForm){
  registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(username && password){
      // Save to localStorage for demo only
      localStorage.setItem('demoUser', JSON.stringify({username,password}));
      document.getElementById('registerMessage').innerText = "가입 완료! 이제 로그인하세요.";
      registerForm.reset();
    }
  });
}

if(loginForm){
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const user = JSON.parse(localStorage.getItem('demoUser'));
    if(user && user.username === username && user.password === password){
      document.getElementById('loginMessage').innerText = "로그인 성공!";
      loginForm.reset();
    } else {
      document.getElementById('loginMessage').innerText = "사용자 이름 또는 비밀번호가 잘못되었습니다.";
    }
  });
}
