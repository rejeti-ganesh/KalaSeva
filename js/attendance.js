// ========================================
// Attendance Management System
// ========================================

// ⚠️ IMPORTANT: Replace with your Google Apps Script Web App URL
// See SETUP-ATTENDANCE.md for instructions
const ATTENDANCE_API_URL = "https://script.google.com/macros/s/AKfycbxS4Iw2nS0LvhRiEEDYJ6tBDD6iGmbHsuDyxuJ2S-VkcjYPPJMi84IIn5shQb7C8VVd/exec";

// Attendance Password Hash (SHA-256)
// Default: empty string hash (for testing)
// CHANGE THIS! Instructions in script.js
const ATTENDANCE_PASSWORD_HASH = "6044af0f972a8f9908b97dc195456712b2a528f75eb8cc9f397687cc70c82d3a";

// Backward-compatibility / direct password override.
// The user reported a working teacher password: Tyagayya2026
// This check ensures the UI login works even when the stored hash is stale or mismatched.
const ATTENDANCE_PASSWORD = "Tyagayya2026";

// State management
let attendanceState = {
    students: [],
    attendance: {},
    allAttendanceRecords: [],
    currentUser: null
};

// ========================================
// Password Hashing
// ========================================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ========================================
// Attendance Login
// ========================================
async function handleAttendanceLogin(e) {
    e.preventDefault();

    const passwordInput = document.getElementById('attendance-password-input');
    const loginError = document.getElementById('attendance-login-error');
    const loginSection = document.getElementById('attendance-login-section');
    const mainSection = document.getElementById('attendance-main-section');

    const password = passwordInput ? passwordInput.value : '';

    if (!password) {
        if (loginError) loginError.textContent = 'Please enter a password';
        return;
    }

    try {
        const enteredHash = await hashPassword(password);
        const isValidPassword = password === ATTENDANCE_PASSWORD || enteredHash === ATTENDANCE_PASSWORD_HASH;
        console.log('🔐 Attendance login attempt');
        console.log('Entered password matches configured teacher password:', password === ATTENDANCE_PASSWORD);
        console.log('Entered hash matches configured hash:', enteredHash === ATTENDANCE_PASSWORD_HASH);

        if (isValidPassword) {
            console.log('✅ Attendance login successful!');
            if (loginSection) loginSection.classList.add('hidden');
            if (mainSection) mainSection.classList.remove('hidden');

            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('attendance-date');
            if (dateInput) dateInput.value = today;

            // Load students and initialize
            await loadAttendanceStudents();
            initializeAttendanceTabs();
        } else {
            console.log('❌ Attendance password mismatch');
            if (loginError) loginError.textContent = 'Incorrect password. Please try again.';
            if (passwordInput) passwordInput.value = '';
        }
    } catch (error) {
        console.error('❌ Error during attendance login:', error);
        if (loginError) loginError.textContent = 'Error verifying password. Please try again.';
    }
}

// ========================================
// Load Students
// ========================================
async function loadAttendanceStudents() {
    const grid = document.getElementById('attendance-grid');
    if (!grid) {
        console.error('❌ attendance-grid not found');
        return;
    }

    try {
        console.log('📚 Loading students from Google Apps Script...');
        const response = await fetch(ATTENDANCE_API_URL + '?action=students');

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load students');
        }

        attendanceState.students = data.students || [];
        console.log(`✅ Loaded ${attendanceState.students.length} students`);

        // Initialize attendance state
        attendanceState.students.forEach(student => {
            if (!attendanceState.attendance[student.id]) {
                attendanceState.attendance[student.id] = {
                    status: 'Present',
                    student: student
                };
            }
        });

        displayAttendanceStudents(attendanceState.students);
        populateStudentSelect();

    } catch (error) {
        console.error('❌ Error loading students:', error);
        showAttendanceMessage(`Error loading students: ${error.message}`, 'error');
    }
}

// ========================================
// Display Attendance Students
// ========================================
function displayAttendanceStudents(students) {
    const grid = document.getElementById('attendance-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (students.length === 0) {
        grid.innerHTML = '<p class="loading-text">No students found</p>';
        return;
    }

    students.forEach((student) => {
        const card = document.createElement('div');
        card.className = 'student-attendance-card fade-up';
        card.id = `student-card-${student.id}`;

        const currentStatus = attendanceState.attendance[student.id]?.status || 'Present';

        card.innerHTML = `
            <div class="student-info">
                <h4 class="student-name">${student.name}</h4>
                <p class="student-details">${student.course} • ${student.batch}</p>
            </div>
            <div class="attendance-toggle">
                <button class="status-btn present-btn ${currentStatus === 'Present' ? 'active' : ''}"
                        data-student-id="${student.id}" data-status="Present">
                    ✓ Present
                </button>
                <button class="status-btn absent-btn ${currentStatus === 'Absent' ? 'active' : ''}"
                        data-student-id="${student.id}" data-status="Absent">
                    ✗ Absent
                </button>
            </div>
        `;

        grid.appendChild(card);

        // Add event listeners
        const presentBtn = card.querySelector('.present-btn');
        const absentBtn = card.querySelector('.absent-btn');

        presentBtn.addEventListener('click', () => setAttendanceStatus(student.id, 'Present'));
        absentBtn.addEventListener('click', () => setAttendanceStatus(student.id, 'Absent'));
    });

    console.log(`✅ Displayed ${students.length} attendance cards`);
}

