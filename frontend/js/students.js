document.addEventListener('DOMContentLoaded', fetchStudents);

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const students = await response.json();
        
        const tbody = document.getElementById('student-list');
        tbody.innerHTML = '';
        
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td>${student.roll_number}</td>
                <td>${student.department}</td>
                <td>${student.semester}</td>
                <td>
                    <button class="btn" style="background:#f59e0b; color:white; padding: 4px 8px;" onclick="editStudent(${student.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="background:#ef4444; color:white; padding: 4px 8px;" onclick="deleteStudent(${student.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

export function openModal() {
    document.getElementById('modalTitle').textContent = 'Add Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentIdx').value = '';
    document.getElementById('studentModal').style.display = 'flex';
}

export function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
}

export async function editStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`);
        const student = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentIdx').value = student.id;
        document.getElementById('student_id').value = student.student_id;
        document.getElementById('name').value = student.name;
        document.getElementById('roll_number').value = student.roll_number;
        document.getElementById('department').value = student.department;
        document.getElementById('semester').value = student.semester;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        
        document.getElementById('studentModal').style.display = 'flex';
    } catch (error) {
        console.error('Error fetching student details:', error);
    }
}

export async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('studentIdx').value;
    const studentData = {
        student_id: document.getElementById('student_id').value,
        name: document.getElementById('name').value,
        roll_number: document.getElementById('roll_number').value,
        department: document.getElementById('department').value,
        semester: parseInt(document.getElementById('semester').value),
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/students/${id}` : `${API_BASE_URL}/students`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        
        if (response.ok) {
            closeModal();
            fetchStudents();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'Operation failed'));
        }
    } catch (error) {
        console.error('Error saving student:', error);
    }
});
