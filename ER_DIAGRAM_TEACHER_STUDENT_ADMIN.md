# ER Diagram - Teacher, Student, Admin Focused
## Examify System - Role-Based Entity Relationships

---

## **🎯 COMPLETE ER DIAGRAM - ROLE PERSPECTIVE**

```
                         ┌─────────────────────────┐
                         │   SYSTEM ROLES          │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
        ┌───────────┐          ┌──────────┐          ┌──────────┐
        │ TEACHER   │          │ STUDENT  │          │  ADMIN   │
        │(User)     │          │ (User)   │          │ (User)   │
        └─────┬─────┘          └────┬─────┘          └────┬─────┘
              │                     │                     │
              │                     │                     │
              │ creates             │                     │ generates
              │                     │                     │
              ▼                     │                     ▼
        ┌──────────────┐            │          ┌───────────────────┐
        │    EXAM      │            │          │ REGISTRATION_CODE │
        │              │            │          │                   │
        │ Properties:  │            │          │ - code (Unique)   │
        │ - _id (PK)   │            │          │ - role            │
        │ - subject    │            │          │ - subject         │
        │ - courseCode │            │          │ - usedBy[]        │
        │ - date       │            │          │ - expiresAt       │
        │ - timeLimit  │            │          └───────────────────┘
        │ - totalMarks │            │
        │ - status     │            │
        │ - createdBy  │            │
        │ (FK→Teacher) │            │
        └──────┬───────┘            │
               │                    │
               │ contains           │ takes/attempts
               │                    │
               ▼                    ▼
        ┌──────────────┐      ┌────────────────┐
        │   QUESTION   │      │     GRADE      │
        │              │      │                │
        │ Properties:  │      │ Properties:    │
        │ - _id (PK)   │      │ - _id (PK)     │
        │ - examId(FK) │      │ - student(FK)→ │
        │ - text       │      │   STUDENT      │
        │ - options[]  │      │ - exam(FK)→    │
        │ - marks      │      │   EXAM         │
        │ - difficulty │      │ - marks_ob     │
        │ - order      │      │ - percentage   │
        │              │      │ - grade        │
        │              │      │ - feedback     │
        └──────┬───────┘      │ - submittedAt  │
               │              └────────┬───────┘
               │ answered_by           │
               │                       │ records
               └───────────┬───────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │  STUDENT_ANSWER  │
                   │                  │
                   │ Properties:      │
                   │ - _id (PK)       │
                   │ - gradeId (FK)   │
                   │ - questionId(FK) │
                   │ - studentId(FK)  │
                   │ - selectedOpt    │
                   │ - isCorrect      │
                   │ - marksObtained  │
                   └──────────────────┘
```

---

## **DETAILED VIEW - WHAT EACH ROLE DOES**

### **1️⃣ TEACHER's Interaction with System**

```
┌──────────────────────────────────────────────────────────────┐
│                     TEACHER PATH                             │
└──────────────────────────────────────────────────────────────┘

TEACHER (User with role="teacher")
│
├─── CREATES ──→ EXAM
│                 │
│                 ├─ Set subject (e.g., "Mathematics")
│                 ├─ Set course code (e.g., "CS101")
│                 ├─ Set date & time
│                 ├─ Set time limit (e.g., 60 minutes)
│                 ├─ Set total marks (e.g., 100)
│                 └─ Set total questions (e.g., 50)
│
├─── ADDS ──→ QUESTIONS to EXAM
│              │
│              ├─ Question text
│              ├─ 4 Multiple choice options
│              ├─ Mark correct answer
│              ├─ Set marks per question (1-10)
│              ├─ Set difficulty (Easy/Medium/Hard)
│              └─ Set question order
│
├─── UPLOADS ──→ PDF FILE (Optional - bulk question upload)
│                 │
│                 └─ System extracts questions 
│                    → Creates QUESTION records
│
├─── MONITORS ──→ EXAM STATUS
│                 │
│                 ├─ View live submissions
│                 ├─ Pause exam if needed
│                 ├─ Resume exam
│                 └─ Check exam_submissions_count
│
└─── VIEWS ──→ GRADES & RESULTS
                │
                ├─ See all GRADES for their exam
                │   (One GRADE per STUDENT per EXAM)
                │
                ├─ View STUDENT_ANSWERS (detailed answers)
                │   (Shows what each student answered)
                │
                ├─ See statistics:
                │   - Average marks
                │   - Highest score
                │   - Lowest score
                │   - Pass rate (40% threshold)
                │   - Grade distribution (A+/A/B.../F)
                │
                └─ Add FEEDBACK to grades
                   (Written comments for student performance)


RELATIONSHIPS FOR TEACHER:
┌─────────────────────────┐
│ TEACHER creates 1 → N EXAM
│ TEACHER creates 1 → N QUESTION (via EXAM)
│ TEACHER views N ← 1 GRADE (from their exams)
│ TEACHER adds feedback to GRADE
└─────────────────────────┘
```