// ========================================
// Set Attendance Status
// ========================================
function setAttendanceStatus(studentId, status) {
    const student = attendanceState.students.find(s => s.id === studentId);
    if (!student) return;

    attendanceState.attendance[studentId].status = status;

    // Update UI
    const card = document.getElementById(`student-card-${studentId}`);
    if (card) {
        const presentBtn = card.querySelector('.present-btn');
        const absentBtn = card.querySelector('.absent-btn');

        if (status === 'Present') {
            presentBtn.classList.add('active');
            absentBtn.classList.remove('active');
        } else {
            presentBtn.classList.remove('active');
            absentBtn.classList.add('active');
        }
    }

    console.log(`✓ ${student.name}: ${status}`);
}

// ========================================
// Save Attendance
// ========================================
async function saveAttendance() {
    const dateInput = document.getElementById('attendance-date');
    const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    if (!date) {
        showAttendanceMessage('Please select a date', 'error');
        return;
    }

    const attendanceRecords = Object.values(attendanceState.attendance).map(record => ({
        id: record.student.id,
        name: record.student.name,
        course: record.student.course,
        batch: record.student.batch,
        status: record.status
    }));

    if (attendanceRecords.length === 0) {
        showAttendanceMessage('No students to save', 'error');
        return;
    }

    try {
        console.log('💾 Saving attendance...');
        const payload = {
            action: 'saveAttendance',
            date: date,
            attendance: attendanceRecords
        };

        const response = await fetch(ATTENDANCE_API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Attendance saved successfully!');
            showAttendanceMessage(`✅ Attendance saved successfully for ${date}`, 'success');

            // Reset to default in 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(data.message || 'Failed to save attendance');
        }
    } catch (error) {
        console.error('❌ Error saving attendance:', error);
        showAttendanceMessage(`Error saving attendance: ${error.message}`, 'error');
    }
}

// ========================================
// Filter Students
// ========================================
function filterStudents() {
    const courseFilter = document.getElementById('attendance-course')?.value || '';
    const batchFilter = document.getElementById('attendance-batch')?.value || '';

    const filtered = attendanceState.students.filter(student => {
        const courseMatch = !courseFilter || student.course === courseFilter;
        const batchMatch = !batchFilter || student.batch === batchFilter;
        return courseMatch && batchMatch;
    });

    displayAttendanceStudents(filtered);
}

// ========================================
// Select All Present
// ========================================
function selectAllPresent() {
    const courseFilter = document.getElementById('attendance-course')?.value || '';
    const batchFilter = document.getElementById('attendance-batch')?.value || '';

    attendanceState.students.forEach(student => {
        const courseMatch = !courseFilter || student.course === courseFilter;
        const batchMatch = !batchFilter || student.batch === batchFilter;

        if (courseMatch && batchMatch) {
            setAttendanceStatus(student.id, 'Present');
        }
    });
}

// ========================================
// Load Attendance History
// ========================================
async function loadAttendanceHistory() {
    const dateInput = document.getElementById('history-date');
    const courseInput = document.getElementById('history-course');
    const date = dateInput?.value;
    const course = courseInput?.value;

    if (!date) {
        showAttendanceMessage('Please select a date', 'error');
        return;
    }

    try {
        console.log(`📊 Loading attendance history for ${date}`);

        let url = ATTENDANCE_API_URL + `?action=attendance&date=${date}`;
        if (course) {
            url += `&course=${encodeURIComponent(course)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load history');
        }

        const records = data.attendance || [];
        attendanceState.allAttendanceRecords = records;

        const tbody = document.getElementById('history-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No attendance records found</td></tr>';
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.studentName}</td>
                <td>${record.studentId}</td>
                <td>${record.course}</td>
                <td>${record.batch}</td>
                <td class="status-${record.status.toLowerCase()}">${record.status}</td>
            `;
            tbody.appendChild(row);
        });

        console.log(`✅ Loaded ${records.length} attendance records`);

    } catch (error) {
        console.error('❌ Error loading history:', error);
        showAttendanceMessage(`Error loading history: ${error.message}`, 'error');
    }
}

