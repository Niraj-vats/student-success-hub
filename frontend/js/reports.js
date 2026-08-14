const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        const students = await response.json();
        
        const selector = document.getElementById('studentSelector');
        students.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (${s.student_id})`;
            selector.appendChild(opt);
        });
    } catch (err) {
        console.error('Error loading students:', err);
    }
}

window.toggleReportSections = function() {
    const type = document.getElementById('reportType').value;
    const studentFilter = document.getElementById('studentFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    
    // Reset displays
    document.querySelectorAll('.report-section').forEach(s => s.style.display = 'none');
    document.getElementById('noDataMessage').style.display = 'block';
    document.getElementById('printBtn').style.display = 'none';

    if (type === 'student') {
        studentFilter.style.display = 'block';
        semesterFilter.style.display = 'none';
    } else if (type === 'attendance') {
        studentFilter.style.display = 'none';
        semesterFilter.style.display = 'block';
    } else {
        studentFilter.style.display = 'none';
        semesterFilter.style.display = 'none';
    }
}

window.generateReport = async function() {
    const type = document.getElementById('reportType').value;
    const noData = document.getElementById('noDataMessage');
    
    // Clear all sections
    document.querySelectorAll('.report-section').forEach(s => s.style.display = 'none');
    
    try {
        if (type === 'student') {
            await generateStudentReport();
        } else if (type === 'class') {
            await generateClassSummary();
        } else if (type === 'attendance') {
            await generateAttendanceSummary();
        }
        
        noData.style.display = 'none';
        document.getElementById('printBtn').style.display = 'block';
    } catch (err) {
        console.error(err);
        alert('Failed to generate report: ' + err.message);
        noData.style.display = 'block';
        noData.textContent = "Error loading report data. Please try again.";
    }
}

async function generateStudentReport() {
    const studentId = document.getElementById('studentSelector').value;
    if (!studentId) throw new Error('Please select a student');

    const response = await fetch(`${API_BASE}/performance/${studentId}`);
    const data = await response.json();
    
    if (data.error) throw new Error(data.error);

    const section = document.getElementById('studentReportSection');
    section.style.display = 'block';
    
    document.getElementById('reportDate').textContent = 'Generated on: ' + new Date().toLocaleDateString();

    // Basic Info
    const info = document.getElementById('studentBasicInfo');
    info.innerHTML = `
        <div class="info-item"><label>Name</label><span>${data.student.name}</span></div>
        <div class="info-item"><label>Student ID</label><span>${data.student.student_id}</span></div>
        <div class="info-item"><label>Roll Number</label><span>${data.student.roll_number}</span></div>
        <div class="info-item"><label>Department</label><span>${data.student.department}</span></div>
        <div class="info-item"><label>Semester</label><span>${data.student.semester}</span></div>
    `;

    // Table
    const tbody = document.getElementById('studentPerformanceTable');
    tbody.innerHTML = '';
    if (data.subject_wise.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No academic records found for this student.</td></tr>';
    } else {
        data.subject_wise.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.subject_code}</td>
                <td>${s.subject_name}</td>
                <td>${s.marks_percentage !== null ? s.marks_percentage + '%' : 'N/A'}</td>
                <td>${s.grade || 'N/A'}</td>
                <td>${s.pass_fail || 'N/A'}</td>
                <td>${s.attendance_percentage !== null ? s.attendance_percentage + '%' : 'N/A'}</td>
                <td>${s.attendance_status || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Stats
    document.getElementById('overallPct').textContent = data.overall.avg_marks ? data.overall.avg_marks + '%' : 'N/A';
    document.getElementById('avgAttPct').textContent = data.overall.avg_attendance ? data.overall.avg_attendance + '%' : 'N/A';
    document.getElementById('perfStatus').textContent = data.overall.status;
    
    // For final result, we use the pass/fail count
    const result = data.overall.failed_subjects > 0 ? 'FAIL' : (data.overall.passed_subjects > 0 ? 'PASS' : 'N/A');
    document.getElementById('finalResult').textContent = result;
}

async function generateClassSummary() {
    const response = await fetch(`${API_BASE}/reports/class-summary`);
    const data = await response.json();
    
    const section = document.getElementById('classReportSection');
    section.style.display = 'block';
    
    document.getElementById('totalStudentsCount').textContent = data.total_students;
    document.getElementById('totalSubjectsCount').textContent = data.total_subjects;
    document.getElementById('studentsWithMarks').textContent = data.students_with_marks;
    document.getElementById('studentsPassed').textContent = data.students_passed;
    document.getElementById('studentsFailed').textContent = data.students_failed;
    document.getElementById('classAvgPct').textContent = data.class_average + '%';
}

let attendanceAllData = [];
async function generateAttendanceSummary() {
    const response = await fetch(`${API_BASE}/reports/attendance-summary`);
    attendanceAllData = await response.json();
    
    const section = document.getElementById('attendanceReportSection');
    section.style.display = 'block';
    
    filterReports(); // Apply initial filter
}

window.filterReports = function() {
    const type = document.getElementById('reportType').value;
    if (type !== 'attendance') return;
    
    const semester = document.getElementById('semesterSelector').value;
    const tbody = document.getElementById('attendanceSummaryTable');
    tbody.innerHTML = '';
    
    const filtered = semester 
        ? attendanceAllData.filter(d => d.semester.toString() === semester)
        : attendanceAllData;
        
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No records match the filter.</td></tr>';
        return;
    }
    
    filtered.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.student_id}</td>
            <td>${d.name}</td>
            <td>${d.semester}</td>
            <td>${d.avg_attendance.toFixed(2)}%</td>
            <td>${d.eligible_count}</td>
            <td>${d.shortage_count}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.printReport = function() {
    window.print();
}
