document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchRecentStudents();
});

const API_BASE_URL = 'http://localhost:5000/api';

async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        const data = await response.json();
        
        document.getElementById('total-students').textContent = data.totalStudents;
        document.getElementById('total-subjects').textContent = data.totalSubjects;
        document.getElementById('avg-percentage').textContent = data.averagePercentage + '%';
        document.getElementById('pass-percentage').textContent = data.passPercentage + '%';
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

async function fetchRecentStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
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