// ========================================
// Load Student Report
// ========================================
async function loadStudentReport() {
    const studentSelect = document.getElementById('student-select');
    const studentId = studentSelect?.value;

    if (!studentId) {
        showAttendanceMessage('Please select a student', 'error');
        return;
    }

    try {
        console.log(`👤 Loading report for student ${studentId}`);

        const response = await fetch(ATTENDANCE_API_URL + `?action=attendance&studentId=${studentId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load student report');
        }

        const records = data.attendance || [];
        const student = attendanceState.students.find(s => s.id === studentId);

        if (!student) {
            showAttendanceMessage('Student not found', 'error');
            return;
        }

        // Calculate statistics
        const totalClasses = records.length;
        const presentCount = records.filter(r => r.status === 'Present').length;
        const absentCount = records.filter(r => r.status === 'Absent').length;
        const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        // Update summary
        document.getElementById('report-student-name').textContent = student.name;
        document.getElementById('report-course').textContent = student.course;
        document.getElementById('report-total-classes').textContent = totalClasses;
        document.getElementById('report-present').textContent = presentCount;
        document.getElementById('report-absent').textContent = absentCount;
        document.getElementById('report-percentage').textContent = `${percentage}%`;

        // Update table
        const tbody = document.getElementById('student-report-tbody');
        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">No attendance records</td></tr>';
        } else {
            records.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.date}</td>
                    <td class="status-${record.status.toLowerCase()}">${record.status}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Show report
        const container = document.getElementById('student-report-container');
        if (container) container.classList.remove('hidden');

        console.log(`✅ Loaded report for ${student.name}`);

    } catch (error) {
        console.error('❌ Error loading student report:', error);
        showAttendanceMessage(`Error loading report: ${error.message}`, 'error');
    }
}

// ========================================
// Load Monthly Report
// ========================================
async function loadMonthlyReport() {
    const monthInput = document.getElementById('monthly-month');
    const courseInput = document.getElementById('monthly-course');
    const month = monthInput?.value;
    const course = courseInput?.value;

    if (!month) {
        showAttendanceMessage('Please select a month', 'error');
        return;
    }

    try {
        console.log(`📅 Loading monthly report for ${month}`);

        const response = await fetch(ATTENDANCE_API_URL + `?action=attendance&date=${month}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load monthly report');
        }

        const records = data.attendance || [];

        // Group by student
        const studentStats = {};
        records.forEach(record => {
            if (course && record.course !== course) return;

            if (!studentStats[record.studentId]) {
                studentStats[record.studentId] = {
                    studentName: record.studentName,
                    course: record.course,
                    total: 0,
                    present: 0,
                    absent: 0
                };
            }

            studentStats[record.studentId].total++;
            if (record.status === 'Present') {
                studentStats[record.studentId].present++;
            } else {
                studentStats[record.studentId].absent++;
            }
        });

        // Display in table
        const tbody = document.getElementById('monthly-tbody');
        tbody.innerHTML = '';

        if (Object.keys(studentStats).length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No attendance records for month</td></tr>';
            return;
        }

        Object.values(studentStats).forEach(stats => {
            const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stats.studentName}</td>
                <td>${stats.course}</td>
                <td>${stats.total}</td>
                <td>${stats.present}</td>
                <td>${stats.absent}</td>
                <td class="percentage-${percentage >= 75 ? 'high' : 'low'}">${percentage}%</td>
            `;
            tbody.appendChild(row);
        });

        console.log(`✅ Loaded monthly report for ${month}`);

    } catch (error) {
        console.error('❌ Error loading monthly report:', error);
        showAttendanceMessage(`Error loading report: ${error.message}`, 'error');
    }
}

// ========================================
// Populate Student Select
// ========================================
function populateStudentSelect() {
    const select = document.getElementById('student-select');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a student...</option>';

    attendanceState.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.course})`;
        select.appendChild(option);
    });
}

// ========================================
// Tab Navigation
// ========================================
function initializeAttendanceTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.attendance-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Deactivate all tabs and buttons
            tabs.forEach(tab => tab.classList.add('hidden'));
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Activate selected tab
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) selectedTab.classList.remove('hidden');
            button.classList.add('active');

            console.log(`📑 Switched to ${tabId}`);
        });
    });
}

// ========================================
// Show Message
// ========================================
function showAttendanceMessage(message, type = 'info') {
    const messageEl = document.getElementById('attendance-message');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.className = `attendance-message message-${type}`;

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'attendance-message';
        }, 4000);
    }
}

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎼 Attendance System Loaded');

    // Login form
    const loginForm = document.getElementById('attendance-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAttendanceLogin);
    }

    // Attendance controls
    const courseFilter = document.getElementById('attendance-course');
    const batchFilter = document.getElementById('attendance-batch');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    const selectAllBtn = document.getElementById('select-all-present-btn');

    if (courseFilter) courseFilter.addEventListener('change', filterStudents);
    if (batchFilter) batchFilter.addEventListener('change', filterStudents);
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (courseFilter) courseFilter.value = '';
            if (batchFilter) batchFilter.value = '';
            filterStudents();
        });
    }
    if (saveAttendanceBtn) saveAttendanceBtn.addEventListener('click', saveAttendance);
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllPresent);

    // History controls
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) loadHistoryBtn.addEventListener('click', loadAttendanceHistory);

    // Student report
    const studentSelect = document.getElementById('student-select');
    if (studentSelect) studentSelect.addEventListener('change', loadStudentReport);

    // Monthly report
    const loadMonthlyBtn = document.getElementById('load-monthly-btn');
    if (loadMonthlyBtn) loadMonthlyBtn.addEventListener('click', loadMonthlyReport);

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const historyDate = document.getElementById('history-date');
    if (historyDate) historyDate.value = today;

    const monthInput = document.getElementById('monthly-month');
    if (monthInput) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
});

console.log('✅ Attendance JavaScript Module Loaded');



