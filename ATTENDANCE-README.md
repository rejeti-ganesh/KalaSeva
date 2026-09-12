# 🎼 Kala Seva Attendance Management System

Complete implementation of an attendance management system for Kala Seva Sangeetha Sikshana music academy using GitHub Pages, Google Sheets, and Google Apps Script.

---

## ✅ Implementation Complete

The attendance system has been fully implemented with:

### **Frontend** (GitHub Pages)
- ✅ `attendance.html` - Beautiful, responsive attendance interface
- ✅ `js/attendance.js` - Complete attendance management logic
- ✅ `style.css` - Attendance-specific styling
- ✅ Updated navbar across all pages
- ✅ Updated footers with attendance link
- ✅ Mobile-friendly design

### **Backend** (Google Apps Script)
- ✅ `google-apps-script/Code.gs` - RESTful API backend
- ✅ Student management endpoints
- ✅ Attendance saving with duplicate protection
- ✅ Attendance history retrieval
- ✅ Advanced filtering (date, student, course)

### **Database** (Google Sheets)
- ✅ `Students` sheet structure defined
- ✅ `Attendance` sheet structure defined
- ✅ Ready for your data

### **Documentation**
- ✅ `SETUP-ATTENDANCE.md` - Complete step-by-step setup guide
- ✅ Troubleshooting section included

---

## 🚀 Quick Start

### **1. Create Google Sheet**
Create a new Google Sheet called `Kala Seva Attendance` and remember its ID from the URL.

### **2. Add Sheet Structure**
- Create `Students` sheet with columns: ID, Name, Course, Batch, Phone, Joining Date, Active
- Create `Attendance` sheet with columns: Date, Student ID, Student Name, Course, Batch, Status, Marked At

### **3. Deploy Google Apps Script**
1. Open the sheet → Extensions → Apps Script
2. Copy content from `google-apps-script/Code.gs`
3. Replace `YOUR_GOOGLE_SHEET_ID` with your actual sheet ID
4. Deploy as Web App (Execute as: You, Who has access: Anyone)
5. Copy the Web App URL

### **4. Configure Frontend**
1. In `js/attendance.js`, replace:
   - `ATTENDANCE_API_URL` with your Google Apps Script Web App URL
   - `ATTENDANCE_PASSWORD_HASH` with your password hash (optional - default is empty for testing)

2. In `script.js`, optionally update:
   - `ATTENDANCE_PASSWORD_HASH` if you want to set a custom teacher password

### **5. Push to GitHub**
```bash
git add .
git commit -m "Add attendance management system"
git push origin main
```

### **6. Test**
Visit `https://your-domain.com/attendance.html` and start using the system!

---

## 📋 Features Included

### ✅ Attendance Marking
- Select date, course, and batch
- Default all students to Present
- Toggle Present/Absent for each student
- Save attendance with single click
- See success message with number of records updated

### ✅ Duplicate Protection
- If you mark attendance twice for same date + student
- System updates existing record instead of creating duplicate
- Allows correcting attendance later

### ✅ Attendance History
- View attendance for any date
- Filter by course
- See all historical records in table format
- Status badges for visual clarity

### ✅ Student Report
- View individual student attendance statistics
- Shows: Total classes, Present, Absent, Percentage
- Detailed records for each attendance
- Color-coded attendance percentage

### ✅ Monthly Report
- View all students' attendance for a month
- Shows: Student, Course, Total Classes, Present, Absent, Percentage
- Filter by course
- Color-coded percentages (green for >75%, orange for <75%)

### ✅ Mobile Friendly
- Works on phones, tablets, desktops
- Touch-friendly buttons (minimum 44px tap targets)
- Responsive grid layout
- Mobile-optimized tables and controls

### ✅ Password Protected
- Separate password for attendance (different from notes)
- SHA-256 hashing
- Easy to change password
- See SETUP-ATTENDANCE.md for instructions

---

## 📁 File Structure

```
KalaSeva/
├── attendance.html                    # Main attendance page
├── js/
│   └── attendance.js                  # Attendance management logic
├── google-apps-script/
│   └── Code.gs                        # Google Apps Script backend
├── SETUP-ATTENDANCE.md                # Complete setup guide
├── README.md                          # This file
├── script.js                          # Updated with attendance password
├── style.css                          # Updated with attendance styles
├── index.html                         # Updated navbar
├── contact.html                       # Updated navbar
└── notes.html                         # Already has navbar link
```

---

## 🔐 Password Configuration

### Default Setup (Empty Password)
The default implementation uses an empty password for testing. No configuration needed.

Simply click **"Access Attendance"** without entering anything.

### Set Your Own Password

1. Open browser console (F12 → Console)

2. Run this command (replace YOUR_PASSWORD):
   ```javascript
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
       .then(hash => Array.from(new Uint8Array(hash))
       .map(b => b.toString(16).padStart(2, '0')).join(''))
       .then(hashHex => console.log('Your Hash:', hashHex))
   ```

3. Copy the output hash

4. Update `script.js`:
   ```javascript
   const ATTENDANCE_PASSWORD_HASH = "your_hash_here";
   ```

5. Commit and push to GitHub

---

## 🎯 How to Use

### Marking Attendance
1. Go to attendance.html
2. Enter password (or click Access for empty password)
3. Page loads students automatically
4. Select filters (course/batch) if needed
5. Change any "Absent" students
6. Click "Save Attendance"
7. Success message shows - attendance is saved!

### Viewing History
1. Click "History" tab
2. Select a date
3. (Optional) Filter by course
4. Click "Load History"
5. See all attendance for that date

### Student Report
1. Click "Student Report" tab
2. Select a student from dropdown
3. See total classes, attendance percentage, and all records

