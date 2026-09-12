# 📋 Kala Seva Attendance Management System - Setup Guide

Complete step-by-step setup for the attendance management system using Google Sheets + Google Apps Script.

---

## **Architecture Overview**

```
GitHub Pages (attendance.html + attendance.js)
              ↓
         fetch() calls
              ↓
Google Apps Script Web App (Code.gs)
              ↓
Google Sheets (Students + Attendance)
```

---

## **Prerequisites**

- GitHub Pages repository (Kala Seva website)
- Google Account
- Access to create Google Sheets
- Access to Google Apps Script

---

## **STEP 1: Create Google Sheet**

### 1.1 Create new Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Create"** → **Blank spreadsheet**
3. Name it: **`Kala Seva Attendance`**
4. Save it

### 1.2 Get the Sheet ID

1. Open the sheet
2. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```
3. **Save this ID** - you'll need it in Step 3

---

## **STEP 2: Create Sheet Structure**

### 2.1 Create "Students" Sheet

#### Rename the first sheet to "Students"

**Columns:**
```
A: ID
B: Name
C: Course
D: Batch
E: Phone
F: Joining Date
G: Active
```

#### Example data:

| ID  | Name | Course        | Batch   | Phone      | Joining Date | Active |
|-----|------|---------------|---------|------------|--------------|--------|
| S001| Ravi | Flute         | Evening | 9876543210 | 2026-05-01   | TRUE   |
| S002| Anu  | Carnatic Vocal| Evening | 9876543211 | 2026-05-05   | TRUE   |
| S003| Sai  | Flute         | Weekend | 9876543212 | 2026-05-10   | TRUE   |

**Format:**
- **A (ID):** Text (e.g., S001, S002)
- **B (Name):** Text
- **C (Course):** Text (Flute / Carnatic Vocal)
- **D (Batch):** Text (Morning / Evening / Weekend)
- **E (Phone):** Text (10 digits)
- **F (Joining Date):** Date (YYYY-MM-DD)
- **G (Active):** Checkbox (TRUE/FALSE)

> **Note:** Only students with **Active = TRUE** will appear in the attendance system.

---

### 2.2 Create "Attendance" Sheet

Right-click the sheet tab → **Insert sheet** → Name it **"Attendance"**

**Columns:**
```
A: Date
B: Student ID
C: Student Name
D: Course
E: Batch
F: Status
G: Marked At
```

**Format:**
- **A (Date):** Date (YYYY-MM-DD)
- **B (Student ID):** Text
- **C (Student Name):** Text
- **D (Course):** Text
- **E (Batch):** Text
- **F (Status):** Text (Present / Absent)
- **G (Marked At):** Date & Time

> **Leave this sheet empty initially** - it will be populated by the attendance system.

---

## **STEP 3: Create Google Apps Script Backend**

### 3.1 Open Google Apps Script Editor

1. In your "Kala Seva Attendance" sheet
2. Click **Extensions** → **Apps Script**
3. A new tab opens with the code editor

### 3.2 Replace default code

1. Delete all default code
2. Copy the entire content from: **`google-apps-script/Code.gs`**
3. Paste it into the Apps Script editor

### 3.3 Configure the Sheet ID

1. Find this line in **Code.gs**:
   ```javascript
   const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";
   ```

2. Replace `YOUR_GOOGLE_SHEET_ID` with your actual Sheet ID (from Step 1.2)

   Example:
   ```javascript
   const SPREADSHEET_ID = "1abc-XyZ_2defghijklMnOpQrStUvWxYz123";
   ```

3. **Save** the project (Ctrl+S)

### 3.4 Test the Script

1. Choose **`testAPI`** from the function dropdown (top-middle)
2. Click **Run** (play button)
3. Check **Execution log** at the bottom for any errors
4. You should see success messages

---

## **STEP 4: Deploy as Web App**

### 4.1 Create deployment

1. In Apps Script editor, click **Deploy** (top-right)
2. Click **New deployment**
3. Choose deployment type: **Web app**

### 4.2 Configure permissions

1. **Execute as:** Select your Google Account
2. **Who has access:** Select **"Anyone"**
3. Click **Deploy**

### 4.3 Copy Web App URL

1. A dialog appears with: **"Deployment successful"**
2. Copy the URL that looks like:
   ```
   https://script.google.com/macros/d/[DEPLOYMENT_ID]/userweb
   ```
3. **Save this URL** - you'll need it in Step 5

> **Important:** Anyone with this URL can access your attendance system. 
> The password protection (in attendance.html) adds a layer of security.

---

## **STEP 5: Configure Frontend**

### 5.1 Update attendance.js

1. Open **`js/attendance.js`**
2. Find this line (around line 7):
   ```javascript
   const ATTENDANCE_API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";
   ```

3. Replace with your Web App URL from Step 4.3

   Example:
   ```javascript
   const ATTENDANCE_API_URL = "https://script.google.com/macros/d/1abc-XyZ_ghijklMnOpQrStUvWxYz123/userweb";
   ```

4. **Save** the file

### 5.2 Set Attendance Password

The attendance system uses SHA-256 password hashing.

#### Option A: Use Empty Password (FOR TESTING ONLY)

The default password hash is already set to empty string. No changes needed.

#### Option B: Set Your Own Password

1. Open browser **Developer Console** (F12 → Console tab)

2. Run this command:
   ```javascript
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD_HERE'))
       .then(hash => Array.from(new Uint8Array(hash))
       .map(b => b.toString(16).padStart(2, '0')).join(''))
       .then(hashHex => console.log('Password hash:', hashHex))
   ```

3. Replace `YOUR_PASSWORD_HERE` with your desired password

4. Copy the output hash (it will be a long string like `abc123def456...`)

5. In **`script.js`**, find this line (around line 12):
   ```javascript
   const ATTENDANCE_PASSWORD_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
   ```

6. Replace with your hash:
   ```javascript
   const ATTENDANCE_PASSWORD_HASH = "your_hash_here";
   ```

7. **Save** the file

---

## **STEP 6: Update Navigation**

Add attendance link to navbar in HTML files:

### 6.1 Update index.html

Find the navbar menu and add:
```html
<li class="nav-item"><a href="attendance.html" class="nav-link">Attendance</a></li>
```

### 6.2 Update contact.html

Add the same link to the navbar menu.

### 6.3 Update notes.html

Add the same link to the navbar menu.

---

## **STEP 7: Push to GitHub**

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Add attendance management system"
   git push origin main
   ```

