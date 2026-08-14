document.addEventListener('DOMContentLoaded', fetchSubjects);

const API_BASE_URL = 'http://localhost:5000/api';
let allSubjects = [];

export async function fetchSubjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`, { credentials: 'include' });
        allSubjects = await response.json();
        
        populateSemesterFilter();
        renderSubjects(allSubjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
}

function populateSemesterFilter() {
    const semesters = [...new Set(allSubjects.map(s => s.semester))].sort((a, b) => a - b);
    const semFilter = document.getElementById('semFilter');
    
    // Clear existing options except the first one
    if (semFilter) {
        while (semFilter.options.length > 1) {
            semFilter.remove(1);
        }
        
        semesters.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem;
            option.textContent = sem;
            semFilter.appendChild(option);
        });
    }
}

function renderSubjects(subjects) {
    const tbody = document.getElementById('subject-list');
    const table = document.getElementById('subjectsTable');
    const noResults = document.getElementById('noSubjectsMessage');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (subjects.length === 0) {
        if (table) table.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (noResults) noResults.style.display = 'none';
    
    subjects.forEach(subject => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${subject.subject_code}</td>
            <td>${subject.subject_name}</td>
            <td>${subject.semester}</td>
            <td>${subject.credits}</td>
            <td>
                <button class="btn" style="background:#f59e0b; color:white; padding: 4px 8px;" onclick="editSubject(${subject.id})"><i class="fas fa-edit"></i></button>
                <button class="btn" style="background:#ef4444; color:white; padding: 4px 8px;" onclick="deleteSubject(${subject.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function filterSubjects() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const semFilterElement = document.getElementById('semFilter');
    const semValue = semFilterElement ? semFilterElement.value : "";
    
    const filtered = allSubjects.filter(subject => {
        const matchesSearch = 
            subject.subject_code.toLowerCase().includes(searchTerm) ||
            subject.subject_name.toLowerCase().includes(searchTerm);
            
        const matchesSem = semValue === "" || subject.semester.toString() === semValue;
        
        return matchesSearch && matchesSem;
    });
    
    renderSubjects(filtered);
}

export function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const semFilter = document.getElementById('semFilter');
    
    if (searchInput) searchInput.value = '';
    if (semFilter) semFilter.value = '';
    renderSubjects(allSubjects);
}

export function openModal() {
    const modal = document.getElementById('subjectModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('subjectForm');
    const idx = document.getElementById('subjectIdx');
    
    if (title) title.textContent = 'Add Subject';
    if (form) form.reset();
    if (idx) idx.value = '';
    if (modal) modal.style.display = 'flex';
}

export function closeModal() {
    const modal = document.getElementById('subjectModal');
    if (modal) modal.style.display = 'none';
}

export async function editSubject(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/${id}`, { credentials: 'include' });
        const subject = await response.json();
        
        const modal = document.getElementById('subjectModal');
        const title = document.getElementById('modalTitle');
        const idx = document.getElementById('subjectIdx');
        
        if (title) title.textContent = 'Edit Subject';
        if (idx) idx.value = subject.id;
        if (document.getElementById('subject_code')) document.getElementById('subject_code').value = subject.subject_code;
        if (document.getElementById('subject_name')) document.getElementById('subject_name').value = subject.subject_name;
        if (document.getElementById('semester')) document.getElementById('semester').value = subject.semester;
        if (document.getElementById('credits')) document.getElementById('credits').value = subject.credits;
        
        if (modal) modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching subject details:', error);
    }
}

export async function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/subjects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchSubjects();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Failed to delete subject'));
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    }
}

// Global submit handler
const subjectForm = document.getElementById('subjectForm');
if (subjectForm) {
    subjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('subjectIdx').value;
        const subjectData = {
            subject_code: document.getElementById('subject_code').value,
            subject_name: document.getElementById('subject_name').value,
            semester: parseInt(document.getElementById('semester').value),
            credits: parseInt(document.getElementById('credits').value)
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/subjects/${id}` : `${API_BASE_URL}/subjects`;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjectData)
            });
            
            if (response.ok) {
                closeModal();
                fetchSubjects();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Operation failed'));
            }
        } catch (error) {
            console.error('Error saving subject:', error);
        }
    });
}
