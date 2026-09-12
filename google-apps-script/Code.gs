// ========================================
// Kala Seva Attendance - Google Apps Script Backend
// ========================================
//
// IMPORTANT: Configure these values:
// 1. Replace YOUR_GOOGLE_SHEET_ID with your actual Google Sheet ID
// 2. Make sure your Google Sheet has two sheets: "Students" and "Attendance"
// 3. Deploy as Web App (anyone can access)
// See SETUP-ATTENDANCE.md for complete instructions
// ========================================

// ⚠️ REPLACE with your Google Sheet ID
// Find it in the URL: https://docs.google.com/spreadsheets/d/[ID_HERE]/edit
const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";

const STUDENTS_SHEET = "Students";
const ATTENDANCE_SHEET = "Attendance";

// ========================================
// Main Entry Point
// ========================================
function doGet(e) {
    const action = e.parameter.action;

    try {
        if (action === "students") {
            return getStudents();
        }

        if (action === "attendance") {
            return getAttendance(e);
        }

        // Default: API is running
        return jsonResponse({
            success: true,
            message: "Kala Seva Attendance API is running",
            version: "1.0"
        });

    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Error: " + error.toString()
        });
    }
}

// ========================================
// Handle POST Requests
// ========================================
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if (data.action === "saveAttendance") {
            return saveAttendance(data);
        }

        return jsonResponse({
            success: false,
            message: "Invalid action"
        });

    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Error: " + error.toString()
        });
    }
}

// ========================================
// Get Students
// ========================================
function getStudents() {
    try {
        const sheet = SpreadsheetApp
            .openById(SPREADSHEET_ID)
            .getSheetByName(STUDENTS_SHEET);

        const values = sheet.getDataRange().getValues();

        if (values.length < 2) {
            return jsonResponse({
                success: true,
                students: []
            });
        }

        // Skip header row
        const rows = values.slice(1);

        // Filter active students (column 6 = Active)
        const students = rows
            .filter(row => row[0] && row[6] === true)
            .map(row => ({
                id: row[0],
                name: row[1],
                course: row[2],
                batch: row[3],
                phone: row[4],
                joiningDate: formatDate(row[5]),
                active: row[6]
            }));

        Logger.log("✅ Fetched " + students.length + " active students");

        return jsonResponse({
            success: true,
            students: students
        });

    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Error fetching students: " + error.toString()
        });
    }
}

// ========================================
// Save Attendance with Duplicate Protection
// ========================================
function saveAttendance(data) {
    try {
        const attendanceDate = data.date;
        const attendanceRecords = data.attendance;

        if (!attendanceDate || !attendanceRecords || attendanceRecords.length === 0) {
            return jsonResponse({
                success: false,
                message: "Invalid attendance data"
            });
        }

        const sheet = SpreadsheetApp
            .openById(SPREADSHEET_ID)
            .getSheetByName(ATTENDANCE_SHEET);

        const allValues = sheet.getDataRange().getValues();
        const timestamp = new Date();

        let addedCount = 0;
        let updatedCount = 0;

        attendanceRecords.forEach(student => {
            // Check if record exists for this date + student
            const existingRowIndex = findAttendanceRecord(allValues, attendanceDate, student.id);

            if (existingRowIndex !== -1) {
                // Update existing record
                const row = existingRowIndex + 1; // Sheets are 1-indexed
                sheet.getRange(row, 6).setValue(student.status); // Update Status column
                sheet.getRange(row, 7).setValue(timestamp); // Update Marked At column
                updatedCount++;
                Logger.log("Updated: " + student.name + " on " + attendanceDate);
            } else {
                // Add new record
                sheet.appendRow([
                    attendanceDate,
                    student.id,
                    student.name,
                    student.course,
                    student.batch,
                    student.status,
                    timestamp
                ]);
                addedCount++;
                Logger.log("Added: " + student.name + " on " + attendanceDate);
            }
        });

        const message = `Saved attendance for ${attendanceDate}. Added: ${addedCount}, Updated: ${updatedCount}`;
        Logger.log("✅ " + message);

        return jsonResponse({
            success: true,
            message: message,
            added: addedCount,
            updated: updatedCount
        });

    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Error saving attendance: " + error.toString()
        });
    }
}

// ========================================
// Find Existing Attendance Record
// ========================================
function findAttendanceRecord(values, date, studentId) {
    for (let i = 1; i < values.length; i++) { // Skip header
        const row = values[i];
        const recordDate = formatDate(row[0]);
        const recordStudentId = row[1];

        if (recordDate === date && recordStudentId === studentId) {
            return i; // Return 0-indexed row number
        }
    }
    return -1; // Not found
}

// ========================================
// Get Attendance
// ========================================
function getAttendance(e) {
    try {
        const studentId = e.parameter.studentId;
        const date = e.parameter.date;
        const course = e.parameter.course;

        const sheet = SpreadsheetApp
            .openById(SPREADSHEET_ID)
            .getSheetByName(ATTENDANCE_SHEET);

        const values = sheet.getDataRange().getValues();

        if (values.length < 2) {
            return jsonResponse({
                success: true,
                attendance: []
            });
        }

        // Skip header row
        const rows = values.slice(1);

        const records = rows
            .filter(row => {
                // Filter by student ID if provided
                const matchesStudent = !studentId || row[1] === studentId;

                // Filter by date if provided (format as YYYY-MM-DD or YYYY-MM for month)
                let matchesDate = true;
                if (date) {
                    const recordDateStr = formatDate(row[0]);
                    if (date.length === 7) {
                        // Month filter (YYYY-MM)
                        matchesDate = recordDateStr.startsWith(date);
                    } else {
                        // Day filter (YYYY-MM-DD)
                        matchesDate = recordDateStr === date;
                    }
                }

                // Filter by course if provided
                const matchesCourse = !course || row[3] === course;

                return matchesStudent && matchesDate && matchesCourse;
            })
            .map(row => ({
                date: formatDate(row[0]),
                studentId: row[1],
                studentName: row[2],
                course: row[3],
                batch: row[4],
                status: row[5],
                markedAt: formatDate(row[6])
            }));

        Logger.log("✅ Fetched " + records.length + " attendance records");

        return jsonResponse({
            success: true,
            attendance: records
        });

    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Error fetching attendance: " + error.toString()
        });
    }
}

// ========================================
// Format Date
// ========================================
function formatDate(date) {
    if (!date) return "";

    if (date instanceof Date) {
        return Utilities.formatDate(
            date,
            Session.getScriptTimeZone(),
            "yyyy-MM-dd"
        );
    }

    // If it's a string
    if (typeof date === 'string') {
        return date.substring(0, 10); // Take first 10 chars (YYYY-MM-DD)
    }

    return "";
}

// ========================================
// JSON Response Helper
// ========================================
function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// Test Function (Run in Apps Script editor)
// ========================================
function testAPI() {
    Logger.log("Testing Kala Seva Attendance API...");

    // Test 1: Get students
    const students = getStudents();
    Logger.log("Students endpoint: " + students.getAs("string"));

    // Test 2: Get attendance
    const attendance = getAttendance({parameter: {}});
    Logger.log("Attendance endpoint: " + attendance.getAs("string"));

    Logger.log("✅ Tests complete");
}

