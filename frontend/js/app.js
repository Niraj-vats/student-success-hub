import { checkAuth } from './auth-check.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        if (user.role === 'Admin') {
            const adminSection = document.getElementById('admin-management-section');
            if (adminSection) adminSection.style.display = 'block';
            
            // Set institution labels for Admin
            const statsTitles = {
                'total-students-title': 'Total Students',
                'total-subjects-title': 'Total Subjects',
                'avg-percentage-title': 'Avg. Percentage',
                'pass-percentage-title': 'Pass Percentage'
            };
            for (const [id, text] of Object.entries(statsTitles)) {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            }
        } else if (user.role === 'Teacher') {
            // Adjust labels for Teacher scoping
            const statsTitles = {
                'total-students-title': 'Scoped Students',
                'total-subjects-title': 'Assigned Subjects',
                'avg-percentage-title': 'Avg. Class Performance',
                'pass-percentage-title': 'Class Pass %'
            };
            for (const [id, text] of Object.entries(statsTitles)) {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            }
        }
        fetchDashboardStats();
        fetchRecentStudents();
    }
});

const API_BASE_URL = 'http://localhost:5000/api';

async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, { credentials: 'include' });
        const data = await response.json();
        
        document.getElementById('total-students').textContent = data.totalStudents;
        document.getElementById('total-subjects').textContent = data.totalSubjects;
        if (document.getElementById('total-teachers')) document.getElementById('total-teachers').textContent = data.totalTeachers;
        if (document.getElementById('total-departments')) document.getElementById('total-departments').textContent = data.totalDepartments;
        if (document.getElementById('total-classes')) document.getElementById('total-classes').textContent = data.totalClasses;
        if (document.getElementById('total-users')) document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('avg-percentage').textContent = data.averagePercentage + '%';
        document.getElementById('pass-percentage').textContent = data.passPercentage + '%';
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

async function fetchRecentStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, { credentials: 'include' });
        const students = await response.json();
        
        const tbody = document.getElementById('recent-students');
        tbody.innerHTML = '';
        
        // Just show last 5
        students.slice(-5).reverse().forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td>${student.roll_number}</td>
                <td>${student.department}</td>
                <td>${student.semester}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}
