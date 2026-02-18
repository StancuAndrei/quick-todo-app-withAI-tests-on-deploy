import { useState, useEffect } from 'react'

function TodoForm({ onSubmit, editingTodo, onCancel }) {
    const [input, setInput] = useState('')

    // Update input when editing a todo
    useEffect(() => {
        if (editingTodo) {
            setInput(editingTodo.text)
        } else {
            setInput('')
        }
    }, [editingTodo])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!input.trim()) {
            alert('Please enter a task!')
            return
        }

        if (editingTodo) {
            onSubmit(editingTodo.id, input.trim())
        } else {
            onSubmit(input.trim())
        }

        setInput('')
    }

    const handleCancel = () => {
        setInput('')
        onCancel()
    }

    return (
        <form className="todo-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="text"
                    className="todo-input"
                    placeholder={editingTodo ? "Update your task..." : "Add a new task..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                />
                <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                        {editingTodo ? '✓ Update' : '+ Add'}
                    </button>
                    {editingTodo && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                        >
                            ✕ Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    )
}

export default TodoForm
