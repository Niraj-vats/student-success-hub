document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('error-box');
    const loginBtn = document.getElementById('login-btn');
    
    errorBox.style.display = 'none';
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success - Redirect based on role (all to dashboard for now as per instructions)
            window.location.href = 'index.html';
        } else {
            errorBox.textContent = data.error || 'Invalid credentials';
            errorBox.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorBox.textContent = 'Connection error. Please try again.';
        errorBox.style.display = 'block';
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});
