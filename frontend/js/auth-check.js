export async function checkAuth() {
    // Skip auth check if we are on the login page
    if (window.location.pathname.endsWith('login.html')) return null;

    try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
            window.location.href = 'login.html';
            return null;
        }
        const user = await response.json();
        
        // Populate user info in the UI
        const userDisplay = document.getElementById('user-display-name');
        const roleDisplay = document.getElementById('user-display-role');
        if (userDisplay) userDisplay.textContent = user.username;
        if (roleDisplay) roleDisplay.textContent = user.role;
        
        return user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
        return null;
    }
}

export async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', { credentials: 'include', method: 'POST' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = 'login.html';
    }
}

// Global logout for inline onclick handlers if needed, 
// though we should move to event listeners
window.logout = logout;
