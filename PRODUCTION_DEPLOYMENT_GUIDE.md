# Production Deployment Guide: Laravel + React SPA on Single Domain

## 🎯 Overview

This guide shows how to serve **both Laravel API and React SPA from ONE domain** in production, with proper routing, authentication, and no separate Node.js server.

---

## 📁 Project Structure

```
project-root/
├── app/                        # Laravel backend
├── config/
│   ├── cors.php               # CORS for same-domain requests
│   ├── sanctum.php            # Stateful auth domains
│   └── fortify.php            # Disable Blade views
├── routes/
│   ├── api.php                # All API routes under /api/*
│   └── web.php                # SPA fallback route
├── public/
│   ├── index.php              # Laravel entry point
│   └── build/                 # React production build (generated)
│       ├── index.html
│       └── assets/
├── frontend/                  # React source code
│   ├── src/
│   ├── package.json
│   └── vite.config.js         # Build to ../public/build
└── resources/
    └── views/
        └── react-app.blade.php # Blade wrapper for React
```

---

## 🔧 Configuration Files

### 1. **Vite Configuration** (`frontend/vite.config.js`)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
  },
  // CRITICAL: Set base path to /build/ so assets resolve correctly
  base: '/build/',
  build: {
    // Output to Laravel's public/build directory
    outDir: '../public/build',
    emptyOutDir: true,
  },
});
```

**Why this works:**
- `base: '/build/'` ensures all asset paths include `/build/` prefix
- `outDir: '../public/build'` puts React files where Laravel can serve them
- No need for separate static file server

---

### 2. **Laravel Routes** (`routes/web.php`)

```php
<?php

use Illuminate\Support\Facades\Route;

// Serve React app at root
Route::view('/', 'react-app')->name('react-app');

// Explicitly serve SPA for /login (prevents Laravel auth views)
Route::view('/login', 'react-app');

// CATCH-ALL: Serve React for any non-API route
// This enables React Router to work with direct URLs
Route::view('/{path}', 'react-app')
    ->where('path', '^(?!api|storage|vendor|horizon|nova|telescope|_debugbar).*$');

