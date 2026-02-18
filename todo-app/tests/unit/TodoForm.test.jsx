import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from '../../src/components/TodoForm'

describe('TodoForm Component', () => {
    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    beforeEach(() => {
        mockOnSubmit.mockClear()
        mockOnCancel.mockClear()
    })

    describe('Add Mode', () => {
        it('renders input field with correct placeholder', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            expect(input).toBeInTheDocument()
        })

        it('renders Add button', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            expect(screen.getByText('+ Add')).toBeInTheDocument()
        })

        it('does not render Cancel button in add mode', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            expect(screen.queryByText('✕ Cancel')).not.toBeInTheDocument()
        })

        it('updates input value when typing', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'New task')

            expect(input).toHaveValue('New task')
        })

        it('calls onSubmit with trimmed text when form is submitted', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, '  New task  ')
            await user.click(screen.getByText('+ Add'))

            expect(mockOnSubmit).toHaveBeenCalledWith('New task')
        })

        it('clears input after successful submit', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'New task')
            await user.click(screen.getByText('+ Add'))

            expect(input).toHaveValue('')
        })

        it('shows alert when trying to submit empty task', async () => {
            const user = userEvent.setup()
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })

            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            await user.click(screen.getByText('+ Add'))

            expect(alertSpy).toHaveBeenCalledWith('Please enter a task!')
            expect(mockOnSubmit).not.toHaveBeenCalled()

            alertSpy.mockRestore()
        })

        it('shows alert when trying to submit whitespace only', async () => {
            const user = userEvent.setup()
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })

            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, '   ')
            await user.click(screen.getByText('+ Add'))

            expect(alertSpy).toHaveBeenCalled()
            expect(mockOnSubmit).not.toHaveBeenCalled()

            alertSpy.mockRestore()
        })
    })

    describe('Edit Mode', () => {
        const editingTodo = {
            id: 1,
            text: 'Existing task',
            completed: false
        }

        it('renders with Update placeholder in edit mode', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            const input = screen.getByPlaceholderText('Update your task...')
            expect(input).toBeInTheDocument()
        })

        it('populates input with editing todo text', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            const input = screen.getByPlaceholderText('Update your task...')
            expect(input).toHaveValue('Existing task')
        })

        it('renders Update button in edit mode', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            expect(screen.getByText('✓ Update')).toBeInTheDocument()
        })

        it('renders Cancel button in edit mode', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            expect(screen.getByText('✕ Cancel')).toBeInTheDocument()
        })

        it('calls onSubmit with id and new text when updating', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            const input = screen.getByPlaceholderText('Update your task...')
            await user.clear(input)
            await user.type(input, 'Updated task')
            await user.click(screen.getByText('✓ Update'))

            expect(mockOnSubmit).toHaveBeenCalledWith(editingTodo.id, 'Updated task')
        })

        it('calls onCancel when Cancel button is clicked', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            await user.click(screen.getByText('✕ Cancel'))

            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it('clears input when Cancel is clicked', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />)

            const input = screen.getByPlaceholderText('Update your task...')
            await user.click(screen.getByText('✕ Cancel'))

            await waitFor(() => {
                expect(input).toHaveValue('')
            })
        })

        it('updates input when editingTodo changes', () => {
            const { rerender } = render(
                <TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={editingTodo} />
            )

            const newEditingTodo = { ...editingTodo, id: 2, text: 'Different task' }
            rerender(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={newEditingTodo} />)

            const input = screen.getByPlaceholderText('Update your task...')
            expect(input).toHaveValue('Different task')
        })
    })

    describe('Form Submission', () => {
        it('submits on Enter key press', async () => {
            const user = userEvent.setup()
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'New task{Enter}')

            expect(mockOnSubmit).toHaveBeenCalledWith('New task')
        })

        it('input has autofocus', () => {
            render(<TodoForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} editingTodo={null} />)

            const input = screen.getByPlaceholderText('Add a new task...')
            expect(input).toHaveAttribute('autofocus')
        })
    })
})
