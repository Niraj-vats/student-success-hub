const API_URL = 'http://localhost:5000/api';

export async function initDepartments() {
    const tableBody = document.getElementById('dept-table-body');
    const form = document.getElementById('dept-form');
    const modal = document.getElementById('dept-modal');
    const addBtn = document.getElementById('add-dept-btn');
    const closeBtn = document.getElementById('close-modal');

    async function loadDepartments() {
        try {
            const response = await fetch(`${API_URL}/departments`, { credentials: 'include' });
            const depts = await response.json();
            tableBody.innerHTML = depts.map(dept => `
                <tr>
                    <td>${dept.department_code}</td>
                    <td>${dept.department_name}</td>
                    <td>${new Date(dept.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-icon delete-btn" onclick="deleteDept(${dept.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    window.deleteDept = async (id) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            const response = await fetch(`${API_URL}/departments/${id}`, { 
                method: 'DELETE',
                credentials: 'include' 
            });
            if (response.ok) loadDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };

    addBtn.onclick = () => {
        form.reset();
        document.getElementById('dept-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Department';
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            department_code: document.getElementById('dept-code').value,
            department_name: document.getElementById('dept-name').value
        };

        try {
            const response = await fetch(`${API_URL}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (response.ok) {
                modal.style.display = 'none';
                loadDepartments();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to save department');
            }
        } catch (error) {
            console.error('Error saving department:', error);
        }
    };

    loadDepartments();
}