// Note: All API routes are in routes/api.php under /api/* prefix
```

**Why this works:**
- `/` → React app (replaces Laravel welcome page)
- `/login`, `/admin/dashboard`, `/any-spa-route` → React app
- `/api/*` → Laravel API (not caught by fallback)
- Page refresh on `/admin/dashboard` returns `react-app.blade.php`, React Router takes over

---

### 3. **Blade Wrapper** (`resources/views/react-app.blade.php`)

```blade
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SohojSync - Project Management</title>
    
    @php
        $buildPath = public_path('build/index.html');
        $buildHtml = file_exists($buildPath) ? file_get_contents($buildPath) : '';
        
        // Extract CSS files
        preg_match_all('/<link[^>]+href="([^"]+\.css)"[^>]*>/i', $buildHtml, $cssMatches);
        // Extract JS files
        preg_match_all('/<script[^>]+src="([^"]+\.js)"[^>]*>/i', $buildHtml, $jsMatches);
    @endphp
    
    @foreach($cssMatches[1] ?? [] as $css)
        <link rel="stylesheet" crossorigin href="{{ $css }}">
    @endforeach
</head>
<body>
    <div id="root"></div>
    
    @foreach($jsMatches[1] ?? [] as $js)
        <script type="module" crossorigin src="{{ $js }}"></script>
    @endforeach
</body>
</html>
```

**Why this works:**
- Dynamically reads `public/build/index.html` to get hashed asset filenames
- Renders correct `<link>` and `<script>` tags with cache-busting hashes
- Works even when Vite changes asset hashes on rebuild

---

### 4. **Disable Fortify Views** (`config/fortify.php`)

```php
'views' => false,

'features' => [
    // Comment out or remove all features to disable Blade views
    // Features::registration(),
    // Features::resetPasswords(),
],
```

**Why this is critical:**
- Without this, Laravel Fortify serves its own `/login` Blade view
- Causes conflict where `/login` shows Laravel page instead of React
- Setting `views => false` lets your catch-all route handle it

---

### 5. **CORS Configuration** (`config/cors.php`)

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_methods' => ['*'],

'allowed_origins' => array_filter([
    'http://localhost:5173',
    'http://localhost:5174',
    env('APP_URL'), // Production domain
]),

'supports_credentials' => true,
```

---

### 6. **Sanctum Configuration** (`config/sanctum.php`)

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,localhost:5173,localhost:5174',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),

'guard' => ['web'],
```

---

### 7. **Production Environment** (`.env`)

```env
APP_URL=https://sync.sohojware.dev

# Session settings for cookie-based auth
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_DOMAIN=.sohojware.dev
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# Sanctum stateful domains (no http/https, just domain)
SANCTUM_STATEFUL_DOMAINS=sync.sohojware.dev,localhost,127.0.0.1
```

---

## 🚀 Build & Deployment Steps

### **Local Development**

```bash
# Terminal 1: Laravel API
php artisan serve
# Runs on http://localhost:8000

# Terminal 2: React dev server (hot reload)
cd frontend
npm run dev
# Runs on http://localhost:5174
```

---

### **Production Build**

```bash
# 1. Build React app
cd frontend
npm run build
# Output: ../public/build/

# 2. Verify build exists
ls ../public/build/
# Should see: index.html, assets/

# 3. Commit and push
cd ..
git add public/build frontend/
git commit -m "Build frontend for production"
git push
```

---

### **Server Deployment**

```bash
# 1. Pull latest code
git pull

# 2. Install/update dependencies
composer install --optimize-autoloader --no-dev

# 3. Clear Laravel caches
php artisan optimize:clear
php artisan route:clear
php artisan view:clear
php artisan config:clear

# 4. Run migrations if needed
php artisan migrate --force

# 5. Set permissions
chmod -R 755 public/build
chmod -R 755 storage bootstrap/cache

# 6. Restart PHP-FPM (if using)
sudo systemctl restart php8.2-fpm

# 7. Restart web server (if needed)
sudo systemctl restart nginx
```

---

## 🔍 React Router Configuration

### **Router Setup** (`frontend/src/App.jsx`)

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/manager/*" element={<ManagerLayout />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Use BrowserRouter, NOT HashRouter:**
- HashRouter URLs: `https://example.com/#/admin/dashboard` ❌
- BrowserRouter URLs: `https://example.com/admin/dashboard` ✅
- Clean URLs, better SEO, proper back button behavior

---

## 🛠️ Testing Checklist

### ✅ **Local Testing**
```bash
# Build and test locally
cd frontend && npm run build
cd ..
php artisan serve

# Open: http://localhost:8000
# Should show React login page, not Laravel welcome
```

### ✅ **Production Testing**

1. **Root URL works:**
   - Visit: `https://your-domain.com/`
   - Should show: React login page

2. **Direct route access works:**
   - Visit: `https://your-domain.com/admin/dashboard`
   - Should show: React dashboard (after login)
   - NOT 404 or Laravel error

3. **Page refresh works:**
   - Navigate to any React route
   - Press F5 (refresh)
   - Should stay on same page, not redirect

4. **Logout works:**
   - Click logout button
   - Should redirect to `/login`
   - NOT show Laravel welcome page

5. **API calls work:**
   ```javascript
   // In browser console
   fetch('https://your-domain.com/api/me', { credentials: 'include' })
     .then(r => r.json())
     .then(console.log)
   ```
   - Should return user data (if logged in) or 401

6. **Assets load correctly:**
   - Open DevTools → Network tab
   - Check: `/build/assets/index-[hash].js` loads (200 OK)
   - Check: `/build/assets/index-[hash].css` loads (200 OK)
   - NOT 404 errors

---

## 🐛 Common Issues & Fixes

### **Issue 1: Laravel welcome page shows at `/`**

**Cause:** Catch-all route not working, or routes cached

**Fix:**
```bash
php artisan route:clear
php artisan view:clear
php artisan config:clear
```

Verify route:
```bash
php artisan route:list | grep react-app
# Should show: GET / → react-app
```

---

### **Issue 2: 404 on React routes after refresh**

**Cause:** Catch-all route missing or incorrect regex

**Fix:** Ensure `routes/web.php` has:
```php
Route::view('/{path}', 'react-app')
    ->where('path', '^(?!api|storage).*$');
```

---

### **Issue 3: Assets return 404 (e.g., `/build/assets/index.js` not found)**

**Cause:** Vite `base` path not set correctly

**Fix in `frontend/vite.config.js`:**
```javascript
base: '/build/', // MUST include trailing slash
```

Then rebuild:
```bash
cd frontend && npm run build
```

---

### **Issue 4: Logout doesn't clear session**

**Cause:** Session domain mismatch or cookies not clearing

**Fix `.env`:**
```env
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_SECURE_COOKIE=true
```

**Fix logout API:**
```php
public function logout(Request $request)
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    
    $response = response()->json(['message' => 'Logged out']);
    $response->withCookie(cookie('laravel_session', '', -1));
    $response->withCookie(cookie('XSRF-TOKEN', '', -1));
    
    return $response;
}
```

---

### **Issue 5: 401 Unauthorized on API calls**

**Cause:** Sanctum not recognizing domain as stateful

**Fix `.env`:**
```env
SANCTUM_STATEFUL_DOMAINS=your-domain.com,www.your-domain.com
```

Check in browser console:
```javascript
// Cookie should be sent
fetch('/api/me', { credentials: 'include' })
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│  Browser: https://example.com           │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  Nginx/Apache Web Server                │
│  (/var/www/html/public)                 │
└─────────┬───────────────────────────────┘
          │
          ├─── /                   → public/build/index.html (React)
          ├─── /login             → public/build/index.html (React)
          ├─── /admin/dashboard   → public/build/index.html (React)
          ├─── /build/assets/*    → Static files (CSS/JS)
          │
          └─── /api/*             → Laravel PHP Backend
               ├── /api/login     → AuthController@login
               ├── /api/logout    → AuthController@logout
               ├── /api/me        → AuthController@me
               └── /api/projects  → ProjectController@index
```

**Flow:**
1. User visits `https://example.com/admin/dashboard`
2. Nginx/Apache routes to Laravel `public/index.php`
3. Laravel sees route doesn't match `/api/*`
4. Catch-all route in `web.php` returns `react-app.blade.php`
5. Blade renders HTML with `<script src="/build/assets/index-[hash].js">`
6. Browser loads React bundle
7. React Router sees `/admin/dashboard` and renders correct component

---

## 🎉 Summary

**Why this approach works:**

1. ✅ **Single domain** - No CORS issues, cookies work seamlessly
2. ✅ **No separate Node server** - React is static files in `public/build`
3. ✅ **React Router with direct URLs** - Catch-all route forwards all paths to React
4. ✅ **Page refresh works** - Laravel always returns React HTML, router takes over
5. ✅ **Clean URLs** - BrowserRouter + server-side fallback = `/admin/dashboard` not `/#/admin/dashboard`
6. ✅ **API stays separate** - `/api/*` routes never hit catch-all
7. ✅ **Production ready** - Optimized build, cache busting, proper authentication

**Key takeaways:**
- `base: '/build/'` in Vite config
- Catch-all route with regex exclusions
- `views => false` in Fortify config
- Blade dynamically reads build hashes
- Same-domain cookies for Sanctum auth

---

## 📚 Additional Resources

- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [React Router v6 Documentation](https://reactrouter.com/en/main)
- [Laravel Sanctum SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)
- [Laravel Fortify](https://laravel.com/docs/fortify)

---

**Need help?** Check the troubleshooting section or verify:
```bash
# Routes are correct
php artisan route:list

# Build exists
ls -la public/build/

# Config is cached
php artisan config:show session
php artisan config:show sanctum
```
