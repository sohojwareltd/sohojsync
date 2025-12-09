# SohojSync - Project Management System

## Recent Updates: Project Assignment & Notification System

### Features Implemented

#### 1. Project Assignment System
- **Project Manager Assignment**: Assign a single project manager to oversee the project
- **Client Assignment**: Link projects to specific clients
- **Developer Assignment**: Assign multiple developers to work on the project
- **Automatic Notifications**: All assigned team members receive notifications

#### 2. Rich Text Editor
- Integrated **React Quill** for project descriptions
- Supports:
  - Headers (H1, H2, H3)
  - Bold, Italic, Underline, Strikethrough
  - Ordered and Unordered Lists
  - Links
  - Clean formatting

#### 3. Project Deadlines
- Set deadlines for projects
- Visual deadline indicators in project cards
- Days remaining calculations
- Automatic reminder system

#### 4. Notification System
- Real-time notification dropdown in header
- Notification types:
  - **Project Assigned**: When assigned to a project
  - **Project Created**: When a new project is created for a client
  - **Deadline Reminder**: Automatic reminders 7, 3, and 1 day(s) before deadline
- Mark as read functionality
- Mark all as read
- Unread count badge
- Auto-refresh every 30 seconds

#### 5. Artisan Command for Deadline Checking
- Command: `php artisan project:check-deadlines`
- Automatically runs daily at 9:00 AM
- Checks all projects with upcoming deadlines
- Creates notifications and reminders for:
  - Project Managers
  - All assigned developers
  - Clients (if configured)

### Database Tables

#### projects (Updated)
- `project_manager_id` - Foreign key to users (project_manager role)
- `client_id` - Foreign key to users (client role)
- `deadline` - Date field for project deadline
- `status` - Enum: planning, in_progress, review, completed, on_hold, cancelled

#### project_members (New)
- `project_id` - Foreign key to projects
- `user_id` - Foreign key to users (developer role)
- `assigned_at` - Timestamp of assignment

#### notifications (New)
- `user_id` - Foreign key to users
- `type` - Notification type (project_assigned, deadline_reminder, project_created)
- `title` - Notification title
- `message` - Notification message
- `related_type` - Related model type (e.g., Project)
- `related_id` - Related model ID
- `is_read` - Boolean flag
- `read_at` - Timestamp when read

### API Endpoints

#### Project Management
```
GET    /api/projects                        - List all projects (filtered by user role)
POST   /api/projects                        - Create new project with assignments
GET    /api/projects/{id}                   - Get project details
PUT    /api/projects/{id}                   - Update project and assignments
DELETE /api/projects/{id}                   - Delete project
GET    /api/projects/users-for-assignment   - Get available users for assignment
GET    /api/projects/statistics             - Get project statistics
```

#### Notifications
```
GET    /api/notifications                   - Get user notifications (paginated)
GET    /api/notifications/unread-count      - Get unread notification count
PATCH  /api/notifications/{id}/mark-read    - Mark single notification as read
PATCH  /api/notifications/mark-all-read     - Mark all notifications as read
DELETE /api/notifications/{id}              - Delete notification
```

### Frontend Components

#### Projects Page Updates
- Assignment dropdowns for Project Manager and Client
- Multi-select checkboxes for Developers
- React Quill rich text editor for descriptions
- Date picker for deadline
- Enhanced status options with color coding
- Display assigned team members in project cards
- Deadline display with visual indicators

#### NotificationDropdown Component
- Bell icon with unread count badge
- Dropdown with notification list
- Click to mark as read
- Auto-refresh functionality
- Empty state for no notifications
- Different icons for notification types

### User Roles & Permissions

#### Admin
- Full access to all projects
- Can assign any user to projects
- Receives notifications for system-wide events

#### Project Manager
- Can create and manage assigned projects
- Sees only projects they manage
- Receives notifications for:
  - Project assignments
  - Deadline reminders for their projects

#### Developer
- Sees only projects they're assigned to
- Receives notifications for:
  - Project assignments
  - Deadline reminders for assigned projects

#### Client
- Sees only projects assigned to them
- Receives notifications for:
  - New projects created for them
  - Project updates

### Task Scheduler Setup

To enable automatic deadline checking, add this to your server's crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

This will run the scheduler every minute, which will execute the deadline check command daily at 9:00 AM.

### Manual Command Execution

You can manually check deadlines anytime:

```bash
php artisan project:check-deadlines
```

### Color Scheme

The system uses a consistent color palette:

#### Status Colors
- **Planning**: Purple (`bg-purple-100 text-purple-700`)
- **In Progress**: Blue (`bg-blue-100 text-blue-700`)
- **Review**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Completed**: Green (`bg-emerald-100 text-emerald-700`)
- **On Hold**: Orange (`bg-orange-100 text-orange-700`)
- **Cancelled**: Gray (`bg-gray-100 text-gray-600`)

#### Primary Colors
- Purple: `rgb(61, 45, 80)` - Headers, primary elements
- Secondary: `rgb(155 2 50 / 76%)` - Buttons, accents
- Rose/Pink: For notifications and badges

### Dependencies

#### Backend
- Laravel 10+
- Laravel Sanctum (Authentication)
- MySQL/MariaDB

#### Frontend
- React 18.2.0
- React Quill (Rich text editor)
- Axios (API calls)
- Tailwind CSS (Styling)

### Installation Notes

1. Install React Quill:
```bash
cd frontend
npm install react-quill
```

2. Import Quill styles in your component:
```jsx
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
```

3. Run migrations:
```bash
php artisan migrate
```

4. Test the deadline checker:
```bash
php artisan project:check-deadlines
```

### Testing the Features

1. **Create a Project**:
   - Go to Projects page
   - Click "New Project"
   - Fill in all fields including assignments and deadline
   - Submit

2. **Check Notifications**:
   - Assigned users will receive notifications immediately
   - Click the bell icon to view notifications
   - Click on a notification to mark it as read

3. **Test Deadline Reminders**:
   - Create a project with a deadline 3 days from now
   - Run: `php artisan project:check-deadlines`
   - Assigned users will receive deadline reminder notifications

4. **View Projects**:
   - Switch between Grid and Table views
   - See assigned team members in each view
   - Filter by status
   - Search by project name or description

### Future Enhancements

- Email notifications for deadline reminders
- SMS notifications option
- Notification preferences (user can choose which notifications to receive)
- Project timeline/Gantt chart view
- Task assignment within projects
- File attachments for projects
- Project comments/discussion board
- Project activity feed

---

**Last Updated**: December 2025
**Version**: 2.0.0
