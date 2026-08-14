(async function() {
    // Skip auth check if we are on the login page
    if (window.location.pathname.endsWith('login.html')) return;

    try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }
        const user = await response.json();
        
        // Populate user info in the UI if elements exist
        document.addEventListener('DOMContentLoaded', () => {
            const userDisplay = document.getElementById('user-display-name');
            const roleDisplay = document.getElementById('user-display-role');
            if (userDisplay) userDisplay.textContent = user.username;
            if (roleDisplay) roleDisplay.textContent = user.role;
        });
        
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
    }
})();

async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = 'login.html';
    }
}
