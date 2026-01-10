# Admin Access Documentation

## ✅ Admin Role-Based Access Control

The application has full admin authentication and authorization implemented.

### Admin Credentials

```
Email: admin@example.com
Password: admin123
```

### How Admin Access Works

1. **User Model** (`backend/models/User.js`):
   - Has a `role` field with values: `'student'` or `'admin'`
   - Default role is `'student'`

2. **Backend Middleware** (`backend/middleware/authMiddleware.js`):
   - `auth`: Verifies JWT token
   - `adminAuth`: Checks if `user.role === 'admin'`

3. **Protected Admin Routes** (`backend/routes/admin.js`):
   ```javascript
   router.get('/students', auth, adminAuth, async (req, res) => {...})
   router.get('/analytics', auth, adminAuth, async (req, res) => {...})
   ```

4. **Frontend Route Protection** (`frontend/src/App.jsx`):
   ```javascript
   <Route path="/admin" element={
     <ProtectedRoute adminOnly>
       <AdminPanel />
     </ProtectedRoute>
   } />
   ```

5. **Login Logic** (`backend/routes/auth.js`):
   - Auto-creates admin user on first login with admin credentials
   - Returns user object with role to frontend

### Access Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │
       ├── Student Login → /dashboard (StudentDashboard)
       │
       └── Admin Login → /admin (AdminPanel)
```

### Testing Admin Access

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You will be redirected to `/admin` (Admin Command Center)

### Creating Additional Admin Users

To create more admin users, you can:

**Option 1: Modify the backend to allow admin creation**
```javascript
// In backend/routes/auth.js
router.post('/register-admin', auth, adminAuth, async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password, role: 'admin' });
  await user.save();
  res.status(201).send({ user });
});
```

**Option 2: Directly in MongoDB**
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "newemail@example.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash
  role: "admin",
  createdAt: new Date()
})
```

### Security Notes

- JWT tokens are stored in localStorage
- All admin routes require valid JWT + admin role
- Passwords are hashed using bcrypt (10 rounds)
- CORS is enabled for frontend-backend communication

### Troubleshooting

If you can't access admin panel:

1. **Clear browser cache/localStorage**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Verify user role in localStorage**:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')));
   // Should show: { ..., role: 'admin' }
   ```

3. **Check backend logs** for authentication errors

4. **Verify MongoDB connection** is active