2. Wait for GitHub Pages to rebuild (1-2 minutes)

3. Your attendance page will be live at:
   ```
   https://rejeti.in/attendance.html
   ```

---

## **STEP 8: Test the System**

### 8.1 Test Login

1. Go to your attendance page: `https://rejeti.in/attendance.html`
2. Enter the password (empty password = just click Access)
3. You should see the attendance marking interface

### 8.2 Test Marking Attendance

1. Select a date (defaults to today)
2. All active students should appear
3. Mark some as Present, some as Absent
4. Click **"Save Attendance"**
5. You should see a success message
6. Check your Google Sheet's "Attendance" tab for new records

### 8.3 Test History

1. Click the **"History"** tab
2. Select a date
3. Click **"Load History"**
4. You should see attendance records for that date

### 8.4 Test Student Report

1. Click the **"Student Report"** tab
2. Select a student
3. You should see their total classes, present/absent counts, and percentage
4. Verify the math is correct

### 8.5 Test Monthly Report

1. Click the **"Monthly Report"** tab
2. Select a month and course
3. Click **"Load Report"**
4. You should see a summary for all students in that month

---

## **Features in Attendance System**

### ✅ Mark Attendance
- Select date, course, and batch
- Default all students to Present
- Click Present/Absent to toggle
- Save to Google Sheets

