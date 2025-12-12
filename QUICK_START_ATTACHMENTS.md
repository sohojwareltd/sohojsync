# Quick Reference Guide - Project Attachments & Details

## Feature Overview

### 1. Project File Attachments
**Location:** Project Create/Edit Modal
**Max File Size:** 10MB per file
**Supported Types:** All file types (images, PDFs, documents, etc.)

### 2. Project Details Dashboard
**Access:** Click "View Details" button on any project
**Shows:** 
- Complete project analysis
- Progress tracking with charts
- Task breakdown by status
- Team member list
- All project information

---

## Step-by-Step Usage

### Adding Attachments to a Project

1. **Create New Project**
   - Click "New Project" button in header
   - Fill in basic details (title, description, etc.)

2. **Attach Files**
   - Scroll down to "Project Attachments" section
   - Click the upload area OR drag files onto it
   - Files display in list below
   - See file name, size, and upload progress

3. **Manage Files**
   - Individual file: Click ✕ button to remove
   - All files: Click "Remove All" to clear list

4. **Complete**
   - Click "Create Project" button
   - Files upload automatically after project creation
   - Progress bars show upload status

### Editing Project Attachments

1. Click project card → "Edit" button
2. Existing project details load
3. Add new attachments using same process
4. Click "Update Project" to save

### Viewing Project Details

1. From Projects List:
   - **Grid View:** Click info icon on card
   - **Table View:** Click info icon in actions column

2. Project Details Page Shows:
   - Project overview section
   - Progress bar with percentage
   - Status statistics (5 boxes)
   - Status distribution chart
   - All tasks with status badges
   - Team members with roles

3. Return to Projects:
   - Click "Back to Projects" link at top

---

## Feature Highlights

### Progress Tracking
- **Overall Progress:** Percentage of completed tasks
- **Visual Indicators:** Gradient progress bar
- **Status Breakdown:** Colored boxes for each status
- **Distribution Chart:** Detailed breakdown bars

### Status Types
- 🟢 **Completed:** Tasks finished and closed
- 🔵 **In Progress:** Currently being worked on
- 🟡 **Pending:** Waiting to start
- 🟠 **On Hold:** Paused/waiting for something
- ⚫ **Total:** All tasks combined

### File Management
- ✓ Drag-and-drop upload
- ✓ Multiple files at once
- ✓ Real-time progress tracking
- ✓ File type detection
- ✓ Size validation
- ✓ Individual removal option

---

## Technical Notes

### File Storage
Files stored in: `storage/app/public/project-attachments/{projectId}/`

### Database
New table: `project_attachments` tracks:
- File name & path
- Upload date & uploader
- File size & type
- Project association

### API Endpoints

**List Projects:**
```
GET /api/projects
```

**Create Project (with files):
```
POST /api/projects
POST /api/projects/upload-attachment (for each file)
```

**Get Project Details:**
```
GET /api/projects/{id}
GET /api/projects/{id}/tasks
```

---

## Troubleshooting

### File Upload Fails
- Check file size (max 10MB)
- Verify project was created successfully
- Check browser console for errors
- Ensure disk space available

### Progress Page Doesn't Load
- Verify project exists
- Check project permissions
- Refresh the page
- Check console for errors

### Files Not Showing
- Migration may not have run
- Check `project_attachments` table exists
- Verify file permissions in storage

---

## Demo Data

To test with sample projects:
```bash
php artisan db:seed
```

This creates test projects with:
- Various statuses
- Multiple team members
- Different progress levels
- Sample tasks

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Create Project | Click "New Project" button |
| Edit Project | Click pencil icon |
| Delete Project | Click trash icon |
| View Details | Click info icon |
| View Tasks | Click checklist icon |

---

## User Permissions

### Who Can Upload Attachments?
- Project Owner ✓
- Project Manager ✓
- Admin ✓
- Team Members ✗

### Who Can View Details?
- All authenticated users (based on project access)

### Authorization
- Enforced at API level
- Files organized by project
- User ownership verified

---

## Tips & Best Practices

1. **Organize Files:** Use consistent naming conventions
2. **File Size:** Compress large files before upload
3. **Project Details:** Check before assigning tasks
4. **Progress Updates:** Monitor status distribution regularly
5. **Team Communication:** Share project details link with team

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all migrations ran
3. Check file permissions
4. Review server logs
5. Contact system administrator

