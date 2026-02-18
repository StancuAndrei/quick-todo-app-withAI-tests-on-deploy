import { useState, useEffect } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import './App.css'

function App() {
    const [todos, setTodos] = useState([])
    const [editingTodo, setEditingTodo] = useState(null)

    // Load todos from localStorage on mount
    useEffect(() => {
        const savedTodos = localStorage.getItem('todos')
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos))
        }
    }, [])

    // Save todos to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos))
    }, [todos])

    // CREATE: Add a new todo
    const addTodo = (text) => {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        }
        setTodos([...todos, newTodo])
    }

    // UPDATE: Edit an existing todo
    const updateTodo = (id, newText) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, text: newText } : todo
        ))
        setEditingTodo(null)
    }

    // UPDATE: Toggle todo completion status
    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ))
    }

    // DELETE: Remove a todo
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    // Start editing a todo
    const startEdit = (todo) => {
        setEditingTodo(todo)
    }

    // Cancel editing
    const cancelEdit = () => {
        setEditingTodo(null)
    }

    return (
        <div className="app">
            <div className="container">
                <header className="app-header">
                    <h1>📝 TODO App</h1>
                    <p className="subtitle">Manage your tasks efficiently</p>
                </header>

                <TodoForm
                    onSubmit={editingTodo ? updateTodo : addTodo}
                    editingTodo={editingTodo}
                    onCancel={cancelEdit}
                />

                <div className="stats">
                    <span className="stat-item">
                        <strong>{todos.length}</strong> Total
                    </span>
                    <span className="stat-item">
                        <strong>{todos.filter(t => t.completed).length}</strong> Completed
                    </span>
                    <span className="stat-item">
                        <strong>{todos.filter(t => !t.completed).length}</strong> Active
                    </span>
                </div>

                <TodoList
                    todos={todos}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={startEdit}
                />

                {todos.length === 0 && (
                    <div className="empty-state">
                        <p>🎉 No tasks yet! Add one above to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
