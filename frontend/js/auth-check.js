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
        
        // Handle role-based UI visibility
        updateSidebarVisibility(user.role);
        
        return user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
        return null;
    }
}

function updateSidebarVisibility(role) {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Student specific visibility
    if (role === 'Student') {
        // Hide Admin management links
        const adminLinks = nav.querySelectorAll('a[href="users.html"], a[href="departments.html"], a[href="classes.html"], a[href="teachers.html"], a[href="teacher-assignments.html"], a[href="audit-logs.html"]');
        adminLinks.forEach(link => link.style.display = 'none');
        
        // Hide Teacher management links (Reports, etc. if not for students)
        const teacherLinks = nav.querySelectorAll('a[href="reports.html"]');
        teacherLinks.forEach(link => link.style.display = 'none');
        
        // Hide management headings if any
        const headings = nav.querySelectorAll('.nav-section-title'); // Assuming this class exists or similar
        headings.forEach(h => {
            if (h.textContent.toLowerCase().includes('management') || h.textContent.toLowerCase().includes('admin')) {
                h.style.display = 'none';
            }
        });
    }
    
    // Teacher specific visibility
    if (role === 'Teacher') {
        const adminLinks = nav.querySelectorAll('a[href="users.html"], a[href="departments.html"], a[href="classes.html"], a[href="teachers.html"], a[href="teacher-assignments.html"], a[href="audit-logs.html"]');
        adminLinks.forEach(link => link.style.display = 'none');
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