### ✅ Attendance History
- View attendance for any date
- Filter by course
- See all recorded attendance

### ✅ Student Report
- Select a student
- View total classes, present, absent
- Calculate attendance percentage
- See all attendance records for that student

### ✅ Monthly Report
- View all students' attendance for a month
- Shows total classes, present, absent, percentage
- Filter by course
- Easy overview for all classes

### ✅ Duplicate Protection
- If you mark attendance twice for same date + student
- The system updates the existing record
- Prevents duplicate entries

### ✅ Mobile Friendly
- Works on phones, tablets, desktops
- Touch-friendly buttons
- Responsive design matching website

---

## **Troubleshooting**

### Problem: "API Error" when logging in

**Solution:**
1. Check that **ATTENDANCE_API_URL** is correctly set in `attendance.js`
2. Check that Web App is deployed (Step 4)
3. Check that Sheet ID is correct in **Code.gs**

### Problem: No students appear

**Solution:**
1. Check that students are in the Google Sheet with **Active = TRUE**
2. Run the test function in Apps Script (Step 3.4)
3. Check browser console (F12) for error messages

### Problem: Attendance not saving

**Solution:**
1. Check that Apps Script has access to your Google Sheet
2. Check that "Attendance" sheet exists and has correct columns
3. Check browser console for error messages
4. Try running testAPI() in Apps Script editor

### Problem: Can't log in with password

**Solution:**
1. For testing, use empty password
2. Check that **ATTENDANCE_PASSWORD_HASH** is correctly set in `script.js`
3. Make sure you copied the full hash string

### Problem: Historical data not showing

**Solution:**
1. Make sure attendance was previously saved (records exist in sheet)
2. Try using the date picker to select the exact date
3. Check the "Attended" sheet in Google Sheets to verify data exists

---

## **Security Notes**

### ⚠️ Password Security
- The password hash is SHA-256
- It's stored in a public GitHub repository
- This is NOT suitable for highly sensitive data
- For production, add proper authentication (Google Login, etc.)

### ⚠️ API Security
- Your Google Apps Script Web App URL is public
- Anyone with the URL can call the API
- Currently, only the password protects it
- For production, add additional authentication layers

### ✅ Data Privacy
- Your Google Sheet is private (not shared)
- Only the Apps Script can access it
- No data is stored on GitHub Pages

---

## **Future Enhancements**

These features can be added later:

1. **Admin Dashboard** - Overview of all classes
2. **Student Login** - Students see their own attendance
3. **Parent Notifications** - WhatsApp/Email when child absent
4. **Fee Integration** - Link attendance to fee management
5. **Excel Export** - Export reports as files
6. **Charts & Graphs** - Visual attendance trends
7. **SMS Reminders** - Automated notifications
8. **Multi-year Support** - Archive old data
9. **Integration Tests** - Automated testing
10. **Batch Management** - Create/edit batches in UI

---

## **Support & Next Steps**

### ✅ Completed
- Attendance marking system
- History viewing
- Student reports
- Monthly reports
- Password protection
- Google Sheets integration
- Mobile-responsive design

### 📝 Document Everything
- Keep this guide handy
- Document your Sheet ID, Web App URL
- Keep backups of Google Sheet

### 🔄 Maintenance
- Monitor Google Sheet for data integrity
- Backup Google Sheets periodically
- Update password periodically
- Monitor Apps Script logs for errors

---

## **Quick Reference**

**Attendance Page:** `https://rejeti.in/attendance.html`

**Configuration Files:**
- Attendance: `js/attendance.js` (API URL, password hash)
- Backend: `google-apps-script/Code.gs` (Sheet ID)

**Google Sheets:**
- Name: `Kala Seva Attendance`
- Sheets: `Students`, `Attendance`

**Supported Courses:**
- Flute
- Carnatic Vocal

**Supported Batches:**
- Morning
- Evening
- Weekend

---

**Created for Kala Seva Sangeetha Sikshana** 🎼
**Version 1.0** - August 2026

