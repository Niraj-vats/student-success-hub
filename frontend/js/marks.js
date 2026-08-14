const API_BASE_URL = 'http://localhost:5000/api';
let allMarks = [];

import { checkAuth } from './auth-check.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        fetchMarks();
        fetchStudents();
        fetchSubjects();
        
        document.getElementById('marksForm').addEventListener('submit', handleFormSubmit);
    }
});

async function fetchMarks() {
    try {
        const response = await fetch(`${API_BASE_URL}/marks`, { credentials: 'include' });
        allMarks = await response.json();
        displayMarks(allMarks);
    } catch (error) {
        console.error('Error fetching marks:', error);
        alert('Failed to load marks. Please ensure the backend is running.');
    }
}

async function fetchStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, { credentials: 'include' });
        const students = await response.json();
        const select = document.getElementById('student_id');
        select.innerHTML = '<option value="">Select Student</option>';
        students.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.student_id})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

async function fetchSubjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`, { credentials: 'include' });
        const subjects = await response.json();
        const select = document.getElementById('subject_id');
        select.innerHTML = '<option value="">Select Subject</option>';
        subjects.sort((a, b) => a.subject_name.localeCompare(b.subject_name)).forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = `${subject.subject_name} (${subject.subject_code})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
}

function displayMarks(marks) {
    const tbody = document.getElementById('marks-list');
    const noMarksMessage = document.getElementById('noMarksMessage');
    const table = document.getElementById('marksTable');
    
    tbody.innerHTML = '';
    
    if (marks.length === 0) {
        noMarksMessage.style.display = 'block';
        table.style.display = 'none';
        return;
    }
    
    noMarksMessage.style.display = 'none';
    table.style.display = 'table';
    
    marks.forEach(mark => {
        const tr = document.createElement('tr');
        const statusClass = mark.pass_fail === 'Pass' ? 'status-pass' : 'status-fail';
        
        tr.innerHTML = `
            <td>${mark.student_name}</td>
            <td>${mark.subject_name}</td>
            <td>${mark.internal_marks}</td>
            <td>${mark.external_marks}</td>
            <td><strong>${mark.total_marks}</strong></td>
            <td>${mark.percentage}%</td>
            <td>${mark.grade}</td>
            <td><span class="status-badge ${statusClass}">${mark.pass_fail}</span></td>
            <td>
                <button class="btn" style="background: #3b82f6; color: white; margin-right: 5px;" onclick="editMarks(${mark.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn" style="background: #ef4444; color: white;" onclick="deleteMarks(${mark.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function openModal() {
    document.getElementById('modalTitle').textContent = 'Add Marks';
    document.getElementById('marksForm').reset();
    document.getElementById('markIdx').value = '';
    document.getElementById('marksModal').style.display = 'flex';
    updatePreview();
}

export function closeModal() {
    document.getElementById('marksModal').style.display = 'none';
}

export function updatePreview() {
    const internal = parseFloat(document.getElementById('internal_marks').value) || 0;
    const external = parseFloat(document.getElementById('external_marks').value) || 0;
    
    const total = internal + external;
    const percentage = total; // Max is 100
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    
    const status = percentage >= 40 ? 'Pass' : 'Fail';
    
    document.getElementById('previewTotal').textContent = total;
    document.getElementById('previewPercentage').textContent = percentage + '%';
    document.getElementById('previewGrade').textContent = grade;
    document.getElementById('previewStatus').textContent = status;
    
    const statusEl = document.getElementById('previewStatus');
    statusEl.style.color = status === 'Pass' ? '#166534' : '#991b1b';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const markId = document.getElementById('markIdx').value;
    const data = {
        student_id: parseInt(document.getElementById('student_id').value),
        subject_id: parseInt(document.getElementById('subject_id').value),
        internal_marks: parseFloat(document.getElementById('internal_marks').value),
        external_marks: parseFloat(document.getElementById('external_marks').value)
    };
    
    const url = markId ? `${API_BASE_URL}/marks/${markId}` : `${API_BASE_URL}/marks`;
    const method = markId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, { credentials: 'include',
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeModal();
            fetchMarks();
        } else {
            alert(result.error || 'Failed to save marks.');
        }
    } catch (error) {
        console.error('Error saving marks:', error);
        alert('An error occurred while saving.');
    }
}

export async function editMarks(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/marks/${id}`, { credentials: 'include' });
        const mark = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Marks';
        document.getElementById('markIdx').value = mark.id;
        document.getElementById('student_id').value = mark.student_id;
        document.getElementById('subject_id').value = mark.subject_id;
        document.getElementById('internal_marks').value = mark.internal_marks;
        document.getElementById('external_marks').value = mark.external_marks;
        
        document.getElementById('marksModal').style.display = 'flex';
        updatePreview();
    } catch (error) {
        console.error('Error loading mark for edit:', error);
    }
}

export async function deleteMarks(id) {
    if (!confirm('Are you sure you want to delete this marks record?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/marks/${id}`, { credentials: 'include', method: 'DELETE' });
        if (response.ok) {
            fetchMarks();
        } else {
            const result = await response.json();
            alert(result.error || 'Failed to delete record.');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
    }
}

export function filterMarks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const semFilter = document.getElementById('semFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allMarks.filter(mark => {
        const matchesSearch = 
            mark.student_name.toLowerCase().includes(searchTerm) ||
            mark.student_identifier.toLowerCase().includes(searchTerm) ||
            mark.subject_name.toLowerCase().includes(searchTerm) ||
            mark.subject_code.toLowerCase().includes(searchTerm);
            
        const matchesSem = semFilter === '' || mark.semester.toString() === semFilter;
        const matchesStatus = statusFilter === '' || mark.pass_fail === statusFilter;
        
        return matchesSearch && matchesSem && matchesStatus;
    });
    
    displayMarks(filtered);
}

export function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('semFilter').value = '';
    document.getElementById('statusFilter').value = '';
    displayMarks(allMarks);
}