---

### **2️⃣ STUDENT's Interaction with System**

```
┌──────────────────────────────────────────────────────────────┐
│                      STUDENT PATH                            │
└──────────────────────────────────────────────────────────────┘

STUDENT (User with role="student")
│
├─── VIEWS ──→ AVAILABLE EXAMS
│              (Exam records with status="ongoing")
│              │
│              ├─ Subject name
│              ├─ Course code
│              ├─ Description
│              ├─ Date scheduled
│              └─ Time limit
│
├─── STARTS ──→ EXAM ATTEMPT
│               │
│               ├─ Exam page opens
│               ├─ Timer starts
│               ├─ First QUESTION displayed
│               └─ studentAnswers[] array initialized
│
├─── ANSWERS ──→ EACH QUESTION
│                │
│                ├─ View question text
│                ├─ Select from 4 options (A/B/C/D)
│                ├─ Move to next question (saves current answer)
│                ├─ Navigate back to previous questions
│                └─ Skip questions (leave blank)
│
├─── SUBMITS ──→ EXAM
│                │
│                ├─ Manual submit button click OR
│                ├─ Auto-submit on timer=0
│                │
│                └─ Server processes:
│                   ├─ Evaluates each answer (correct/incorrect)
│                   ├─ Calculates marks obtained
│                   ├─ Calculates percentage
│                   ├─ Determines grade (A+/A/B.../F)
│                   ├─ Creates 1 GRADE record (student, exam)
│                   └─ Creates N STUDENT_ANSWER records (one per question)
│
└─── VIEWS ──→ RESULTS
                │
                ├─ See their GRADE record
                │   - Marks obtained
                │   - Total marks
                │   - Percentage
                │   - Grade letter
                │   - Submission time
                │   - Teacher feedback (if added)
                │
                ├─ See STUDENT_ANSWERS (their answers)
                │   - Question text
                │   - Their selected option
                │   - Correct option
                │   - Mark status (✓ or ✗)
                │
                ├─ View charts:
                │   - Performance trend (across multiple exams)
                │   - Marks distribution (this exam)
                │
                └─ Cannot edit/change grades
                   (Read-only results)


RELATIONSHIPS FOR STUDENT:
┌─────────────────────────┐
│ STUDENT views N ← 1 EXAM
│ STUDENT submits 1 → 1 GRADE (per exam)
│ STUDENT answers 1 → N STUDENT_ANSWER (per exam)
│ STUDENT receives N ← 1 GRADE (from exams taken)
└─────────────────────────┘
```

---

### **3️⃣ ADMIN's Interaction with System**

```
┌──────────────────────────────────────────────────────────────┐
│                       ADMIN PATH                             │
└──────────────────────────────────────────────────────────────┘

ADMIN (User with role="admin")
│
├─── MANAGES ──→ REGISTRATION CODES
│                │
│                ├─ Generate code for teachers
│                │   - Set role (teacher/admin)
│                │   - Set subject (optional)
│                │   - Set expiration date
│                │
│                ├─ Share codes with teachers
│                │   - Give code to new teacher
│                │   - Teacher uses code during registration
│                │   - System marks code as "used"
│                │
│                ├─ View all codes
│                │   - See which codes are active
│                │   - See which codes expired
│                │   - See which codes were used (usedBy[])
│                │
│                └─ Revoke/delete codes if needed
│
├─── MANAGES ──→ USERS
│                │
│                ├─ View all users
│                │   - Name, email, role
│                │   - Registration date
│                │   - Last login
│                │
│                ├─ Delete user (cascade delete)
│                │   - Delete all exams
│                │   - Delete all questions
│                │   - Delete all grades
│                │   - Delete all student answers
│                │   - Delete all registration codes
│                │
│                └─ View user statistics
│                   - Total students
│                   - Total teachers
│                   - Total admins
│
├─── MONITORS ──→ SYSTEM HEALTH
│                 │
│                 ├─ Total exams created
│                 ├─ Total questions entered
│                 ├─ Total grades given
│                 ├─ Average exam performance
│                 ├─ System uptime
│                 ├─ Database status
│                 └─ Server resource usage
│
├─── VIEWS ──→ AUDIT LOGS
│              │
│              ├─ Login/logout events
│              ├─ User registrations
│              ├─ Exam created/deleted
│              ├─ Grades submitted
│              └─ System errors
│
└─── GENERATES ──→ REPORTS
                   │
                   ├─ Teacher performance report
                   ├─ Student performance report
                   ├─ Exam analytics
                   ├─ System health report
                   └─ Export data (CSV/PDF)


RELATIONSHIPS FOR ADMIN:
┌─────────────────────────┐
│ ADMIN creates N → many REGISTRATION_CODE
│ ADMIN manages 1 → N USER (all users)
│ ADMIN views 1 → N EXAM (all exams)
│ ADMIN views 1 → N GRADE (all grades)
│ ADMIN views 1 → N STUDENT_ANSWER (audit log)
└─────────────────────────┘
```

