import { checkAuth } from './auth-check.js';

const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth(true);
    if (user) {
        loadUsers();
        loadTeachers();
        loadStudents();
    }
});

const userTableBody = document.getElementById('user-table-body');
const userForm = document.getElementById('user-form');

async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
        const users = await res.json();
        
        userTableBody.innerHTML = users.map(u => {
            const profile = u.student_name || u.teacher_name || '-';
            const statusClass = u.is_active ? 'status-active' : 'status-inactive';
            const statusText = u.is_active ? 'Active' : 'Inactive';
            const statusBtnText = u.is_active ? 'Deactivate' : 'Activate';
            
            return `
                <tr>
                    <td>${u.username}</td>
                    <td><span class="role-badge">${u.role}</span></td>
                    <td>${profile}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="openPasswordModal(${u.id}, '${u.username}')" title="Reset Password">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm" onclick="toggleStatus(${u.id}, ${u.is_active})" title="${statusBtnText}">
                            <i class="fas ${u.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})" title="Delete Account">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

async function loadTeachers() {
    const res = await fetch(`${API_URL}/teachers`, { credentials: 'include' });
    const teachers = await res.json();
    const select = document.getElementById('teacher_id');
    select.innerHTML = '<option value="">-- Select Teacher --</option>' + 
        teachers.map(t => `<option value="${t.id}">${t.name} (${t.teacher_code})</option>`).join('');
}

async function loadStudents() {
    const res = await fetch(`${API_URL}/students`, { credentials: 'include' });
    const students = await res.json();
    const select = document.getElementById('student_id');
    select.innerHTML = '<option value="">-- Select Student --</option>' + 
        students.map(s => `<option value="${s.id}">${s.name} (${s.student_id})</option>`).join('');
}

window.handleRoleChange = function() {
    const role = document.getElementById('role').value;
    const profileSection = document.getElementById('profile-selection');
    const teacherSection = document.getElementById('teacher-selection');
    const studentSection = document.getElementById('student-selection');
    
    profileSection.style.display = role === 'Admin' ? 'none' : 'block';
    teacherSection.style.display = role === 'Teacher' ? 'block' : 'none';
    studentSection.style.display = role === 'Student' ? 'block' : 'none';
};

window.openCreateModal = function() {
    document.getElementById('userForm').reset();
    handleRoleChange();
    document.getElementById('userModal').style.display = 'flex';
};

window.closeModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

window.openPasswordModal = function(id, username) {
    document.getElementById('reset-user-id').value = id;
    document.getElementById('reset-username').value = username;
    document.getElementById('new-password').value = '';
    document.getElementById('passwordModal').style.display = 'flex';
};

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const data = {
        role,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        teacher_id: role === 'Teacher' ? document.getElementById('teacher_id').value : null,
        student_id: role === 'Student' ? document.getElementById('student_id').value : null
    };
    
    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        const result = await res.json();
        if (res.ok) {
            closeModal('userModal');
            loadUsers();
            alert('User account created successfully');
        } else {
            alert(result.error || 'Failed to create user');
        }
    } catch (err) {
        alert('Network error');
    }
});

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('reset-user-id').value;
    const password = document.getElementById('new-password').value;
    
    try {
        const res = await fetch(`${API_URL}/users/${id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        
        if (res.ok) {
            closeModal('passwordModal');
            alert('Password reset successfully');
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to reset password');
        }
    } catch (err) {
        alert('Network error');
    }
});

window.toggleStatus = async (id, currentStatus) => {
    try {
        const res = await fetch(`${API_URL}/users/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !currentStatus }),
            credentials: 'include'
        });
        
        if (res.ok) {
            loadUsers();
        } else {
            const data = await res.json();
            alert(data.error || 'Operation failed');
        }
    } catch (err) {
        alert('Network error');
    }
};

window.deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            loadUsers();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to delete user');
        }
    } catch (err) {
        alert('Network error');
    }
};
