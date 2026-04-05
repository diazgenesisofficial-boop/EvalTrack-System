# EvalTrack System - Complete Setup & Testing Guide

## 🚀 **System Overview**

EvalTrack is a comprehensive student evaluation and enrollment management system with:
- **Frontend**: HTML/CSS/JavaScript (ProgramHead Dashboard)
- **Backend**: Node.js/Express REST API
- **Features**: Grade Management, Enrollment Process, AI Reports, Student Monitoring

---

## 📋 **Prerequisites**

### **Required Software:**
1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **Web Browser** (Chrome, Firefox, Edge)
4. **Code Editor** (VS Code recommended)

---

## 🛠️ **Setup Instructions**

### **Step 1: Backend Setup**

#### **1.1 Navigate to Backend Directory**
```bash
cd c:\xampp\htdocs\fullstack\EvalTrack\Backend
```

#### **1.2 Install Dependencies**
```bash
npm install
```
*If npm doesn't work due to PowerShell restrictions, run:*
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **1.3 Environment Configuration**
The `.env` file is already configured with default settings:
- **Port**: 5000
- **Database**: MySQL (optional for now, using mock data)
- **JWT**: Default secret key (change in production)

---

### **Step 2: Frontend Setup**

#### **2.1 Frontend Directory**
The frontend is already located at:
```
c:\xampp\htdocs\fullstack\EvalTrack\Frontend\ProgramHeadPage\ProgramHead.html
```

#### **2.2 No Setup Required**
The frontend is a static HTML file with all CSS and JavaScript included.

---

## 🚀 **How to Run the System**

### **Option 1: Run Backend Only (Recommended)**
```bash
# Navigate to backend directory
cd c:\xampp\htdocs\fullstack\EvalTrack\Backend

# Start the backend server
npm start
```

### **Option 2: Run Backend in Development Mode**
```bash
# Navigate to backend directory
cd c:\xampp\htdocs\fullstack\EvalTrack\Backend

# Start with auto-restart on file changes
npm run dev
```

### **Option 3: Run Backend Directly with Node**
```bash
# Navigate to backend directory
cd c:\xampp\htdocs\fullstack\EvalTrack\Backend

# Start server directly
node server.js
```

---

## 🌐 **Accessing the System**

### **Backend API Endpoints:**
- **Base URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **Authentication**: `http://localhost:5000/api/auth`
- **Students**: `http://localhost:5000/api/students`
- **Grades**: `http://localhost:5000/api/grades`
- **Enrollment**: `http://localhost:5000/api/enrollment`
- **Reports**: `http://localhost:5000/api/reports`

### **Frontend Access:**
Open the HTML file directly in your browser:
```
file:///c:/xampp/htdocs/fullstack/EvalTrack/Frontend/ProgramHeadPage/ProgramHead.html
```

Or use a local server:
```
http://localhost:3000/ProgramHead.html
```

---

## 🧪 **Testing the System**

### **1. Backend API Testing**

#### **Health Check Test**
```bash
# Using curl
curl http://localhost:5000/api/health

# Expected Response:
{
  "status": "OK",
  "timestamp": "2024-04-03T04:30:00.000Z",
  "version": "1.0.0"
}
```

#### **Authentication Test**
```bash
# Login Test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@jmc.edu.ph", "password": "password"}'
```

#### **Students API Test**
```bash
# Get All Students
curl http://localhost:5000/api/students

# Get Specific Student
curl http://localhost:5000/api/students/20230001
```

### **2. Frontend Testing**

#### **Open the Frontend**
1. Open `ProgramHead.html` in your browser
2. The system will load with mock data
3. Test all features without backend connection

#### **Test Features:**
✅ **Student Search**: Type "Genesis" in search
✅ **Grade Dashboard**: Select student → Click "Grade Reports"
✅ **Enrollment Dashboard**: Select student → Add subjects
✅ **AI Reports**: Generate recommendations
✅ **Subject Management**: Add/Drop subjects

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. "npm is not recognized"**
```powershell
# Fix PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **2. "Port 5000 is already in use"**
```bash
# Kill existing process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env file
PORT=5001
```

#### **3. "Cannot find module"**
```bash
# Install missing dependencies
npm install express cors helmet dotenv bcryptjs jsonwebtoken mysql2 express-rate-limit joi
```

#### **4. Frontend CORS Issues**
The backend is configured to allow:
- `http://localhost:3000`
- `http://127.0.0.1:5500`
- `file://` (for direct file opening)

#### **5. JavaScript Errors in Frontend**
Open browser console (F12) and check for:
- **Duplicate IDs**: All fixed ✅
- **Missing Functions**: All implemented ✅
- **Network Errors**: Check if backend is running

---

## 📊 **API Documentation**

### **Authentication Endpoints**
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/change-password
```

### **Student Endpoints**
```
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/students/:id/enrollment-status
```

### **Grade Endpoints**
```
GET    /api/grades/:studentId
POST   /api/grades
PUT    /api/grades/:id
DELETE /api/grades/:id
```

### **Enrollment Endpoints**
```
GET    /api/enrollment/:studentId
POST   /api/enrollment/add-subject
DELETE /api/enrollment/drop-subject
POST   /api/enrollment/proceed
```

### **Reports Endpoints**
```
GET    /api/reports/ai-recommendations/:studentId
GET    /api/reports/grade-reports/:studentId
POST   /api/reports/ai-chat
```

---

## 🎯 **Quick Start Checklist**

### **Before Running:**
- [ ] Node.js installed
- [ ] PowerShell execution policy set
- [ ] Backend dependencies installed

### **Running the System:**
- [ ] Start backend server (`npm start`)
- [ ] Verify health check (`http://localhost:5000/api/health`)
- [ ] Open frontend in browser
- [ ] Test student search functionality
- [ ] Test grade management
- [ ] Test enrollment process

### **Testing Complete When:**
- [ ] Backend responds to health check
- [ ] Frontend loads without errors
- [ ] Student search works
- [ ] Grade dashboard functional
- [ ] Enrollment process working
- [ ] No JavaScript console errors

---

## 🚀 **Production Deployment**

### **For Production:**
1. **Change JWT Secret** in `.env`
2. **Set up MySQL database**
3. **Configure proper CORS origins**
4. **Set NODE_ENV=production**
5. **Use HTTPS**
6. **Implement proper logging**

---

## 📞 **Support**

### **If Issues Occur:**
1. Check browser console (F12) for JavaScript errors
2. Verify backend is running (check terminal)
3. Test API endpoints with curl/Postman
4. Review this troubleshooting guide

### **System Status:**
- ✅ Backend API: Fully functional
- ✅ Frontend: Complete and working
- ✅ All JavaScript errors fixed
- ✅ Duplicate IDs resolved
- ✅ Mock data implemented

**The EvalTrack system is ready to run! 🎉**
