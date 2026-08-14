const API_BASE = 'http://localhost:5000/api';

export async function init() {
    const selector = document.getElementById('studentSelector');
    const response = await fetch(`${API_BASE}/students`, { credentials: 'include' });
    const students = await response.json();
    
    // Check role
    const role = sessionStorage.getItem('role');
    const studentId = sessionStorage.getItem('student_id');

    if (role === 'Student') {
        // Hide selector for students
        const selectionCard = document.getElementById('studentSelectionCard');
        if (selectionCard) selectionCard.style.display = 'none';
        
        // Auto-load their own performance
        if (students.length > 0) {
            document.getElementById('studentSelector').value = students[0].id;
            loadPerformance();
        }
        return;
    }

    students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.student_id})`;
        selector.appendChild(opt);
    });
    
    document.getElementById('noDataMessage').style.display = 'block';
}

export async function loadPerformance() {
    const studentId = document.getElementById('studentSelector').value;
    const display = document.getElementById('performanceDisplay');
    const noData = document.getElementById('noDataMessage');
    
    if (!studentId) {
        display.style.display = 'none';
        noData.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/performance/${studentId}`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }
        
        display.style.display = 'block';
        noData.style.display = 'none';
        
        renderStats(data);
        renderTable(data.subject_wise);
    } catch (err) {
        console.error(err);
        alert('Failed to load performance data.');
    }
}

function renderStats(data) {
    document.getElementById('avgMarks').textContent = data.overall.avg_marks ? `${data.overall.avg_marks}%` : 'N/A';
    document.getElementById('avgAttendance').textContent = data.overall.avg_attendance ? `${data.overall.avg_attendance}%` : 'N/A';
    document.getElementById('passFail').textContent = `${data.overall.passed_subjects} / ${data.overall.failed_subjects}`;
    
    const statusEl = document.getElementById('statusContainer');
    statusEl.textContent = data.overall.status;
    statusEl.className = 'status-badge';
    
    if (data.overall.status === 'GOOD') statusEl.classList.add('status-good');
    else if (data.overall.status === 'AVERAGE') statusEl.classList.add('status-average');
    else if (data.overall.status === 'NEEDS IMPROVEMENT') statusEl.classList.add('status-improvement');
    else statusEl.classList.add('status-none');
}

function renderTable(subjects) {
    const tbody = document.getElementById('subjectPerformanceList');
    tbody.innerHTML = '';
    
    if (!subjects || subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No subject data found.</td></tr>';
        return;
    }
    
    subjects.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.subject_code}</td>
            <td>${s.subject_name}</td>
            <td>${s.marks_percentage !== null ? s.marks_percentage + '%' : 'N/A'}</td>
            <td>${s.grade || 'N/A'}</td>
            <td>${s.pass_fail || 'N/A'}</td>
            <td>${s.attendance_percentage !== null ? s.attendance_percentage + '%' : 'N/A'}</td>
            <td>${s.attendance_status || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}
