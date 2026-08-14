const API_URL = 'http://localhost:5000/api';

export async function initTeachers() {
    const tableBody = document.getElementById('teacher-table-body');
    const form = document.getElementById('teacher-form');
    const modal = document.getElementById('teacher-modal');
    const addBtn = document.getElementById('add-teacher-btn');
    const closeBtn = document.getElementById('close-modal');

    async function loadTeachers() {
        try {
            const response = await fetch(`${API_URL}/teachers`, { credentials: 'include' });
            const teachers = await response.json();
            tableBody.innerHTML = teachers.map(t => `
                <tr>
                    <td>${t.teacher_code || 'N/A'}</td>
                    <td>${t.name}</td>
                    <td>${t.email || 'N/A'}</td>
                    <td>${t.department || 'N/A'}</td>
                    <td>
                        <button class="btn-icon delete-btn" onclick="deleteTeacher(${t.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    window.deleteTeacher = async (id) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`${API_URL}/teachers/${id}`, { method: 'DELETE', credentials: 'include' });
        loadTeachers();
    };

    addBtn.onclick = () => {
        form.reset();
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            teacher_code: document.getElementById('teacher-code').value,
            name: document.getElementById('teacher-name').value,
            email: document.getElementById('teacher-email').value,
            department: document.getElementById('teacher-dept').value
        };
        try {
            const res = await fetch(`${API_URL}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (res.ok) {
                modal.style.display = 'none';
                loadTeachers();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) { console.error(error); }
    };

    loadTeachers();
}
