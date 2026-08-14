document.addEventListener('DOMContentLoaded', fetchSubjects);

const API_BASE_URL = 'http://localhost:5000/api';

async function fetchSubjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        const subjects = await response.json();
        
        const tbody = document.getElementById('subject-list');
        tbody.innerHTML = '';
        
        subjects.forEach(subject => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${subject.subject_code}</td>
                <td>${subject.subject_name}</td>
                <td>${subject.semester}</td>
                <td>${subject.credits}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
}
