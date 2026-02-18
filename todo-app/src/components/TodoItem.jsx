function TodoItem({ todo, onToggle, onDelete, onEdit }) {
    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
                <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
            </div>

            <div className="todo-actions">
                <button
                    className="btn-icon btn-edit"
                    onClick={() => onEdit(todo)}
                    title="Edit task"
                >
                    ✏️
                </button>
                <button
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(todo.id)}
                    title="Delete task"
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

export default TodoItem