---

## **COMPLETE ENTITY RELATIONSHIP MAP - TEXT FORM**

### **Entity: USER**
```
USER (Base entity for all roles)
├─ Primary Key: _id (ObjectId)
├─ Attributes:
│  ├─ name: String
│  ├─ email: String (UNIQUE)
│  ├─ password: String (hashed with bcrypt)
│  ├─ role: Enum (student | teacher | admin)
│  ├─ subject: String (optional, for teacher/admin)
│  ├─ instructor: String (optional, for teacher)
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ TEACHER-specific paths:
│  ├─ Creates → EXAM (1:N)
│  ├─ Creates → QUESTION (through EXAM)
│  └─ Views → GRADE (N:1, teacher owns exam)
│
├─ STUDENT-specific paths:
│  ├─ Attempts → EXAM (1:N, through GRADE)
│  ├─ Receives → GRADE (1:N, student takes exam)
│  └─ Has → STUDENT_ANSWER (1:N, answers questions)
│
└─ ADMIN-specific paths:
   ├─ Creates → REGISTRATION_CODE (1:N)
   ├─ Manages → USERS (1:N)
   └─ Views → All entities
```

---

### **Entity: STUDENT (USER with role="student")**
```
STUDENT Profile
├─ Primary Key: _id (inherited from USER)
├─ Inherited Common Attributes:
│  ├─ _id: ObjectId (Primary Key)
│  ├─ name: String (Student's full name, e.g., "Alice Johnson")
│  ├─ email: String (UNIQUE, e.g., "alice@student.com")
│  ├─ password: String (bcrypt hashed, minimum 8 chars)
│  ├─ role: String (FIXED: "student")
│  ├─ createdAt: Date (Registration timestamp)
│  └─ updatedAt: Date (Last profile update)
│
├─ STUDENT-Optional Attributes:
│  ├─ rollNumber: String (Optional, e.g., "STU2024001")
│  ├─ registrationNumber: String (Optional, e.g., "REG2024001")
│  ├─ department: String (Optional, e.g., "Computer Science")
│  ├─ semester: Number (Optional, e.g., 4)
│  ├─ batch: String (Optional, e.g., "2024-25")
│  ├─ phoneNumber: String (Optional, e.g., "+1234567890")
│  ├─ dateOfBirth: Date (Optional)
│  ├─ gender: Enum (Optional, "Male" | "Female" | "Other")
│  ├─ address: String (Optional)
│  ├─ city: String (Optional)
│  ├─ state: String (Optional)
│  ├─ zipCode: String (Optional)
│  ├─ country: String (Optional)
│  └─ avatar: String (Optional, profile picture URL)
│
├─ STUDENT-Exam Related Attributes:
│  ├─ examsTaken: Number (Count of attempted exams)
│  ├─ examsCompleted: Number (Count of submitted exams)
│  ├─ averagePercentage: Number (Average score across all exams, 0-100)
│  ├─ totalMarksObtained: Number (Sum of all marksObtained)
│  ├─ totalMarksAvailable: Number (Sum of all exam totalMarks)
│  ├─ bestScore: Number (Highest percentage achieved)
│  ├─ worstScore: Number (Lowest percentage achieved)
│  ├─ passCount: Number (Exams with percentage >= 40)
│  ├─ failCount: Number (Exams with percentage < 40)
│  ├─ passPercentage: Number (passCount / examsTaken * 100)
│  ├─ failPercentage: Number (failCount / examsTaken * 100)
│  ├─ notAttempted: [ObjectId] (Array of exam._id not yet taken)
│  ├─ inProgress: [ObjectId] (Array of exams currently being taken)
│  └─ completed: [ObjectId] (Array of exams submitted)
│
├─ STUDENT-Activity Tracking:
│  ├─ lastExamDate: Date (Last exam attempted)
│  ├─ lastLoginDate: Date (Last system login)
│  ├─ lastLoginTime: Time (Last login time)
│  ├─ totalLoginCount: Number (Number of logins)
│  ├─ isActive: Boolean (true if logged in last 30 days)
│  ├─ isBlocked: Boolean (true if blocked by admin)
│  ├─ blockedReason: String (Optional, why student was blocked)
│  ├─ blockedDate: Date (Optional, when student was blocked)
│  └─ blockedBy: ObjectId (Optional, admin who blocked)
│
├─ STUDENT-Preference Attributes:
│  ├─ preferredExamTime: String (Optional, e.g., "Morning")
│  ├─ notificationEmail: Boolean (Default: true)
│  ├─ smsNotification: Boolean (Default: false)
│  ├─ pushNotification: Boolean (Default: true)
│  ├─ languagePreference: String (Default: "English")
│  ├─ themePreference: String (Default: "light")
│  └─ timezone: String (Default: "UTC")
│
└─ STUDENT Relationships:
   ├─ Receives → N GRADE records (one per exam taken)
   ├─ Has → N STUDENT_ANSWER records (answers to all questions)
   ├─ References → N EXAM records (exams accessed/attempted)
   └─ Created/Tracked by → 0:1 REGISTRATION_CODE (used during signup)

EXAMPLE STUDENT RECORD:
{
  "_id": "ObjectId('1a2b3c4d5e6f7g8h')",
  "name": "Alice Johnson",
  "email": "alice@student.com",
  "password": "$2b$10$encrypted_hash...",
  "role": "student",
  "rollNumber": "STU2024001",
  "department": "Computer Science",
  "semester": 4,
  "phoneNumber": "+1234567890",
  "examsTaken": 8,
  "examsCompleted": 8,
  "averagePercentage": 78.5,
  "totalMarksObtained": 628,
  "totalMarksAvailable": 800,
  "bestScore": 92,
  "worstScore": 61,
  "passCount": 7,
  "failCount": 1,
  "passPercentage": 87.5,
  "lastExamDate": "2026-04-10T14:30:00Z",
  "lastLoginDate": "2026-04-13",
  "isActive": true,
  "isBlocked": false,
  "notificationEmail": true,
  "languagePreference": "English",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-04-13T09:30:00Z"
}
```

