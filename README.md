# SmartKazi Frontend

A modern task management and collaboration platform built with React, Vite, and TailwindCSS.

![SmartKazi](https://img.shields.io/badge/SmartKazi-Task%20Management-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## 🚀 Features

- ✅ **User Authentication** - Login/Register with JWT
- 📊 **Dashboard** - Overview of projects and tasks
- 🎯 **Project Management** - Create, edit, and manage projects
- 📋 **Kanban Board** - Drag-and-drop task management
- 💬 **Real-time Comments** - Collaborate with team members
- 📎 **File Attachments** - Upload and manage files
- 👥 **Team Collaboration** - Invite and manage team members
- 📈 **Analytics** - Track project progress
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router** - Navigation
- **@dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smartkazi-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Avatar.jsx
│   │   └── Dropdown.jsx
│   ├── layout/          # Layout components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── project/         # Project-related components
│   │   ├── ProjectCard.jsx
│   │   └── CreateProjectModal.jsx
│   └── task/            # Task-related components
│       ├── TaskBoard.jsx
│       ├── TaskColumn.jsx
│       ├── TaskCard.jsx
│       ├── CreateTaskModal.jsx
│       └── TaskDetailModal.jsx
├── pages/               # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── ProjectDetail.jsx
│   ├── TaskBoard.jsx
│   └── Profile.jsx
├── services/            # API services
│   ├── api.js
│   ├── authService.js
│   ├── projectService.js
│   └── taskService.js
├── store/               # State management (Zustand)
│   ├── authStore.js
│   ├── projectStore.js
│   └── taskStore.js
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Component Examples

### Button Component
```jsx
import Button from './components/common/Button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" loading={isLoading}>
  Loading...
</Button>
```

### Modal Component
```jsx
import Modal from './components/common/Modal'

<Modal isOpen={isOpen} onClose={handleClose} title="Create Project">
  {/* Modal content */}
</Modal>
```

### Drag and Drop Board
```jsx
import { DndContext } from '@dnd-kit/core'
import TaskColumn from './components/task/TaskColumn'

<DndContext onDragEnd={handleDragEnd}>
  <TaskColumn status="TODO" tasks={todoTasks} />
  <TaskColumn status="IN_PROGRESS" tasks={inProgressTasks} />
</DndContext>
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Lint
npm run lint         # Run ESLint
```

## 🌐 API Integration

The frontend is configured to work with a Spring Boot backend. Update the proxy settings in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

## 🎯 Key Features Implementation

### Authentication
- JWT token stored in localStorage
- Axios interceptor for auth headers
- Protected routes with redirect

### State Management
- Zustand for global state
- Separate stores for auth, projects, and tasks
- Persistent auth state

### Real-time Updates
- WebSocket integration (commented out - implement when backend is ready)
- Optimistic UI updates
- Toast notifications

### Drag and Drop
- @dnd-kit for smooth drag and drop
- Sortable task cards
- Column-based organization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist` folder.

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🔒 Security

- JWT authentication
- Protected API routes
- Input validation
- XSS prevention
- CSRF protection (when using cookies)

## 🎨 Customization

### Color Theme
Update colors in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ... other shades
      }
    }
  }
}
```

### Add New Pages
1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Update sidebar navigation in `Sidebar.jsx`

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hidden sidebar on mobile
- Responsive grid layouts

## 🐛 Common Issues

### Issue: CORS errors
**Solution**: Ensure backend CORS is configured correctly or use Vite proxy

### Issue: Build fails
**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Hot reload not working
**Solution**: Check Vite config and ensure correct port

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing library
- Vite for the blazing fast build tool
- TailwindCSS for the utility-first CSS framework
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@smartkazi.com

---

Built with ❤️ by SmartKazi Team
