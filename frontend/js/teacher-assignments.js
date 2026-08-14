const API_URL = 'http://localhost:5000/api';

export async function initAssignments() {
    const tableBody = document.getElementById('assignment-table-body');
    const form = document.getElementById('assignment-form');
    const modal = document.getElementById('assignment-modal');
    const addBtn = document.getElementById('add-assignment-btn');
    const closeBtn = document.getElementById('close-modal');

    const teacherSelect = document.getElementById('teacher-select');
    const classSelect = document.getElementById('class-select');
    const subjectSelect = document.getElementById('subject-select');

    async function loadSelects() {
        const [teachers, classes, subjects] = await Promise.all([
            fetch(`${API_URL}/teachers`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API_URL}/classes`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API_URL}/subjects`, { credentials: 'include' }).then(r => r.json())
        ]);

        teacherSelect.innerHTML = teachers.map(t => `<option value="${t.id}">${t.name} (${t.teacher_code})</option>`).join('');
        classSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
        subjectSelect.innerHTML = subjects.map(s => `<option value="${s.id}">${s.subject_name} (${s.subject_code})</option>`).join('');
    }

    async function loadAssignments() {
        const res = await fetch(`${API_URL}/teacher-assignments`, { credentials: 'include' });
        const data = await res.json();
        tableBody.innerHTML = data.map(a => `
            <tr>
                <td>${a.teacher_name}</td>
                <td>${a.class_name}</td>
                <td>${a.subject_name}</td>
                <td>
                    <button class="btn-icon delete-btn" onclick="deleteAssignment(${a.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.deleteAssignment = async (id) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`${API_URL}/teacher-assignments/${id}`, { method: 'DELETE', credentials: 'include' });
        loadAssignments();
    };

    addBtn.onclick = () => {
        form.reset();
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            teacher_id: parseInt(teacherSelect.value),
            class_id: parseInt(classSelect.value),
            subject_id: parseInt(subjectSelect.value)
        };
        const res = await fetch(`${API_URL}/teacher-assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (res.ok) {
            modal.style.display = 'none';
            loadAssignments();
        } else {
            const err = await res.json();
            alert(err.error);
        }
    };

    await loadSelects();
    loadAssignments();
}
