# Installation Verification Checklist

Follow these steps to verify your SohojSync installation is complete and working correctly.

## ✅ Pre-Installation Verification

### Check Prerequisites
- [ ] PHP 8.1+ installed: `php -v`
- [ ] Composer installed: `composer --version`
- [ ] Node.js 18+ installed: `node -v`
- [ ] npm installed: `npm -v`
- [ ] MySQL/PostgreSQL running
- [ ] Database created: `sohojsync`

## ✅ Backend Verification

### 1. Check Laravel Files Exist
```bash
# Navigate to project root
cd c:\laragon\www\sohojsync

# Verify config files
dir config\sanctum.php
dir config\cors.php

# Verify controllers
dir app\Http\Controllers\Api\AuthController.php
dir app\Http\Controllers\Api\ProjectController.php
dir app\Http\Controllers\Api\TaskController.php

# Verify models
dir app\Models\Project.php
dir app\Models\Task.php

# Verify migrations
dir database\migrations\2025_12_06_000001_create_projects_table.php
dir database\migrations\2025_12_06_000002_create_tasks_table.php

# Verify routes
dir routes\api.php
```

### 2. Configure Environment
```bash
# Copy .env.example if .env doesn't exist
copy .env.example .env

# Edit .env file with these CRITICAL settings:
# SESSION_DOMAIN=localhost
# SANCTUM_STATEFUL_DOMAINS=localhost:5173
# DB_DATABASE=sohojsync
# DB_USERNAME=root (or your username)
# DB_PASSWORD= (your password)
```

### 3. Install Dependencies
```bash
composer install
```

### 4. Setup Application
```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed
```

### 5. Verify Database Tables
After migrations, verify these tables exist:
- [ ] users
- [ ] projects
- [ ] tasks
- [ ] sessions
- [ ] cache
- [ ] jobs

### 6. Start Laravel Server
```bash
php artisan serve --port=8000
```

Keep this terminal open. Laravel should be running at http://localhost:8000

### 7. Test Backend API
Open a new terminal and test:

```bash
# Test CSRF cookie endpoint
curl http://localhost:8000/sanctum/csrf-cookie

# Test API endpoint (should return 401 Unauthenticated)
curl http://localhost:8000/api/me
```

## ✅ Frontend Verification

### 1. Check Frontend Files Exist
```bash
# Navigate to frontend directory
cd c:\laragon\www\sohojsync\frontend

# Verify package.json
dir package.json

# Verify config files
dir vite.config.js
dir tailwind.config.cjs
dir postcss.config.cjs
dir index.html

# Verify source structure
dir src\App.jsx
dir src\main.jsx
dir src\index.css
dir src\components
dir src\pages
dir src\layouts
dir src\router
dir src\utils
dir src\context
dir src\hooks
```

### 2. Setup Environment
```bash
# Create .env from example
copy .env.local.example .env

# Verify .env contains:
# VITE_API_URL=http://localhost:8000
```