---

### **Entity: ADMIN (USER with role="admin")**
```
ADMIN Profile
├─ Primary Key: _id (inherited from USER)
├─ Inherited Common Attributes:
│  ├─ _id: ObjectId (Primary Key)
│  ├─ name: String (Admin's full name, e.g., "John Administrator")
│  ├─ email: String (UNIQUE, e.g., "john.admin@examify.com")
│  ├─ password: String (bcrypt hashed, minimum 10 chars - stronger)
│  ├─ role: String (FIXED: "admin")
│  ├─ createdAt: Date (Account creation timestamp)
│  └─ updatedAt: Date (Last profile update)
│
├─ ADMIN-Identity Attributes:
│  ├─ adminId: String (Admin employee ID, e.g., "ADM2024001")
│  ├─ adminType: Enum (Determines permission level)
│  │  ├─ "super_admin" (Full system access, can manage admins)
│  │  ├─ "system_admin" (Full system access, cannot manage admins)
│  │  ├─ "content_admin" (Can manage exams, questions)
│  │  ├─ "user_admin" (Can manage users, registration codes)
│  │  ├─ "support_admin" (Can view but not modify)
│  │  └─ "audit_admin" (View-only audit logs)
│  ├─ department: String (e.g., "IT", "Administration", "Quality Assurance")
│  ├─ phoneNumber: String (Office contact, e.g., "+1234567890")
│  ├─ officeLocation: String (e.g., "Building A, Room 201")
│  ├─ reportingTo: ObjectId (Optional, manager role reference)
│  └─ avatar: String (Optional, profile picture URL)
│
├─ ADMIN-Permissions Attributes:
│  ├─ canCreateAdmin: Boolean (Can create other admins)
│  ├─ canDeleteAdmin: Boolean (Can delete admin accounts)
│  ├─ canManageUsers: Boolean (Can view/delete users)
│  ├─ canManageExams: Boolean (Can pause/resume exams)
│  ├─ canManageQuestions: Boolean (Can edit/delete questions)
│  ├─ canManageGrades: Boolean (Can modify grades)
│  ├─ canGenerateRegistrationCode: Boolean (Can create registration codes)
│  ├─ canViewAuditLog: Boolean (Can view system logs)
│  ├─ canExportData: Boolean (Can export system data)
│  ├─ canManageBackup: Boolean (Can trigger backups)
│  ├─ canViewReports: Boolean (Can generate reports)
│  ├─ canConfigureSystem: Boolean (Can change system settings)
│  └─ canManageSupport: Boolean (Can manage support tickets)
│
├─ ADMIN-Activity Tracking:
│  ├─ lastLoginDate: Date (Last system login)
│  ├─ lastLoginTime: Time (Last login time)
│  ├─ lastLoginIP: String (IP address of last login)
│  ├─ totalLoginCount: Number (Total system logins)
│  ├─ lastActivityDate: Date (Last performed action)
│  ├─ lastActivityType: String (e.g., "create_exam", "delete_user")
│  ├─ isActive: Boolean (true if active in last 30 days)
│  ├─ isOnline: Boolean (Currently logged in)
│  ├─ loginAttempts: Number (Failed login attempts)
│  └─ twoFactorEnabled: Boolean (2FA for security)
│
├─ ADMIN-Management Statistics:
│  ├─ codeTypesGenerated: [
│  │   {
│  │     type: String,
│  │     count: Number,
│  │     totalGenerated: Number,
│  │     totalUsed: Number,
│  │     totalExpired: Number
│  │   }
│  │ ]
│  ├─ usersManaged: {
│  │   totalCreated: Number,
│  │   totalDeleted: Number,
│  │   totalBlocked: Number,
│  │   totalUnblocked: Number
│  │ }
│  ├─ examsManaged: {
│  │   totalPaused: Number,
│  │   totalResumed: Number,
│  │   totalDeleted: Number
│  │ }
│  ├─ gradesModified: Number (Grades changed by admin)
│  ├─ supportTicketsHandled: Number (Help tickets resolved)
│  └─ reportsGenerated: Number (Reports created)
│
├─ ADMIN-Audit Attributes:
│  ├─ actionLog: [
│  │   {
│  │     action: String (e.g., "create_exam", "delete_user"),
│  │     targetId: ObjectId (ID of affected entity),
│  │     targetType: String (e.g., "exam", "user"),
│  │     details: Object (What was changed),
│  │     timestamp: Date,
│  │     ipAddress: String,
│  │     status: String (e.g., "success", "failed")
│  │   }
│  │ ]
│  ├─ loginHistory: [
│  │   {
│  │     IP: String,
│  │     device: String,
│  │     timestamp: Date,
│  │     status: String (e.g., "success", "failed")
│  │   }
│  │ ]
│  └─ changeLog: [
│  │   {
│  │     changedBy: ObjectId (Another admin),
│  │     changedAt: Date,
│  │     previousValue: {},
│  │     newValue: {}
│  │   }
│  │ ]
│
├─ ADMIN-System Management:
│  ├─ registrationCodesCreated: Number (Total codes generated)
│  ├─ registrationCodesActive: Number (Currently active codes)
│  ├─ registrationCodesExpired: Number (Expired codes)
│  ├─ registrationCodesUsed: Number (Used by teachers)
│  ├─ systemNotifications: [String] (Important alerts)
│  ├─ maintenanceMode: Boolean (System in maintenance)
│  ├─ maintenanceSchedule: {
│  │   startTime: Date,
│  │   endTime: Date,
│  │   reason: String
│  │ }
│  ├─ backupFrequency: String (e.g., "daily", "weekly")
│  ├─ lastBackupDate: Date
│  ├─ nextBackupDate: Date
│  └─ storageUsage: {
│    used: Number (in GB),
│    total: Number (in GB),
│    percentage: Number (0-100)
│  }
│
├─ ADMIN-Contact & Support:
│  ├─ supportEmail: String (Support contact for this admin)
│  ├─ supportPhone: String (Support phone number)
│  ├─ supportAvailable: Boolean (Currently available for support)
│  ├─ supportTimezone: String
│  ├─ workingHours: {
│    startTime: Time (e.g., "09:00"),
│    endTime: Time (e.g., "18:00")
│  }
│  ├─ workingDays: [String] (e.g., ["Monday", "Tuesday", ...])
│  └─ emergencyContact: String (For critical issues)
│
└─ ADMIN Relationships:
   ├─ Creates → N REGISTRATION_CODE (for teacher verification)
   ├─ Manages → N USER records (can view/delete/block)
   ├─ Pauses → N EXAM records (can pause exams)
   ├─ Manages → N GRADE records (can modify if needed)
   ├─ Views → N STUDENT_ANSWER (audit purposes)
   ├─ Managed by → 0:1 ADMIN (if has manager)
   └─ Manages → 0:N ADMIN (if is super_admin)

EXAMPLE ADMIN RECORD:
{
  "_id": "ObjectId('9a8b7c6d5e4f3g2h')",
  "name": "John Administrator",
  "email": "john.admin@examify.com",
  "password": "$2b$10$encrypted_hash_stronger...",
  "role": "admin",
  "adminId": "ADM2024001",
  "adminType": "system_admin",
  "department": "IT",
  "phoneNumber": "+1234567890",
  "officeLocation": "Building A, Room 201",
  "canCreateAdmin": true,
  "canDeleteAdmin": false,
  "canManageUsers": true,
  "canManageExams": true,
  "canGenerateRegistrationCode": true,
  "canViewAuditLog": true,
  "canExportData": true,
  "lastLoginDate": "2026-04-13",
  "lastLoginIP": "192.168.1.100",
  "totalLoginCount": 245,
  "isActive": true,
  "isOnline": true,
  "twoFactorEnabled": true,
  "registrationCodesCreated": 42,
  "registrationCodesActive": 12,
  "registrationCodesExpired": 28,
  "registrationCodesUsed": 38,
  "maintenanceMode": false,
  "lastBackupDate": "2026-04-13T02:00:00Z",
  "nextBackupDate": "2026-04-14T02:00:00Z",
  "supportAvailable": true,
  "supportTimezone": "UTC",
  "createdAt": "2024-06-01T10:00:00Z",
  "updatedAt": "2026-04-13T14:00:00Z"
}
```

