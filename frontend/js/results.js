const API_BASE_URL = 'http://localhost:5000/api';

export async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, { credentials: 'include' });
        const students = await response.json();
        
        const select = document.getElementById('studentSelect');
        students.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.student_id})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

export async function loadStudentResult() {
    const studentId = document.getElementById('studentSelect').value;
    const noDataView = document.getElementById('noDataView');
    const resultView = document.getElementById('resultView');
    const printBtn = document.getElementById('printBtn');

    if (!studentId) {
        noDataView.style.display = 'block';
        resultView.style.display = 'none';
        printBtn.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/results/${studentId}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch result');
        }
        const data = await response.json();

        // Update Student Info
        document.getElementById('res-name').textContent = data.student.name;
        document.getElementById('res-id').textContent = data.student.student_id;
        document.getElementById('res-roll').textContent = data.student.roll_number;
        document.getElementById('res-dept').textContent = data.student.department;
        document.getElementById('res-sem').textContent = data.student.semester;

        // Update Stats
        document.getElementById('res-total').textContent = data.stats.total_marks;
        document.getElementById('res-max').textContent = data.stats.max_marks;
        document.getElementById('res-pct').textContent = data.stats.overall_percentage;
        document.getElementById('res-passed').textContent = data.stats.passed_subjects;
        document.getElementById('res-failed').textContent = data.stats.failed_subjects;

        // Overall Badge
        const badge = document.getElementById('res-overall-badge');
        badge.textContent = data.stats.overall_result;
        badge.className = 'badge overall-badge';
        if (data.stats.overall_result === 'PASS') {
            badge.classList.add('badge-pass');
        } else if (data.stats.overall_result === 'FAIL') {
            badge.classList.add('badge-fail');
        } else {
            badge.classList.add('badge-neutral');
        }

        // Table Body
        const tbody = document.getElementById('res-table-body');
        tbody.innerHTML = '';

        if (data.subject_wise.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">No marks records found for this student.</td></tr>';
        } else {
            data.subject_wise.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.subject_code}</td>
                    <td>${row.subject_name}</td>
                    <td>${row.internal_marks}</td>
                    <td>${row.external_marks}</td>
                    <td>${row.total_marks}</td>
                    <td>${row.grade}</td>
                    <td><span class="badge ${row.pass_fail === 'Pass' ? 'badge-pass' : 'badge-fail'}">${row.pass_fail}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }

        noDataView.style.display = 'none';
        resultView.style.display = 'block';
        printBtn.style.display = 'inline-block';

    } catch (error) {
        console.error('Error loading student result:', error);
        alert('Could not load student result. Please try again.');
    }
}
