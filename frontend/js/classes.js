const API_URL = 'http://localhost:5000/api';

export async function initClasses() {
    const tableBody = document.getElementById('class-table-body');
    const form = document.getElementById('class-form');
    const modal = document.getElementById('class-modal');
    const addBtn = document.getElementById('add-class-btn');
    const closeBtn = document.getElementById('close-modal');
    const deptSelect = document.getElementById('dept-select');

    async function loadDepts() {
        try {
            const response = await fetch(`${API_URL}/departments`, { credentials: 'include' });
            const depts = await response.json();
            deptSelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.department_name}</option>`).join('');
        } catch (error) {
            console.error('Error loading depts:', error);
        }
    }

    async function loadClasses() {
        try {
            const response = await fetch(`${API_URL}/classes`, { credentials: 'include' });
            const classes = await response.json();
            tableBody.innerHTML = classes.map(c => `
                <tr>
                    <td>${c.class_name}</td>
                    <td>${c.department_name}</td>
                    <td>${c.semester}</td>
                    <td>${c.section}</td>
                    <td>${c.academic_year}</td>
                    <td>
                        <button class="btn-icon delete-btn" onclick="deleteClass(${c.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    }

    window.deleteClass = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`${API_URL}/classes/${id}`, { method: 'DELETE', credentials: 'include' });
            loadClasses();
        } catch (error) { console.error(error); }
    };

    addBtn.onclick = () => {
        form.reset();
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            class_name: document.getElementById('class-name').value,
            department_id: parseInt(deptSelect.value),
            semester: parseInt(document.getElementById('semester').value),
            section: document.getElementById('section').value,
            academic_year: document.getElementById('academic-year').value
        };

        try {
            const res = await fetch(`${API_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (res.ok) {
                modal.style.display = 'none';
                loadClasses();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) { console.error(error); }
    };

    await loadDepts();
    loadClasses();
}
