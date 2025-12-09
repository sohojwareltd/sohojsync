# SohojSync - Laravel + React Project Management System

A complete full-stack project management application built with Laravel (backend API) and React with Vite (frontend SPA). Features cookie-based authentication using Laravel Sanctum, a modern design system with Tailwind CSS, and a responsive UI that works on both desktop and mobile devices.

---

## 🎨 Design System

### Color Palette
- **Primary (Dark Royal Blue)**: `#22177A` - Sidebar background, primary buttons
- **Accent (Soft Indigo)**: `#605EA1` - Hover states, secondary elements
- **Muted Teal Grey**: `#8EA3A6` - Background elements
- **Soft Pastel Yellow**: `#E6E9AF` - Highlights, empty states
- **Background**: `#F7F7FB` - Main content area

### Typography
- **Font Family**: Inter (loaded from Google Fonts)
- **H1**: 32px
- **H2**: 26px
- **Body**: 16px

---

## 📁 Project Structure

```
sohojsync/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php
│   │           ├── ProjectController.php
│   │           └── TaskController.php
│   └── Models/
│       ├── User.php
│       ├── Project.php
│       └── Task.php
├── config/
│   ├── sanctum.php
│   └── cors.php
├── database/
│   ├── migrations/
│   │   ├── 2025_12_06_000001_create_projects_table.php
│   │   └── 2025_12_06_000002_create_tasks_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── Icons.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CommonHeader.jsx
│   │   │   ├── MobileBottomNav.jsx
│   │   │   └── DrawerMenu.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── Settings.jsx
│   │   ├── router/
│   │   │   └── index.jsx
│   │   ├── utils/
│   │   │   ├── axiosInstance.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── index.html
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.1 or higher
- Composer
- Node.js 18+ and npm
- MySQL or PostgreSQL database
- Laravel Sanctum package (will be installed via composer)

---

## ⚙️ Backend Setup (Laravel)

### 1. Install Dependencies
```bash
composer install
```

### 2. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

**IMPORTANT**: Edit `.env` and set the following values:

```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sohojsync
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

# Session Configuration (CRITICAL for Sanctum)
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost

# Sanctum Configuration (CRITICAL for authentication)
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Application URL
APP_URL=http://localhost:8000
```

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Install and Configure Sanctum
If Sanctum is not already installed:
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 5. Run Database Migrations
```bash
php artisan migrate
```

### 6. Seed Demo Data
```bash
php artisan db:seed
```

This creates 3 demo users with different roles and sample projects/tasks:

**Admin User:**
- **Email**: admin@example.com
- **Password**: password
- **Access**: Full system overview, all projects, all tasks

**Manager User:**
- **Email**: manager@example.com
- **Password**: password
- **Access**: Own projects, team task management

**Member User:**
- **Email**: member@example.com
- **Password**: password
- **Access**: Personal assigned tasks only

### 7. Start the Laravel Development Server
```bash
php artisan serve --port=8000
```

The backend API will be available at `http://localhost:8000`

---

## 🎨 Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.local.example .env
```

The default configuration should work:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Start the Vite Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🔐 Authentication Flow

The application uses **Laravel Sanctum cookie-based authentication**:

1. Frontend calls `/sanctum/csrf-cookie` to get CSRF token
2. Frontend submits login credentials to `/api/login`
3. Laravel sets a session cookie (httpOnly, secure in production)
4. All subsequent requests include the session cookie automatically
5. Protected routes use `auth:sanctum` middleware

**Key Configuration Points**:
- `SESSION_DOMAIN=localhost` in `.env` (backend)
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173` in `.env` (backend)
- `withCredentials: true` in axios (frontend)
- CORS configured to accept `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get authenticated user (protected)
- `POST /api/logout` - Logout user (protected)

### Projects
- `GET /api/projects` - List all projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/{id}` - Get single project (protected)
- `PUT /api/projects/{id}` - Update project (protected)
- `DELETE /api/projects/{id}` - Delete project (protected)

### Tasks
- `GET /api/tasks` - List all tasks (protected)
- `GET /api/tasks?status=open` - Filter tasks by status
- `POST /api/tasks` - Create new task (protected)
- `GET /api/tasks/{id}` - Get single task (protected)
- `PUT /api/tasks/{id}` - Update task (protected)
- `DELETE /api/tasks/{id}` - Delete task (protected)

