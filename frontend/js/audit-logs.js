import { checkAuth } from './auth-check.js';

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
    // Only Admin can view audit logs
    const user = await checkAuth(true);
    if (!user) return;

    fetchAuditLogs();

    document.getElementById('refresh-logs').addEventListener('click', fetchAuditLogs);
    document.getElementById('log-search').addEventListener('input', filterLogs);
});

let allLogs = [];

async function fetchAuditLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/audit-logs`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        allLogs = await response.json();
        renderLogs(allLogs);
    } catch (error) {
        console.error('Error:', error);
        alert('Could not load audit logs. Please try again.');
    }
}

function renderLogs(logs) {
    const tbody = document.getElementById('audit-logs-body');
    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No logs found.</td></tr>';
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        // Simple color coding for actions
        let actionClass = '';
        if (log.action === 'DELETE') actionClass = 'text-danger';
        if (log.action === 'CREATE') actionClass = 'text-success';
        if (log.action === 'UPDATE') actionClass = 'text-warning';

        tr.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td><strong>${log.username}</strong></td>
            <td><span class="badge badge-${log.role.toLowerCase()}">${log.role}</span></td>
            <td><span class="${actionClass}">${log.action}</span></td>
            <td>${log.table_name}</td>
            <td>${log.record_id || '-'}</td>
            <td>${log.description}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterLogs() {
    const searchTerm = document.getElementById('log-search').value.toLowerCase();
    const filtered = allLogs.filter(log => 
        log.username.toLowerCase().includes(searchTerm) || 
        log.action.toLowerCase().includes(searchTerm) || 
        log.table_name.toLowerCase().includes(searchTerm) ||
        log.description.toLowerCase().includes(searchTerm)
    );
    renderLogs(filtered);
}