---

### **Entity: EXAM**
```
EXAM (Created by Teacher)
├─ Primary Key: _id (ObjectId)
├─ Foreign Key: createdBy → USER (_id) [TEACHER]
├─ Attributes:
│  ├─ subject: String (e.g., "Mathematics")
│  ├─ courseCode: String (e.g., "CS101")
│  ├─ description: String
│  ├─ date: Date
│  ├─ timeLimit: Number (minutes, e.g., 60)
│  ├─ totalMarks: Number (e.g., 100)
│  ├─ totalQuestions: Number (e.g., 50)
│  ├─ status: Enum (scheduled | ongoing | completed | paused)
│  ├─ instructor: String (teacher's name)
│  ├─ isPaused: Boolean
│  ├─ pausedBy: ObjectId (optional, admin who paused)
│  ├─ pausedAt: Date (optional)
│  ├─ activeStudents: [ObjectId] (students currently taking exam)
│  ├─ submissionsReceived: Number (count of submissions)
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ Relationships:
│  ├─ Created by 1 TEACHER (1:N reverse)
│  ├─ Contains many QUESTION (1:N)
│  └─ Generates many GRADE (1:N, one per student)
│
└─ TEACHER interacts:
   ├─ Creates exam
   ├─ Adds questions
   ├─ Pauses/resumes
   └─ Views results
```