### 3. Install Dependencies
```bash
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- vite
- clsx
- and dev dependencies

### 4. Start Vite Dev Server
```bash
npm run dev
```

Vite should start at http://localhost:5173

### 5. Verify Frontend in Browser
- [ ] Open http://localhost:5173
- [ ] Login page displays with SohojSync branding
- [ ] Inter font is loaded (check browser DevTools)
- [ ] Colors match design system (sidebar is #22177A)
- [ ] Demo credentials box is visible

## ✅ Integration Testing

### 1. Test Authentication Flow
- [ ] Enter email: test@example.com
- [ ] Enter password: password
- [ ] Click "Sign In"
- [ ] Should redirect to Dashboard
- [ ] Should see "Welcome back, Test User!"

### 2. Test Dashboard
- [ ] Stats cards display (Total Projects, Total Tasks, etc.)
- [ ] Recent Projects section shows 3 projects
- [ ] Recent Tasks section shows tasks with status badges
- [ ] Numbers match seeded data

### 3. Test Navigation (Desktop)
- [ ] Sidebar is visible on left
- [ ] Click "Projects" - should navigate to /projects
- [ ] Click "Tasks" - should navigate to /tasks
- [ ] Click "Settings" - should navigate to /settings
- [ ] Click "Dashboard" - should navigate back to /dashboard
- [ ] Active route has indicator dot

### 4. Test Sidebar Collapse (Desktop)
- [ ] Click collapse button (chevron icon)
- [ ] Sidebar width reduces, only icons visible
- [ ] Click expand button
- [ ] Sidebar expands, labels appear

### 5. Test Mobile View
- [ ] Resize browser to mobile width (< 768px)
- [ ] Sidebar should hide
- [ ] Bottom navigation bar appears
- [ ] Click hamburger menu icon (top left)
- [ ] Drawer menu opens from left
- [ ] Click menu items to navigate
- [ ] Close drawer by clicking backdrop or X button

### 6. Test Projects Page
- [ ] Navigate to Projects
- [ ] Should see 3 demo projects
- [ ] Each project card shows:
  - Title
  - Description
  - Created date
  - "View Details" button
- [ ] "New Project" button in header

### 7. Test Tasks Page
- [ ] Navigate to Tasks
- [ ] Should see list of tasks
- [ ] Filter buttons work:
  - Click "Open" - shows only open tasks
  - Click "Completed" - shows only done tasks
  - Click "All" - shows all tasks
- [ ] Task cards show:
  - Title
  - Status badge (Open/Done)
  - Project name
  - Due date
  - Overdue indicator (red) if applicable

### 8. Test Settings Page
- [ ] Navigate to Settings
- [ ] User info displays (name, email, ID)
- [ ] Toggle switches work
- [ ] "Edit Profile" button visible
- [ ] Logout button in Danger Zone

### 9. Test Logout
- [ ] Click "Logout" button (Settings or Header)
- [ ] Should redirect to Login page
- [ ] Should not be able to access /dashboard directly
- [ ] Attempting to access /dashboard redirects to /login

### 10. Test Session Persistence
- [ ] Login again
- [ ] Navigate to Dashboard
- [ ] Refresh browser (F5)
- [ ] Should stay logged in and on Dashboard
- [ ] User info should persist

## ✅ Responsive Design Testing

### Desktop (≥768px)
- [ ] Sidebar visible and functional
- [ ] Header shows page title and user info
- [ ] Logout button in header
- [ ] Bottom navigation hidden
- [ ] All content properly laid out

### Tablet (768px - 1024px)
- [ ] Sidebar visible
- [ ] Layout adjusts appropriately
- [ ] Cards stack properly

### Mobile (< 768px)
- [ ] Sidebar hidden
- [ ] Hamburger menu button visible
- [ ] Bottom navigation visible with 4 icons
- [ ] Cards stack vertically
- [ ] Touch targets are appropriately sized
- [ ] User info in header shows avatar only (no name/email)

## ✅ Design System Verification

### Colors
- [ ] Sidebar background: #22177A (dark royal blue)
- [ ] Sidebar hover: #605EA1 (soft indigo)
- [ ] Main background: #F7F7FB
- [ ] Primary buttons: #22177A background, white text
- [ ] Secondary buttons: #22177A border and text
- [ ] Empty states: #E6E9AF background (soft pastel yellow)

### Typography
- [ ] Font family is Inter (check DevTools)
- [ ] H1 headings are 32px
- [ ] H2 headings are 26px
- [ ] Body text is 16px

### Components
- [ ] Buttons have hover states
- [ ] Cards have soft shadows
- [ ] Input fields have focus states (blue ring)
- [ ] Loading spinner is centered
- [ ] Icons are properly sized

## ✅ API Testing (Advanced)

### Using Browser DevTools Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Login
4. Verify requests:
   - [ ] GET /sanctum/csrf-cookie (200)
   - [ ] POST /api/login (200)
   - [ ] Response includes user object
   - [ ] Cookies set (laravel_session, XSRF-TOKEN)

5. Navigate to Dashboard
   - [ ] GET /api/projects (200)
   - [ ] GET /api/tasks (200)
   - [ ] Requests include cookies

6. Logout
   - [ ] POST /api/logout (204)

## ✅ Error Handling Testing

### Invalid Login
- [ ] Enter wrong email/password
- [ ] Should show error message
- [ ] Should not redirect
- [ ] Form should remain filled

### Network Error Simulation
- [ ] Stop Laravel server
- [ ] Try to login
- [ ] Should show error message
- [ ] Restart Laravel server

### Protected Route Access
- [ ] Logout
- [ ] Try to visit http://localhost:5173/dashboard directly
- [ ] Should redirect to /login
- [ ] Login
- [ ] Should redirect to /dashboard

## 🚨 Common Issues & Solutions

### Issue: CORS Error
**Symptoms**: Console shows CORS error, API requests fail
**Solution**: 
- Verify `config/cors.php` has `'allowed_origins' => ['http://localhost:5173']`
- Verify `SANCTUM_STATEFUL_DOMAINS=localhost:5173` in `.env`
- Clear Laravel config: `php artisan config:clear`

### Issue: 419 CSRF Token Mismatch
**Symptoms**: Login fails with 419 error
**Solution**:
- Verify `SESSION_DOMAIN=localhost` in `.env`
- Check `ensureCsrf()` is called before login in AuthContext
- Clear browser cookies
- Restart Laravel server

### Issue: Authentication Not Persisting
**Symptoms**: User logged out after refresh
**Solution**:
- Check `SESSION_DRIVER=cookie` in `.env`
- Verify cookies are not blocked in browser
- Check browser is not in incognito/private mode
- Verify `withCredentials: true` in axios config

### Issue: Frontend Not Loading
**Symptoms**: Blank page, errors in console
**Solution**:
- Check Vite dev server is running
- Verify `npm install` completed successfully
- Check console for JavaScript errors
- Clear browser cache

### Issue: Styles Not Applied
**Symptoms**: Page displays but no styling
**Solution**:
- Verify Tailwind is installed: `npm list tailwindcss`
- Check `tailwind.config.cjs` exists
- Check `index.css` imports Tailwind directives
- Restart Vite dev server

### Issue: Database Connection Failed
**Symptoms**: Migration fails, API returns 500
**Solution**:
- Verify database exists: `CREATE DATABASE sohojsync;`
- Check database credentials in `.env`
- Verify MySQL/PostgreSQL is running
- Test connection: `php artisan migrate:status`

## 📝 Final Verification

If all checkboxes above are ticked ✅, your installation is complete and working correctly!

### What You Should Have:
- ✅ Laravel backend running on port 8000
- ✅ React frontend running on port 5173
- ✅ Working authentication with demo user
- ✅ All pages accessible and functional
- ✅ Responsive design working
- ✅ API endpoints responding correctly
- ✅ Database seeded with demo data
- ✅ Design system properly implemented

### Ready for Development!
You can now:
- Add new features
- Create more projects and tasks
- Customize the design
- Add new pages and components
- Implement additional API endpoints
- Deploy to production

---

**Need Help?**
- Check README.md for detailed documentation
- Check PROJECT_SUMMARY.md for complete file listing
- Review Laravel logs: `storage/logs/laravel.log`
- Check browser console for frontend errors
- Use Network tab in DevTools to debug API calls
