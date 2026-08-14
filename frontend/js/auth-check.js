export async function checkAuth(adminOnly = false) {
    // Skip auth check if we are on the login page
    if (window.location.pathname.endsWith('login.html')) return null;

    try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
            window.location.href = 'login.html';
            return null;
        }
        const user = await response.json();
        
        // If page requires Admin but user is not Admin
        if (adminOnly && user.role !== 'Admin') {
            // Show access denied instead of redirecting to login
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; flex-direction: column;">
                    <h1 style="color: #c53030;">403 - Access Denied</h1>
                    <p>You do not have permission to access this page.</p>
                    <a href="index.html" style="color: #3182ce; text-decoration: none; font-weight: bold; margin-top: 20px;">Back to Dashboard</a>
                </div>
            `;
            return null;
        }

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
