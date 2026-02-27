# Task Management & Collaboration Platform - Software Architecture

## 1. System Overview

### Project Name
**TaskFlow** - A modern task management and collaboration platform

### Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Spring Boot 3.x (Java 17+)
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSockets (Spring WebSocket + STOMP)

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                  (React + Vite + Tailwind)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Projects  │  │  Tasks   │  │ Profile  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│                    (Spring Boot Backend)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication & Authorization (JWT + Spring Sec)   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │UserSvc   │  │ProjectSvc│  │ TaskSvc  │  │CommentSvc│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │NotifySvc │  │FileSvc   │  │AnalytSvc │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer (JPA/Hibernate)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────┐  ┌─────────┐  ┌──────┐  ┌─────────┐  ┌────────┐ │
│  │Users │  │Projects │  │Tasks │  │Comments │  │  Files │ │
│  └──────┘  └─────────┘  └──────┘  └─────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Design

### Core Tables

#### **users**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **projects**
```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, COMPLETED
    color VARCHAR(7), -- Hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **project_members**
```sql
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER, VIEWER
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);
```

#### **tasks**
```sql
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'TODO', -- TODO, IN_PROGRESS, IN_REVIEW, DONE
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    position INTEGER DEFAULT 0, -- For ordering within status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **comments**
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **attachments**
```sql
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **activity_logs**
```sql
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- CREATED, UPDATED, DELETED, ASSIGNED, etc.
    entity_type VARCHAR(50), -- TASK, COMMENT, PROJECT, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
```

---

## 4. Backend Architecture (Spring Boot)

### Project Structure
```
src/main/java/com/taskflow/
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ProjectController.java
│   ├── TaskController.java
│   ├── CommentController.java
│   ├── UserController.java
│   └── WebSocketController.java
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── CreateProjectRequest.java
│   │   └── CreateTaskRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── ProjectResponse.java
│       └── TaskResponse.java
├── entity/
│   ├── User.java
│   ├── Project.java
│   ├── Task.java
│   ├── Comment.java
│   ├── Attachment.java
│   └── ActivityLog.java
├── repository/
│   ├── UserRepository.java
│   ├── ProjectRepository.java
│   ├── TaskRepository.java
│   ├── CommentRepository.java
│   └── ActivityLogRepository.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── ProjectService.java
│   ├── TaskService.java
│   ├── CommentService.java
│   ├── FileService.java
│   └── NotificationService.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
└── exception/
    ├── GlobalExceptionHandler.java
    └── custom/
        ├── ResourceNotFoundException.java
        └── UnauthorizedException.java
```

### Key REST API Endpoints

#### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login and get JWT token
POST   /api/auth/refresh           - Refresh JWT token
GET    /api/auth/me                - Get current user info
```

#### Projects
```
GET    /api/projects               - Get all user's projects
POST   /api/projects               - Create new project
GET    /api/projects/{id}          - Get project details
PUT    /api/projects/{id}          - Update project
DELETE /api/projects/{id}          - Delete project
GET    /api/projects/{id}/members  - Get project members
POST   /api/projects/{id}/members  - Add member to project
DELETE /api/projects/{id}/members/{userId} - Remove member
```

#### Tasks
```
GET    /api/projects/{id}/tasks    - Get all tasks in project
POST   /api/projects/{id}/tasks    - Create new task
GET    /api/tasks/{id}             - Get task details
PUT    /api/tasks/{id}             - Update task
DELETE /api/tasks/{id}             - Delete task
PATCH  /api/tasks/{id}/status      - Update task status
PATCH  /api/tasks/{id}/assign      - Assign task to user
PATCH  /api/tasks/{id}/position    - Update task position (drag & drop)
```

#### Comments
```
GET    /api/tasks/{id}/comments    - Get task comments
POST   /api/tasks/{id}/comments    - Add comment
PUT    /api/comments/{id}          - Update comment
DELETE /api/comments/{id}          - Delete comment
```

#### Files
```
POST   /api/tasks/{id}/attachments - Upload file
GET    /api/attachments/{id}       - Download file
DELETE /api/attachments/{id}       - Delete file
```

#### Analytics
```
GET    /api/projects/{id}/analytics - Get project analytics
GET    /api/users/dashboard         - Get user dashboard data
```

### WebSocket Endpoints
```
/ws                                 - WebSocket connection endpoint
/topic/project/{projectId}          - Subscribe to project updates
/app/task/update                    - Send task update
```

### Security Configuration Example
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 5. Frontend Architecture (React + Vite)

### Project Structure
```
src/
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Dropdown.jsx
│   │   └── Avatar.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── project/
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectList.jsx
│   │   ├── CreateProjectModal.jsx
│   │   └── ProjectSettings.jsx
│   ├── task/
│   │   ├── TaskBoard.jsx
│   │   ├── TaskColumn.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskDetailModal.jsx
│   │   └── CreateTaskModal.jsx
│   ├── comment/
│   │   ├── CommentList.jsx
│   │   └── CommentForm.jsx
│   └── dashboard/
│       ├── StatsCard.jsx
│       ├── ActivityFeed.jsx
│       └── TaskChart.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── ProjectDetail.jsx
│   ├── TaskBoard.jsx
│   └── Profile.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProjects.js
│   ├── useTasks.js
│   ├── useWebSocket.js
│   └── useFileUpload.js
├── services/
│   ├── api.js              - Axios instance
│   ├── authService.js
│   ├── projectService.js
│   ├── taskService.js
│   ├── commentService.js
│   └── websocketService.js
├── store/
│   ├── authSlice.js
│   ├── projectSlice.js
│   ├── taskSlice.js
│   └── store.js            - Redux/Zustand store
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── routes/
│   ├── PrivateRoute.jsx
│   └── routes.jsx
├── App.jsx
└── main.jsx
```

