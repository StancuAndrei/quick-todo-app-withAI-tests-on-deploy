import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodoList from '../../src/components/TodoList'

describe('TodoList Component', () => {
    const mockHandlers = {
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onEdit: vi.fn()
    }

    const mockTodos = [
        { id: 1, text: 'First todo', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Second todo', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Third todo', completed: false, createdAt: new Date().toISOString() }
    ]

    it('renders list of todos', () => {
        render(<TodoList todos={mockTodos} {...mockHandlers} />)

        expect(screen.getByText('First todo')).toBeInTheDocument()
        expect(screen.getByText('Second todo')).toBeInTheDocument()
        expect(screen.getByText('Third todo')).toBeInTheDocument()
    })

    it('renders correct number of todo items', () => {
        const { container } = render(<TodoList todos={mockTodos} {...mockHandlers} />)

        const todoItems = container.querySelectorAll('.todo-item')
        expect(todoItems).toHaveLength(3)
    })

    it('returns null when todos array is empty', () => {
        const { container } = render(<TodoList todos={[]} {...mockHandlers} />)

        expect(container.firstChild).toBeNull()
    })

    it('passes correct props to each TodoItem', () => {
        render(<TodoList todos={mockTodos} {...mockHandlers} />)

        // Verify all todos are rendered with correct text
        mockTodos.forEach(todo => {
            expect(screen.getByText(todo.text)).toBeInTheDocument()
        })
    })

    it('renders single todo correctly', () => {
        const singleTodo = [mockTodos[0]]
        render(<TodoList todos={singleTodo} {...mockHandlers} />)

        expect(screen.getByText('First todo')).toBeInTheDocument()
        const { container } = render(<TodoList todos={singleTodo} {...mockHandlers} />)
        expect(container.querySelectorAll('.todo-item')).toHaveLength(1)
    })

    it('renders todos with different completion states', () => {
        const { container } = render(<TodoList todos={mockTodos} {...mockHandlers} />)

        const completedItems = container.querySelectorAll('.todo-item.completed')
        const activeItems = container.querySelectorAll('.todo-item:not(.completed)')

        expect(completedItems.length).toBeGreaterThan(0)
        expect(activeItems.length).toBeGreaterThan(0)
    })

    it('maintains correct order of todos', () => {
        render(<TodoList todos={mockTodos} {...mockHandlers} />)

        const todoTexts = screen.getAllByText(/todo/).map(el => el.textContent)
        expect(todoTexts[0]).toBe('First todo')
        expect(todoTexts[1]).toBe('Second todo')
        expect(todoTexts[2]).toBe('Third todo')
    })

    it('renders with many todos', () => {
        const manyTodos = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            text: `Todo ${i + 1}`,
            completed: i % 2 === 0,
            createdAt: new Date().toISOString()
        }))

        const { container } = render(<TodoList todos={manyTodos} {...mockHandlers} />)

        expect(container.querySelectorAll('.todo-item')).toHaveLength(20)
    })
})
