# 🚀 Examify Quick Start Guide

## Step 1: Start the Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
🚀 Server on port 5000
```

## Step 2: Start the Frontend Client

In a new terminal:
```bash
cd client
npm run dev
```

You'll see a Vite dev server starting (usually http://localhost:5173)

## Step 3: Create Test Accounts

### Create Admin Account (for creating exams)
Visit the Login page and click "Sign up" or register:
- **Name**: Admin User
- **Email**: `admin@sym.com` (must contain @sym)
- **Password**: Any password
- **Role**: Admin

### Create Student Account
- **Name**: Alice Johnson
- **Email**: `alice@stu.com` (must contain @stu)
- **Password**: Any password
- **Role**: Student

## Step 4: Seed Sample Exams

1. Login as admin with `admin@sym.com`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this command:

```javascript
fetch('http://localhost:5000/api/seed/seed-exams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log)
```

You should see successful response with 6 exams created.

## Step 5: Login as Student

1. Logout from admin account
2. Login with `alice@stu.com`
3. You'll see the Student Dashboard

## Step 6: Explore the Dashboard

### Dashboard Tab (Default)
- See welcome message
- View upcoming exams
- See recent results
- Check average percentage and total exams

### Upcoming Exams Tab
- View all exams in list format
- Click search bar and try searching:
  - Type "software" to find Software Engineering exam
  - Type "SE-301" to find by course code
  - Type "Dr. Deekshant" to find by instructor

### Grades Tab
- Currently empty (no grades yet)

## Step 7: Seed Sample Grades (Optional)

To add grades for the student:

1. Get the student's ID from the browser console:
```javascript
JSON.parse(localStorage.getItem('examifyUser'))._id
```

2. Create admin again and run:
```javascript
const studentId = "paste_student_id_here";
fetch('http://localhost:5000/api/seed/seed-grades', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('examifyToken')}`
  },
  body: JSON.stringify({ studentId })
}).then(r => r.json()).then(console.log)
```

## 📌 Important Notes

- Emails must have correct domain:
  - Students: `@stu`
  - Teachers: `@teach`
  - Admin: `@sym`

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

- All data is stored in MongoDB
- JWT tokens are stored in localStorage

## 🎯 What You Should See

### When searching for exams:
- Results update in real-time
- Shows subject, instructor, course code
- Shows exam date/time and duration
- Shows total marks

### When clicking Grades:
- Shows marks obtained vs total
- Percentage display
- Automatic grade assignment
- Colored grade badges

### Search Results:
- "Software" → Shows Software Engineering exam
- "SE-301" → Shows exam by course code
- "Dr. Deekshant" → Shows exams by instructor

## ✅ Success Indicators

- ✅ Exams appear in dashboard and upcoming exams tab
- ✅ Search filters exams correctly
- ✅ Grades show with color-coded badges
- ✅ Average percentage calculates correctly
- ✅ No console errors in DevTools

## 🐛 Troubleshooting

If something doesn't work:

1. **Clear localStorage**: 
   ```javascript
   localStorage.clear()
   ```
   Then refresh and try again

2. **Check backend is running**: 
   Visit `http://localhost:5000` - should see "Examify API is Running..."

3. **Check frontend errors**: 
   Open DevTools (F12) → Console tab to see any errors

4. **Restart both servers** and try again

---

**Happy Testing! 🎓**
