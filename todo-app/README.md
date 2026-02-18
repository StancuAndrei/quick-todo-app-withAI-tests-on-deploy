# TODO App - React CRUD Application

A modern, responsive TODO application built with React.js and Vite, featuring full CRUD (Create, Read, Update, Delete) functionality with localStorage persistence.

## Features

✅ **Create** - Add new tasks to your list  
✏️ **Read** - View all your tasks with completion status  
🔄 **Update** - Edit existing tasks and toggle completion  
🗑️ **Delete** - Remove tasks you no longer need  
💾 **Persistence** - Tasks are saved in localStorage  
📊 **Statistics** - Track total, completed, and active tasks  
🎨 **Modern UI** - Beautiful gradient design with smooth animations  
📱 **Responsive** - Works perfectly on desktop and mobile devices  

## Project Structure

```
todo-app/
├── src/
│   ├── components/
│   │   ├── TodoForm.jsx      # Form for adding/editing tasks
│   │   ├── TodoList.jsx      # Container for todo items
│   │   └── TodoItem.jsx      # Individual todo item component
│   ├── App.jsx               # Main application component
│   ├── App.css               # App-specific styles
│   ├── index.css             # Global styles
│   └── main.jsx              # Application entry point
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite configuration
```

## Technology Stack

- **React 18.2** - UI library with hooks
- **Vite 5.0** - Fast build tool and dev server
- **CSS3** - Modern styling with animations
- **localStorage** - Client-side data persistence

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd "d:\projects\quick todo app with CICD integration tests\todo-app"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - React and ReactDOM
   - Vite and the React plugin
   - All necessary development dependencies

## How to Run the Application

### Development Mode (Recommended)

Run the development server with hot module replacement:

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

You'll see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to the URL shown in the terminal.

### Production Build

To create an optimized production build:

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## How to Use the Application

1. **Add a Task**: Type your task in the input field and click "+ Add"
2. **Complete a Task**: Click the checkbox next to a task to mark it as complete
3. **Edit a Task**: Click the ✏️ (edit) icon, modify the text, and click "✓ Update"
4. **Delete a Task**: Click the 🗑️ (delete) icon to remove a task
5. **View Statistics**: See total, completed, and active tasks at the top

All tasks are automatically saved to your browser's localStorage, so they persist even after closing the browser.

## CRUD Operations Explained

### CREATE
- **Component**: `TodoForm.jsx`
- **Function**: `addTodo()` in `App.jsx`
- **Action**: Adds a new todo with unique ID and timestamp

### READ
- **Component**: `TodoList.jsx` and `TodoItem.jsx`
- **Function**: Renders the todos array from state
- **Action**: Displays all tasks with their current status

### UPDATE
- **Component**: `TodoForm.jsx` (edit mode)
- **Functions**: `updateTodo()` and `toggleTodo()` in `App.jsx`
- **Actions**: 
  - Edit task text
  - Toggle completion status

### DELETE
- **Component**: `TodoItem.jsx`
- **Function**: `deleteTodo()` in `App.jsx`
- **Action**: Removes task from the list

## Testing

This project includes a comprehensive test suite with **148+ tests** covering unit, functional, and acceptance testing.

### Test Structure

```
tests/
├── unit/          # Component tests (Vitest + React Testing Library) - 60+ tests
├── functional/    # Feature flow tests (Playwright) - 53+ tests
└── acceptance/    # End-to-end user scenarios (Playwright) - 35+ tests
```

### Running Tests

```bash
# Install test dependencies (first time only)
npm install
npm run playwright:install

# Run all unit tests
npm run test:unit

# Run unit tests in watch mode (development)
npm run test:unit -- --watch

# Run functional tests
npm run test:functional

# Run acceptance tests
npm run test:acceptance

# Run ALL tests
npm run test:all

# Generate coverage report
npm run test:unit:coverage
```

### Test Categories

**Unit Tests** (60+ tests):
- TodoItem component - rendering, events, CSS classes
- TodoForm component - add/edit modes, validation
- TodoList component - list rendering, empty state
- App component - CRUD operations, statistics, localStorage

**Functional Tests** (53+ tests):
- CRUD operations - create, read, update, delete flows
- State management - statistics, edit mode, visual state
- LocalStorage persistence - save/load, data integrity

**Acceptance Tests** (35+ tests):
- User journeys - first-time user, returning user, power user
- Task management - daily workflows, realistic usage patterns
- Edge cases - validation, rapid actions, error handling

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## Troubleshooting

### PowerShell Execution Policy Error

If you encounter an error about running scripts being disabled:

**Option 1 - Use CMD instead:**
```cmd
npm run dev
```

**Option 2 - Temporarily allow scripts (run PowerShell as Administrator):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the npm commands normally.

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port. Check the terminal output for the actual URL.

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

This is a demonstration project for learning purposes.