### Monthly Report
1. Click "Monthly Report" tab
2. Select a month and year
3. (Optional) Filter by course
4. Click "Load Report"
5. See all students' attendance summary for that month

---

## 🐛 Troubleshooting

### Problem: "API Error" or "Cannot connect to API"

**Solution:**
1. Check `ATTENDANCE_API_URL` in `js/attendance.js` is correct
2. Verify Google Apps Script is deployed
3. Check browser console (F12) for specific error
4. Verify Google Sheet has correct ID in `Code.gs`

### Problem: No students appear

**Solution:**
1. Ensure students are in Google Sheet with `Active = TRUE`
2. Check `Students` sheet has correct columns
3. Verify permissions - Sheet must be accessible to Apps Script
4. Refresh the page

### Problem: Attendance won't save

**Solution:**
1. Check `Attendance` sheet exists and has correct columns
2. Verify date is selected
3. Check browser console for error messages
4. Ensure Apps Script has permission to modify sheet

### Problem: Can't log in

**Solution:**
1. Default is empty password - just click "Access Attendance"
2. If using custom password, verify hash in `script.js`
3. Clear browser cache and try again

---

## 📊 Database Structure

### Students Sheet
```
ID    Name    Course           Batch    Phone          Joining Date  Active
S001  Ravi    Flute           Evening  9876543210     2026-05-01    TRUE
S002  Anu     Carnatic Vocal  Evening  9876543211     2026-05-05    TRUE
S003  Sai     Flute           Weekend  9876543212     2026-05-10    TRUE
```

### Attendance Sheet
```
Date       Student ID  Name   Course    Batch    Status    Marked At
2026-08-21 S001        Ravi   Flute     Evening  Present   2026-08-21 17:30
2026-08-21 S002        Anu    Vocal     Evening  Absent    2026-08-21 17:30
```

---

## 🔧 API Endpoints

All endpoints available on your Google Apps Script Web App URL:

### GET /students
Returns list of active students
```
?action=students
```

### GET /attendance
Returns attendance records (with optional filters)
```
?action=attendance                          # All records
?action=attendance&date=2026-08-21         # Specific date
?action=attendance&studentId=S001          # Specific student
?action=attendance&date=2026-08&course=Flute  # Month + course
```

### POST /attendance
Saves attendance (updates if exists, creates if new)
```json
{
  "action": "saveAttendance",
  "date": "2026-08-21",
  "attendance": [
    {
      "id": "S001",
      "name": "Ravi",
      "course": "Flute",
      "batch": "Evening",
      "status": "Present"
    }
  ]
}
```

---

## 🎨 Customization

### Change Colors
Colors are defined in `style.css` CSS variables:
```css
:root {
    --saffron: #FF9933;   /* Primary color */
    --maroon: #800000;    /* Headings */
    --gold: #D4AF37;      /* Accents */
}
```

### Supported Courses
Edit in `attendance.html` (Course select dropdown) and `google-apps-script/Code.gs`:
```
Flute
Carnatic Vocal
```

### Supported Batches
Edit in `attendance.html` (Batch select dropdown):
```
Morning
Evening
Weekend
```

---

## 🔒 Security Notes

### Current Security
- Frontend password protection (SHA-256)
- Google Apps Script Web App URL is public but requires knowledge to access
- Google Sheet is private (not shared publicly)

### For Production
Consider adding:
1. Google OAuth login
2. Rate limiting on API
3. Audit logging
4. IP whitelisting
5. HTTPS enforcement
6. Data encryption

---

## 📈 Future Enhancements

Can be added later:
- Admin dashboard with analytics
- Student login to view own attendance
- Parent notifications via WhatsApp/Email
- Fee integration with attendance
- Excel/PDF export
- Attendance charts and trends
- Student performance analytics
- Batch management interface
- Automated reminders
- Multi-year archive

---

## 💡 Tips & Best Practices

1. **Backup your Google Sheet regularly** - It's your source of truth
2. **Monitor Apps Script logs** - Check for errors in execution log
3. **Test after each change** - Always test locally before pushing
4. **Use specific dates** - Avoid typos in date format (YYYY-MM-DD)
5. **Update password seasonally** - Change password every 3 months
6. **Document student changes** - Keep notes when adding/removing students
7. **Review reports monthly** - Check for missing class patterns

---

## ❓ FAQ

**Q: Can students see the attendance system?**
A: No, they can't access it without the password. You can enable this later by creating a separate student portal.

**Q: What if I make a mistake marking attendance?**
A: Go to History tab, but note that currently you can't edit existing records through UI. You'd need to edit the Google Sheet directly or mark attendance again (it will update the existing record).

**Q: How do I remove a student from attendance?**
A: Set their `Active` field to FALSE in the Students sheet. They won't appear in the next attendance marking.

**Q: Can I have multiple teachers?**
A: Currently all teachers use the same password. To have different passwords, you'd need to modify the code to use email/username login.

**Q: Does this work offline?**
A: No, it requires internet connection to access Google Sheets via Apps Script.

**Q: How large can my student database be?**
A: Google Sheets can handle thousands of rows. Recommend archiving old attendance annually.

---

## 📞 Support

For issues:
1. Check `SETUP-ATTENDANCE.md` troubleshooting section
2. Check browser console (F12) for errors
3. Check Google Apps Script execution log
4. Verify file paths and configurations are correct

---

## 📝 Version History

**v1.0** (August 21, 2026)
- Initial release
- Complete attendance marking system
- History, student report, monthly report
- Google Sheets integration
- Google Apps Script backend
- Mobile-responsive design
- Password protection

---

**Created for Kala Seva Sangeetha Sikshana** 🎼

*Preserving Tradition Through Music*

