import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '../../src/components/TodoItem'

describe('TodoItem Component', () => {
    const mockTodo = {
        id: 1,
        text: 'Test todo item',
        completed: false,
        createdAt: new Date().toISOString()
    }

    const mockHandlers = {
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onEdit: vi.fn()
    }

    it('renders todo text correctly', () => {
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)
        expect(screen.getByText('Test todo item')).toBeInTheDocument()
    })

    it('shows completed state with correct CSS class', () => {
        const completedTodo = { ...mockTodo, completed: true }
        const { container } = render(<TodoItem todo={completedTodo} {...mockHandlers} />)

        const todoItem = container.querySelector('.todo-item')
        expect(todoItem).toHaveClass('completed')
    })

    it('does not have completed class when not completed', () => {
        const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        const todoItem = container.querySelector('.todo-item')
        expect(todoItem).not.toHaveClass('completed')
    })

    it('checkbox is checked when todo is completed', () => {
        const completedTodo = { ...mockTodo, completed: true }
        render(<TodoItem todo={completedTodo} {...mockHandlers} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
    })

    it('checkbox is unchecked when todo is not completed', () => {
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
    })

    it('calls onToggle when checkbox is clicked', async () => {
        const user = userEvent.setup()
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id)
        expect(mockHandlers.onToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit when edit button is clicked', async () => {
        const user = userEvent.setup()
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        const editButton = screen.getByTitle('Edit task')
        await user.click(editButton)

        expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTodo)
        expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup()
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        const deleteButton = screen.getByTitle('Delete task')
        await user.click(deleteButton)

        expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id)
        expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
    })

    it('renders all action buttons', () => {
        render(<TodoItem todo={mockTodo} {...mockHandlers} />)

        expect(screen.getByTitle('Edit task')).toBeInTheDocument()
        expect(screen.getByTitle('Delete task')).toBeInTheDocument()
    })

    it('displays long text correctly', () => {
        const longTextTodo = {
            ...mockTodo,
            text: 'This is a very long todo item text that should still be displayed correctly without breaking the layout'
        }
        render(<TodoItem todo={longTextTodo} {...mockHandlers} />)

        expect(screen.getByText(longTextTodo.text)).toBeInTheDocument()
    })
})
