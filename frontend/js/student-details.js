const API_BASE_URL = 'http://localhost:5000/api';

import { checkAuth } from './auth-check.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        showError('Missing Student ID', 'No student ID was provided in the URL.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, { credentials: 'include' });
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('Student Not Found', 'The requested student could not be found in the database.');
            } else if (response.status === 403) {
                showError('Access Denied', 'You are not authorized to view this student\'s profile.');
            } else {
                showError('API Error', 'There was a problem communicating with the server.');
            }
            return;
        }

        const student = await response.json();
        renderStudentDetails(student);
        
    } catch (error) {
        console.error('Error fetching student details:', error);
        showError('Network Error', 'Failed to connect to the server. Please check if the backend is running.');
    }
});

function renderStudentDetails(student) {
    document.getElementById('studentContent').style.display = 'block';
    
    // Header
    document.getElementById('display-name').textContent = student.name;
    document.getElementById('display-id').textContent = `ID: ${student.student_id}`;
    document.getElementById('display-dept-sem').textContent = `${student.department} | Semester ${student.semester}`;
    
    // Personal Info
    document.getElementById('val-student-id').textContent = student.student_id;
    document.getElementById('val-roll-number').textContent = student.roll_number;
    document.getElementById('val-email').textContent = student.email;
    document.getElementById('val-phone').textContent = student.phone;
    
    // Academic Details
    document.getElementById('val-department').textContent = student.department;
    document.getElementById('val-semester').textContent = student.semester;
    
    // Title Update
    document.title = `${student.name} - Profile Details`;
}

function showError(title, message) {
    document.getElementById('studentContent').style.display = 'none';
    const errorBox = document.getElementById('errorMessage');
    errorBox.style.display = 'block';
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorText').textContent = message;
}