### **Entity: QUESTION**
```
QUESTION (Added by Teacher to EXAM)
├─ Primary Key: _id (ObjectId)
├─ Foreign Keys:
│  ├─ examId → EXAM (_id)
│  └─ createdBy → USER (_id) [TEACHER]
├─ Attributes:
│  ├─ questionText: String
│  ├─ options: [
│  │   {
│  │     optionText: String (A/B/C/D text),
│  │     isCorrect: Boolean (exactly 1 must be true)
│  │   }
│  │ ]
│  ├─ marks: Number (1-10)
│  ├─ explanation: String
│  ├─ difficulty: Enum (Easy | Medium | Hard)
│  ├─ order: Number (1, 2, 3... sequence)
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ Relationships:
│  ├─ Contained in 1 EXAM (N:1 reverse)
│  └─ Answered by many STUDENT_ANSWER (1:N)
│
└─ STUDENT interacts:
   ├─ Views question text
   ├─ Views 4 options
   ├─ Selects 1 option (doesn't know which is correct)
   └─ Doesn't see explanation (until after grade released)
```

### **Entity: GRADE**
```
GRADE (Created after STUDENT submits EXAM)
├─ Primary Key: _id (ObjectId)
├─ Foreign Keys:
│  ├─ student → USER (_id) [STUDENT who took exam]
│  └─ exam → EXAM (_id) [The exam they took]
├─ Unique Constraint: (student, exam) - one grade per student/exam pair
├─ Attributes:
│  ├─ subject: String (same as exam.subject)
│  ├─ marksObtained: Number (calculated from answers)
│  ├─ totalMarks: Number (from exam)
│  ├─ percentage: Number (marksObtained/totalMarks * 100)
│  ├─ grade: Enum
│  │  ├─ A+ (90-100%)
│  │  ├─ A (80-89%)
│  │  ├─ A- (75-79%)
│  │  ├─ B+ (70-74%)
│  │  ├─ B (60-69%)
│  │  ├─ B- (55-59%)
│  │  ├─ C+ (50-54%)
│  │  ├─ C (45-49%)
│  │  ├─ D (40-44%)
│  │  └─ F (<40%)
│  ├─ attemptDate: Date
│  ├─ submittedAt: Date (timestamp)
│  ├─ feedback: String (optional, added by TEACHER)
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ Relationships:
│  ├─ Assigned to 1 STUDENT (N:1 reverse)
│  ├─ From 1 EXAM (N:1 reverse)
│  └─ Records many STUDENT_ANSWER (1:N)
│
└─ Visibility:
   ├─ STUDENT sees: own grades only
   ├─ TEACHER sees: all grades for their exam
   └─ ADMIN sees: all grades (audit only)
```

