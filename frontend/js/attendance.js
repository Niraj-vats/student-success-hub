const API_URL = 'http://localhost:5000/api';
let allAttendance = [];

import { checkAuth } from './auth-check.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAttendance();
        loadDropdowns();

        const form = document.getElementById('attendanceForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }
});

async function loadAttendance() {
    try {
        const response = await fetch(`${API_URL}/attendance`, { credentials: 'include' });
        allAttendance = await response.json();
        renderAttendance(allAttendance);
    } catch (error) {
        console.error('Error loading attendance:', error);
        alert('Failed to load attendance records.');
    }
}

async function loadDropdowns() {
    try {
        const [studentsRes, subjectsRes] = await Promise.all([
            fetch(`${API_URL}/students`, { credentials: 'include' }),
            fetch(`${API_URL}/subjects`, { credentials: 'include' })
        ]);
        
        const students = await studentsRes.json();
        const subjects = await subjectsRes.json();

        const studentSelect = document.getElementById('student_id');
        const subjectSelect = document.getElementById('subject_id');

        studentSelect.innerHTML = '<option value="">Select Student</option>' + 
            students.map(s => `<option value="${s.id}">${s.name} (${s.student_id})</option>`).join('');
        
        subjectSelect.innerHTML = '<option value="">Select Subject</option>' + 
            subjects.map(s => `<option value="${s.id}">${s.subject_name} (${s.subject_code})</option>`).join('');
    } catch (error) {
        console.error('Error loading dropdowns:', error);
    }
}

function renderAttendance(data) {
    const list = document.getElementById('attendance-list');
    const noResults = document.getElementById('noAttendanceMessage');
    const table = document.getElementById('attendanceTable');
    
    list.innerHTML = '';
    
    if (data.length === 0) {
        noResults.style.display = 'block';
        table.style.display = 'none';
        return;
    }

    noResults.style.display = 'none';
    table.style.display = 'table';

    data.forEach(record => {
        const statusClass = record.status === 'ELIGIBLE' ? 'status-active' : 'status-inactive';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.student_identifier}</td>
            <td>${record.student_name}</td>
            <td>${record.subject_name} (${record.subject_code})</td>
            <td>${record.total_classes}</td>
            <td>${record.attended_classes}</td>
            <td>${record.attendance_percentage}%</td>
            <td><span class="status-badge ${statusClass}">${record.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editAttendance(${record.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline text-danger" onclick="deleteAttendance(${record.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        list.appendChild(row);
    });
}

export function openModal() {
    document.getElementById('modalTitle').textContent = 'Add Attendance';
    document.getElementById('attendanceForm').reset();
    document.getElementById('recordId').value = '';
    document.getElementById('attendanceModal').style.display = 'flex';
    updatePreview();
}

export function closeModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}

export async function editAttendance(id) {
    try {
        const response = await fetch(`${API_URL}/attendance/${id}`, { credentials: 'include' });
        const record = await response.json();

        document.getElementById('modalTitle').textContent = 'Edit Attendance';
        document.getElementById('recordId').value = record.id;
        document.getElementById('student_id').value = record.student_id;
        document.getElementById('subject_id').value = record.subject_id;
        document.getElementById('total_classes').value = record.total_classes;
        document.getElementById('attended_classes').value = record.attended_classes;

        document.getElementById('attendanceModal').style.display = 'flex';
        updatePreview();
    } catch (error) {
        console.error('Error loading record:', error);
        alert('Failed to load record details.');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('recordId').value;
    const data = {
        student_id: parseInt(document.getElementById('student_id').value),
        subject_id: parseInt(document.getElementById('subject_id').value),
        total_classes: parseInt(document.getElementById('total_classes').value),
        attended_classes: parseInt(document.getElementById('attended_classes').value)
    };

    if (data.attended_classes > data.total_classes) {
        alert('Attended classes cannot be more than total classes.');
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/attendance/${id}` : `${API_URL}/attendance`;

    try {
        const response = await fetch(url, { credentials: 'include',
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            closeModal();
            loadAttendance();
        } else {
            alert(result.error || 'Failed to save attendance.');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        alert('An error occurred while saving.');
    }
}

export async function deleteAttendance(id) {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
        const response = await fetch(`${API_URL}/attendance/${id}`, { credentials: 'include', method: 'DELETE' });
        if (response.ok) {
            loadAttendance();
        } else {
            const result = await response.json();
            alert(result.error || 'Failed to delete record.');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('An error occurred.');
    }
}

export function updatePreview() {
    const total = parseInt(document.getElementById('total_classes').value) || 0;
    const attended = parseInt(document.getElementById('attended_classes').value) || 0;
    
    const previewPct = document.getElementById('previewPercentage');
    const previewStatus = document.getElementById('previewStatus');

    if (total > 0 && attended >= 0) {
        if (attended > total) {
            previewPct.textContent = 'Invalid';
            previewStatus.textContent = 'Invalid';
            return;
        }
        const pct = ((attended / total) * 100).toFixed(2);
        const status = pct >= 75 ? 'ELIGIBLE' : 'SHORTAGE';
        
        previewPct.textContent = `${pct}%`;
        previewStatus.textContent = status;
        previewStatus.style.color = status === 'ELIGIBLE' ? '#10b981' : '#ef4444';
    } else {
        previewPct.textContent = '-';
        previewStatus.textContent = '-';
        previewStatus.style.color = 'inherit';
    }
}

export function filterAttendance() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const semester = document.getElementById('semFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = allAttendance.filter(record => {
        const matchesSearch = 
            record.student_name.toLowerCase().includes(search) ||
            record.student_identifier.toLowerCase().includes(search) ||
            record.subject_name.toLowerCase().includes(search) ||
            record.subject_code.toLowerCase().includes(search);
        
        const matchesSemester = semester === '' || record.semester.toString() === semester;
        const matchesStatus = status === '' || record.status === status;

        return matchesSearch && matchesSemester && matchesStatus;
    });

    renderAttendance(filtered);
}

export function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('semFilter').value = '';
    document.getElementById('statusFilter').value = '';
    renderAttendance(allAttendance);
}
