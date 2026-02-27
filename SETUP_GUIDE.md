# SmartKazi Frontend - Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js installed (v16 or higher) - [Download](https://nodejs.org/)
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/Command Prompt access

**Check Node.js version:**
```bash
node --version
# Should show v16.x.x or higher
```

### Step 2: Create Project Directory
```bash
# Create a new folder for your project
mkdir smartkazi-frontend
cd smartkazi-frontend
```

### Step 3: Copy All Files
Copy all the files from the output folder into your project directory. Your structure should look like:
```
smartkazi-frontend/
├── src/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── ...
```

### Step 4: Install Dependencies
```bash
npm install
```
⏱️ This will take 2-3 minutes

### Step 5: Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env if needed (optional for now)
```

### Step 6: Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 7: Open in Browser
Open `http://localhost:5173` in your browser!

---

## 📚 Detailed Setup Instructions

### Understanding the Project Structure

```
smartkazi-frontend/
│
├── src/                          # Source code
│   ├── components/              # Reusable components
│   │   ├── common/             # Buttons, Inputs, Modals
│   │   ├── layout/             # Navbar, Sidebar
│   │   ├── project/            # Project components
│   │   └── task/               # Task components
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   │
│   ├── services/                # API calls
│   │   ├── api.js              # Axios instance
│   │   ├── authService.js
│   │   └── ...
│   │
│   ├── store/                   # State management
│   │   ├── authStore.js
│   │   └── ...
│   │
│   ├── App.jsx                  # Main app
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
│
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── index.html                   # HTML template
```

### Key Dependencies Explained

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `vite` | Fast build tool |
| `tailwindcss` | CSS framework |
| `zustand` | State management (simpler than Redux) |
| `react-router-dom` | Navigation |
| `axios` | HTTP requests |
| `@dnd-kit` | Drag and drop |
| `react-hot-toast` | Notifications |
| `lucide-react` | Icons |
| `date-fns` | Date formatting |

### What Each Configuration File Does

#### `package.json`
- Lists all dependencies
- Contains scripts (dev, build, etc.)
- Project metadata

#### `vite.config.js`
- Configures Vite build tool
- Sets up proxy for API calls
- Defines path aliases

#### `tailwind.config.js`
- Customizes Tailwind theme
- Adds custom colors
- Configures content paths

#### `postcss.config.js`
- Processes CSS with Tailwind
- Adds autoprefixer for browser compatibility

---

## 🔧 Development Workflow

### Running the Project

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Making Changes

1. **Edit files** - Changes auto-reload in browser
2. **Check browser** - See updates instantly
3. **Check console** - Look for errors

### Common Development Tasks

#### Add a New Page
1. Create file in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/your-page" element={<YourPage />} />
   ```
3. Add link in `src/components/layout/Sidebar.jsx`

#### Create a New Component
1. Create file in `src/components/common/YourComponent.jsx`
2. Export component:
   ```jsx
   export default YourComponent
   ```
3. Import where needed:
   ```jsx
   import YourComponent from '../common/YourComponent'
   ```

#### Add an API Endpoint
1. Open `src/services/yourService.js`
2. Add function:
   ```jsx
   async getData() {
     const response = await api.get('/endpoint')
     return response.data
   }
   ```

---

## 🌐 Connecting to Backend

### When Backend is Ready

1. **Update .env file:**
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

2. **Test connection:**
   - Try to login
   - Check browser console for errors
   - Check Network tab in DevTools

3. **Common Issues:**
   - **CORS Error**: Backend needs CORS configuration
   - **401 Unauthorized**: Check JWT token
   - **404 Not Found**: Check API endpoint URL

### Backend CORS Configuration Example
Your Spring Boot backend should have:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## 🎨 Customization Guide

### Change Primary Color

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color-here',
    600: '#darker-shade',
    700: '#even-darker',
  }
}
```

### Change App Name

1. Edit `index.html` - Update `<title>`
2. Edit `src/components/layout/Navbar.jsx` - Update logo text
3. Edit `.env` - Update `VITE_APP_NAME`

### Add Custom Fonts

1. Import in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
   ```

2. Update `tailwind.config.js`:
   ```javascript
   fontFamily: {
     sans: ['Your Font', 'sans-serif'],
   }
   ```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check for syntax errors
npm run lint

# Clean and rebuild
rm -rf dist
npm run build
```

### Hot Reload Not Working
```bash
# Restart dev server
# Ctrl+C to stop, then:
npm run dev
```

---

## 📦 Building for Production

### Create Production Build
```bash
npm run build
```

This creates a `dist` folder with optimized files.

### Test Production Build Locally
```bash
npm run preview
```

### Deploy to Vercel (Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

### Deploy to Netlify (Free)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts
```

---

## 🎓 Learning Resources

### React
- [React Docs](https://react.dev/)
- [React Tutorial](https://react.dev/learn)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)

### TailwindCSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Zustand
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## ✅ Next Steps

1. ✅ Set up the frontend (you're here!)
2. ⏳ Set up the Spring Boot backend
3. ⏳ Connect frontend to backend
4. ⏳ Test all features
5. ⏳ Deploy to production

---

## 🆘 Getting Help

If you're stuck:
1. Check browser console for errors
2. Check terminal for error messages
3. Google the error message
4. Check GitHub issues
5. Ask in developer communities

---

## 🎉 You're Ready!

Your SmartKazi frontend is now set up and running!

**Next:** Start the backend server and connect the two.

Good luck with your project! 🚀