### **Entity: STUDENT_ANSWER**
```
STUDENT_ANSWER (Detailed answer record)
├─ Primary Key: _id (ObjectId)
├─ Foreign Keys:
│  ├─ gradeId → GRADE (_id)
│  ├─ questionId → QUESTION (_id)
│  ├─ studentId → USER (_id) [STUDENT]
│  └─ examId → EXAM (_id)
├─ Attributes:
│  ├─ selectedOption: String (what student selected: A/B/C/D)
│  ├─ isCorrect: Boolean (automatically determined)
│  ├─ marksObtained: Number (marks for this question)
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
├─ Relationships:
│  ├─ Part of 1 GRADE (N:1 reverse)
│  ├─ Answers 1 QUESTION (N:1 reverse)
│  └─ From 1 STUDENT via GRADE
│
└─ Example records per exam:
   ├─ Q1: selectedOption="A", correct="B", isCorrect=false, marks=0
   ├─ Q2: selectedOption="B", correct="B", isCorrect=true, marks=1
   ├─ Q3: selectedOption="C", correct="C", isCorrect=true, marks=2
   │... (one record per question per student)
```

### **Entity: REGISTRATION_CODE**
```
REGISTRATION_CODE (For teacher verification)
├─ Primary Key: _id (ObjectId)
├─ Foreign Key: None (standalone)
├─ Attributes:
│  ├─ code: String (UNIQUE, e.g., "TEACH2026ABC")
│  ├─ role: Enum (teacher | admin)
│  ├─ subject: String (optional, e.g., "Computer Science")
│  ├─ usedBy: [ObjectId] (array of USER _ids who used code)
│  ├─ expiresAt: Date
│  ├─ createdAt: Date
│  └─ updatedAt: Date
│
└─ Workflow:
   ├─ ADMIN generates code: "TEACH2026ABC"
   ├─ ADMIN shares code with new teacher
   ├─ Teacher registers with:
   │  ├─ name: "John Doe"
   │  ├─ email: "john@teach.com"
   │  ├─ password: "SecurePass123"
   │  ├─ role: "teacher"
   │  └─ code: "TEACH2026ABC"
   ├─ System validates code (not expired, not used)
   └─ User created, code marked as usedBy=[user._id]
```

---

## **DATA FLOW DIAGRAM - COMPLETE JOURNEY**

```
                         START
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   STUDENT REGISTERS              │
        │   └─ Creates USER record         │
        │     (role="student")             │
        └──────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   TEACHER REGISTERS              │
        │   └─ Provides REGISTRATION_CODE  │
        │     Creates USER record          │
        │     (role="teacher")             │
        └──────────────────────────────────┘
                          │
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ TEACHER      │ │ TEACHER      │ │ TEACHER      │
    │ Creates EXAM │ │ Adds Q1      │ │ Adds Q2      │
    └──────────────┘ └──────────────┘ └──────────────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ EXAM Status = "ongoing"      │
            │ Available for STUDENTS       │
            └──────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │ MANY STUDENTS take exam                    │
    │                                             │
    │ For each STUDENT:                           │
    │ ├─ STUDENT views QUESTIONS                 │
    │ ├─ STUDENT selects ANSWERS for each        │
    │ ├─ STUDENT submits exam                    │
    │ │                                           │
    │ └─ System:                                  │
    │   ├─ Evaluates each STUDENT_ANSWER         │
    │   ├─ Calculates marks                      │
    │   ├─ Creates 1 GRADE record                │
    │   └─ Creates N STUDENT_ANSWER records      │
    │      (one per question)                    │
    └─────────────────────────────────────────────┘
                          │
                          │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ STUDENT 1  │   │ STUDENT 2  │   │ STUDENT N  │
    │ Views      │   │ Views      │   │ Views      │
    │ Their      │   │ Their      │   │ Their      │
    │ GRADE &    │   │ GRADE &    │   │ GRADE &    │
    │ ANSWERS    │   │ ANSWERS    │   │ ANSWERS    │
    └────────────┘   └────────────┘   └────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ TEACHER Views                │
            │ ├─ All GRADES (all students)│
            │ ├─ Statistics                │
            │ ├─ Grade distribution        │
            │ ├─ Average score             │
            │ └─ Adds FEEDBACK             │
            └──────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ ADMIN Views                  │
            │ ├─ System statistics         │
            │ ├─ All EXAMS                 │
            │ ├─ All GRADES                │
            │ ├─ Audit logs                │
            │ └─ Generates reports         │
            └──────────────────────────────┘
```