---

## 📱 Features

### Responsive Design
- **Desktop**: Collapsible sidebar navigation
- **Mobile**: Bottom navigation bar + drawer menu
- Fully responsive cards and layouts

### Authentication
- Cookie-based session authentication
- Protected routes with automatic redirect
- Persistent login state

### UI Components
- Reusable Button, Card, Input components
- Loading states with spinner
- Page headers with action buttons
- SVG icon library

### Pages
1. **Login** - User authentication
2. **Dashboard** - Overview with stats and recent items
3. **Projects** - Project management
4. **Tasks** - Task tracking with filtering
5. **Settings** - User preferences and account management

---

## 🛠️ Development Commands

### Backend (Laravel)
```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Seed database
php artisan db:seed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Run tests (if configured)
php artisan test
```

### Frontend (React)
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🚨 Common Issues & Troubleshooting

### CORS Errors
- Ensure `SANCTUM_STATEFUL_DOMAINS=localhost:5173` in `.env`
- Check `config/cors.php` has `'allowed_origins' => ['http://localhost:5173']`
- Verify `'supports_credentials' => true` in `config/cors.php`

### 419 CSRF Token Mismatch
- Frontend must call `/sanctum/csrf-cookie` before login
- Check `SESSION_DOMAIN=localhost` in `.env`
- Ensure `withCredentials: true` in axios config

### Authentication Not Persisting
- Verify session driver is set to `cookie` or `database`
- Check browser allows cookies (not in private/incognito mode)
- Ensure `SESSION_DOMAIN` matches your domain

### Database Connection Failed
- Verify database credentials in `.env`
- Ensure MySQL/PostgreSQL server is running
- Check database exists: `CREATE DATABASE sohojsync;`

---

## 📦 Production Deployment

### Backend
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Configure proper `SESSION_DOMAIN` and `SANCTUM_STATEFUL_DOMAINS`
4. Use HTTPS (set `SESSION_SECURE_COOKIE=true`)
5. Run `php artisan config:cache`
6. Run `php artisan route:cache`
7. Set up proper web server (Nginx/Apache)

### Frontend
1. Update `VITE_API_URL` to production API URL
2. Run `npm run build`
3. Deploy `dist/` folder to static hosting or CDN
4. Configure proper CORS origins in Laravel

### Security Checklist
- [ ] HTTPS enabled on both frontend and backend
- [ ] Secure session cookies (`SESSION_SECURE_COOKIE=true`)
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials secured
- [ ] CORS limited to production domain
- [ ] Rate limiting enabled on API routes

---

## 🧪 Testing

### Backend Tests
Create tests in `tests/Feature/` and `tests/Unit/`:

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=AuthTest
```

### Frontend Tests (Optional)
Install testing libraries:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

---

## 📝 Additional Notes

### Session Configuration
The application uses cookie-based sessions. For local development:
- `SESSION_DOMAIN=localhost` (no port)
- `SESSION_SAME_SITE=lax` (allows cross-origin in development)

For production with custom domain:
- `SESSION_DOMAIN=.yourdomain.com` (note the leading dot for subdomains)
- `SESSION_SAME_SITE=strict`
- `SESSION_SECURE_COOKIE=true` (requires HTTPS)

### Extending the Application
- Add new models in `app/Models/`
- Create controllers in `app/Http/Controllers/Api/`
- Define routes in `routes/api.php`
- Create React pages in `frontend/src/pages/`
- Add routes in `frontend/src/router/index.jsx`

### Database Schema
- **users**: id, name, email, password, timestamps
- **projects**: id, title, description, owner_id, timestamps
- **tasks**: id, project_id, title, description, status (enum: open/done), due_date, assigned_to, timestamps

---

## 📄 License

This project is open-source and available for educational and commercial use.

---

## 👥 Demo Credentials

After seeding the database, use these credentials to login:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** 👑 | admin@example.com | password | Full system access, all projects/tasks, user management |
| **Manager** 👔 | manager@example.com | password | Team management, project oversight, task assignment |
| **Member** 👤 | member@example.com | password | Personal tasks, individual assignments, task completion |

---

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Laravel, React, Vite, and Tailwind CSS**