### State Management Options

**Option 1: Redux Toolkit (Recommended for learning)**
```javascript
// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import projectReducer from './projectSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
  },
});
```

**Option 2: Zustand (Simpler, modern alternative)**
```javascript
// store/useAuthStore.js
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Key Libraries to Install
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "sockjs-client": "^1.6.1",
    "@stomp/stompjs": "^7.0.0",
    "react-dropzone": "^14.2.3"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 6. Core Features Implementation Guide

### 6.1 Authentication Flow
```
1. User enters credentials → Frontend
2. POST /api/auth/login → Backend validates
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header for all requests
6. Backend validates token on each request
```

### 6.2 Real-time Task Updates (WebSocket)
```javascript
// Frontend - websocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  connect(projectId, onMessageReceived) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(
        `/topic/project/${projectId}`,
        (message) => {
          onMessageReceived(JSON.parse(message.body));
        }
      );
    });
  }
  
  sendTaskUpdate(taskUpdate) {
    this.stompClient.send(
      '/app/task/update',
      {},
      JSON.stringify(taskUpdate)
    );
  }
}
```

### 6.3 Drag & Drop Task Board
```javascript
// TaskBoard.jsx using @dnd-kit
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function TaskBoard({ tasks }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // Update task position and status
    updateTaskPosition(active.id, over.id);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(status => (
          <TaskColumn key={status} status={status} tasks={tasks.filter(t => t.status === status)} />
        ))}
      </div>
    </DndContext>
  );
}
```

### 6.4 File Upload
```java
// Backend - FileService.java
@Service
public class FileService {
    private final String uploadDir = "uploads/";
    
    public Attachment uploadFile(MultipartFile file, Long taskId, User user) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        
        Files.copy(file.getInputStream(), filePath);
        
        Attachment attachment = new Attachment();
        attachment.setTaskId(taskId);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(filePath.toString());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedBy(user);
        
        return attachmentRepository.save(attachment);
    }
}
```

---

## 7. Deployment Architecture

### Development Environment
```
Frontend: Vite dev server (localhost:5173)
Backend: Spring Boot (localhost:8080)
Database: PostgreSQL (localhost:5432)
```

### Production Deployment Options

#### Option 1: Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: taskflow_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/taskflow
      SPRING_DATASOURCE_USERNAME: taskflow_user
      SPRING_DATASOURCE_PASSWORD: secure_password
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Option 2: Cloud Deployment
- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render / AWS EC2
- **Database**: Railway PostgreSQL / AWS RDS / Supabase

---

## 8. Security Considerations

1. **JWT Token Security**
   - Store tokens in httpOnly cookies (more secure than localStorage)
   - Implement token refresh mechanism
   - Set appropriate expiration times

2. **API Security**
   - Rate limiting on endpoints
   - Input validation and sanitization
   - SQL injection prevention (JPA handles this)
   - CORS configuration

3. **File Upload Security**
   - Validate file types and sizes
   - Scan for malware
   - Store outside web root

4. **Authorization**
   - Check user permissions on every action
   - Implement role-based access control (RBAC)

---

## 9. Performance Optimization

1. **Database**
   - Use indexes on frequently queried columns
   - Implement pagination for large datasets
   - Use database connection pooling

2. **Backend**
   - Cache frequently accessed data (Redis)
   - Use lazy loading for JPA relationships
   - Implement compression for API responses

3. **Frontend**
   - Code splitting and lazy loading routes
   - Optimize images
   - Implement virtual scrolling for long lists
   - Debounce search inputs

---

## 10. Testing Strategy

### Backend Testing
```java
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreateTask() throws Exception {
        mockMvc.perform(post("/api/projects/1/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"New Task\"}"))
            .andExpect(status().isCreated());
    }
}
```

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress or Playwright

---

## 11. Development Phases

### Phase 1: Foundation (Week 1-2)
- Set up project structure
- Database schema and migrations
- Basic authentication (login/register)
- Simple project CRUD

### Phase 2: Core Features (Week 3-4)
- Task board with drag & drop
- Task CRUD operations
- Comments system
- File attachments

### Phase 3: Real-time & Analytics (Week 5-6)
- WebSocket integration
- Dashboard with charts
- Activity logs
- Notifications

### Phase 4: Polish & Deploy (Week 7-8)
- UI/UX improvements
- Testing
- Performance optimization
- Deployment setup
- Documentation

---

## 12. CV Highlights

**What to emphasize:**
- Full-stack development with modern tech stack
- RESTful API design and implementation
- Real-time features using WebSockets
- Complex database relationships and queries
- Authentication & authorization (JWT, Spring Security)
- Responsive UI with Tailwind CSS
- State management (Redux/Zustand)
- File upload and management
- Docker containerization
- Cloud deployment experience

**GitHub README should include:**
- Architecture diagrams
- API documentation
- Setup instructions
- Screenshots/GIFs of features
- Technologies used
- Challenges overcome