---

## **SUMMARY TABLE - WHO DOES WHAT**

| Action | TEACHER | STUDENT | ADMIN |
|--------|---------|---------|-------|
| **Create EXAM** | ✅ Yes | ❌ No | ❌ No |
| **Add QUESTIONS** | ✅ Yes | ❌ No | ❌ No |
| **Upload PDF Questions** | ✅ Yes | ❌ No | ❌ No |
| **Pause/Resume EXAM** | ✅ Yes | ❌ No | ✅ Yes |
| **View available EXAMS** | ❌ No | ✅ Yes (ongoing) | ✅ Yes (all) |
| **Start EXAM** | ❌ No | ✅ Yes | ❌ No |
| **Answer QUESTIONS** | ❌ No | ✅ Yes | ❌ No |
| **Submit EXAM** | ❌ No | ✅ Yes | ❌ No |
| **Auto-calculate GRADE** | ❌ No (auto system) | ❌ No (auto system) | ❌ No (auto system) |
| **View own GRADE** | ✅ Yes (for their exam) | ✅ Yes (own only) | ❌ No (view all) |
| **View all GRADES** | ✅ Yes (for their exams) | ❌ No (own only) | ✅ Yes (all) |
| **View STUDENT_ANSWERS** | ✅ Yes (for their exam) | ✅ Yes (own only) | ✅ Yes (all) |
| **Add FEEDBACK** | ✅ Yes (to grades) | ❌ No | ❌ No |
| **Create REGISTRATION_CODE** | ❌ No | ❌ No | ✅ Yes |
| **Manage USERS** | ❌ No | ❌ No | ✅ Yes |
| **View system statistics** | ❌ No | ❌ No | ✅ Yes |
| **Generate reports** | ❌ No | ❌ No | ✅ Yes |

---

## **ENTITY RELATIONSHIPS - SUMMARY**

```
┌────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP SUMMARY                                           │
└────────────────────────────────────────────────────────────────┘

1. TEACHER (1) ◄──creates──► (N) EXAM
   └─ One teacher creates many exams
   └─ Each exam has one creator (teacher)

2. EXAM (1) ◄──contains──► (N) QUESTION
   └─ One exam has many questions
   └─ Each question belongs to one exam

3. TEACHER (1) ◄──creates (via EXAM)──► (N) QUESTION
   └─ Indirect: Teacher creates questions through exam

4. STUDENT (1) ◄──attempts──► (N) EXAM
   └─ Indirect through GRADE
   └─ One student attempts many exams

5. EXAM (1) ◄──generates──► (N) GRADE
   └─ One exam generates many grades (one per student)

6. STUDENT (1) ◄──receives──► (N) GRADE
   └─ One student receives many grades (from different exams)

7. QUESTION (1) ◄──answered_by──► (N) STUDENT_ANSWER
   └─ One question answered by many students (different attempts)

8. GRADE (1) ◄──records──► (N) STUDENT_ANSWER
   └─ One grade has many answers (one per question)

9. STUDENT_ANSWER ── references ──► STUDENT
   └─ Links the answer back to the student who answered

10. ADMIN (1) ◄──generates──► (N) REGISTRATION_CODE
    └─ One admin creates many registration codes
    └─ For teacher verification

11. REGISTRATION_CODE ◄──used_by──► (N) USER (Teachers)
    └─ One code can be used by one or more teachers
    └─ Tracks which teachers were registered with which code
```

---

## **✅ COMPLETE ER DIAGRAM CREATED**

This diagram shows:
- ✅ All 6 database entities
- ✅ All 11 relationships
- ✅ Teacher-Student-Admin interactions
- ✅ Data flow through system
- ✅ What each role can and cannot do
- ✅ Complete workflow from registration to results

**Ready to create in Visual Paradigm!** 🎨
