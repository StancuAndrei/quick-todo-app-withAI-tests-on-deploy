import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('App Component', () => {
    beforeEach(() => {
        // Clear localStorage mock before each test
        localStorage.clear()
        localStorage.getItem.mockReturnValue(null)
    })

    describe('Rendering', () => {
        it('renders app header', () => {
            render(<App />)
            expect(screen.getByText('📝 TODO App')).toBeInTheDocument()
        })

        it('renders subtitle', () => {
            render(<App />)
            expect(screen.getByText('Manage your tasks efficiently')).toBeInTheDocument()
        })

        it('renders todo form', () => {
            render(<App />)
            expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
        })

        it('renders statistics section', () => {
            render(<App />)
            expect(screen.getByText('Total')).toBeInTheDocument()
            expect(screen.getByText('Completed')).toBeInTheDocument()
            expect(screen.getByText('Active')).toBeInTheDocument()
        })

        it('shows empty state message when no todos', () => {
            render(<App />)
            expect(screen.getByText('🎉 No tasks yet! Add one above to get started.')).toBeInTheDocument()
        })
    })

    describe('CREATE - Adding Todos', () => {
        it('adds a new todo when form is submitted', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'New task')
            await user.click(screen.getByText('+ Add'))

            expect(screen.getByText('New task')).toBeInTheDocument()
        })

        it('adds multiple todos', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')

            await user.type(input, 'First task')
            await user.click(screen.getByText('+ Add'))

            await user.type(input, 'Second task')
            await user.click(screen.getByText('+ Add'))

            expect(screen.getByText('First task')).toBeInTheDocument()
            expect(screen.getByText('Second task')).toBeInTheDocument()
        })

        it('clears input after adding todo', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'New task')
            await user.click(screen.getByText('+ Add'))

            expect(input).toHaveValue('')
        })

        it('hides empty state after adding first todo', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'First task')
            await user.click(screen.getByText('+ Add'))

            expect(screen.queryByText('🎉 No tasks yet! Add one above to get started.')).not.toBeInTheDocument()
        })
    })

    describe('READ - Displaying Todos', () => {
        it('displays all added todos', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            const tasks = ['Task 1', 'Task 2', 'Task 3']

            for (const task of tasks) {
                await user.type(input, task)
                await user.click(screen.getByText('+ Add'))
            }

            tasks.forEach(task => {
                expect(screen.getByText(task)).toBeInTheDocument()
            })
        })
    })

    describe('UPDATE - Editing Todos', () => {
        it('enters edit mode when edit button is clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Original task')
            await user.click(screen.getByText('+ Add'))

            const editButton = screen.getByTitle('Edit task')
            await user.click(editButton)

            expect(screen.getByPlaceholderText('Update your task...')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Original task')).toBeInTheDocument()
        })

        it('updates todo text when edited', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Original task')
            await user.click(screen.getByText('+ Add'))

            const editButton = screen.getByTitle('Edit task')
            await user.click(editButton)

            const editInput = screen.getByPlaceholderText('Update your task...')
            await user.clear(editInput)
            await user.type(editInput, 'Updated task')
            await user.click(screen.getByText('✓ Update'))

            expect(screen.getByText('Updated task')).toBeInTheDocument()
            expect(screen.queryByText('Original task')).not.toBeInTheDocument()
        })

        it('cancels edit mode when cancel is clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Original task')
            await user.click(screen.getByText('+ Add'))

            const editButton = screen.getByTitle('Edit task')
            await user.click(editButton)

            await user.click(screen.getByText('✕ Cancel'))

            expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
            expect(screen.queryByText('✕ Cancel')).not.toBeInTheDocument()
        })

        it('toggles todo completion status', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Task to complete')
            await user.click(screen.getByText('+ Add'))

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)
            expect(checkbox).toBeChecked()

            await user.click(checkbox)
            expect(checkbox).not.toBeChecked()
        })
    })

    describe('DELETE - Removing Todos', () => {
        it('deletes todo when delete button is clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Task to delete')
            await user.click(screen.getByText('+ Add'))

            expect(screen.getByText('Task to delete')).toBeInTheDocument()

            const deleteButton = screen.getByTitle('Delete task')
            await user.click(deleteButton)

            expect(screen.queryByText('Task to delete')).not.toBeInTheDocument()
        })

        it('shows empty state after deleting all todos', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Only task')
            await user.click(screen.getByText('+ Add'))

            const deleteButton = screen.getByTitle('Delete task')
            await user.click(deleteButton)

            expect(screen.getByText('🎉 No tasks yet! Add one above to get started.')).toBeInTheDocument()
        })
    })

    describe('Statistics', () => {
        it('shows correct total count', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')

            await user.type(input, 'Task 1')
            await user.click(screen.getByText('+ Add'))
            await user.type(input, 'Task 2')
            await user.click(screen.getByText('+ Add'))

            const stats = screen.getAllByText(/\d+/)
            expect(stats[0]).toHaveTextContent('2') // Total
        })

        it('shows correct completed count', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Task 1')
            await user.click(screen.getByText('+ Add'))

            const checkbox = screen.getByRole('checkbox')
            await user.click(checkbox)

            const stats = screen.getAllByText(/\d+/)
            expect(stats[1]).toHaveTextContent('1') // Completed
        })

        it('shows correct active count', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')

            await user.type(input, 'Task 1')
            await user.click(screen.getByText('+ Add'))
            await user.type(input, 'Task 2')
            await user.click(screen.getByText('+ Add'))

            const checkboxes = screen.getAllByRole('checkbox')
            await user.click(checkboxes[0])

            const stats = screen.getAllByText(/\d+/)
            expect(stats[2]).toHaveTextContent('1') // Active (2 total - 1 completed)
        })
    })

    describe('LocalStorage Integration', () => {
        it('saves todos to localStorage when added', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Saved task')
            await user.click(screen.getByText('+ Add'))

            await waitFor(() => {
                expect(localStorage.setItem).toHaveBeenCalled()
            })
        })

        it('loads todos from localStorage on mount', () => {
            const savedTodos = JSON.stringify([
                { id: 1, text: 'Saved task', completed: false, createdAt: new Date().toISOString() }
            ])
            localStorage.getItem.mockReturnValue(savedTodos)

            render(<App />)

            expect(screen.getByText('Saved task')).toBeInTheDocument()
        })

        it('saves to localStorage when todo is deleted', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Task')
            await user.click(screen.getByText('+ Add'))

            localStorage.setItem.mockClear()

            const deleteButton = screen.getByTitle('Delete task')
            await user.click(deleteButton)

            await waitFor(() => {
                expect(localStorage.setItem).toHaveBeenCalled()
            })
        })

        it('saves to localStorage when todo is toggled', async () => {
            const user = userEvent.setup()
            render(<App />)

            const input = screen.getByPlaceholderText('Add a new task...')
            await user.type(input, 'Task')
            await user.click(screen.getByText('+ Add'))

            localStorage.setItem.mockClear()

            const checkbox = screen.getByRole('checkbox')
            await user.click(checkbox)

            await waitFor(() => {
                expect(localStorage.setItem).toHaveBeenCalled()
            })
        })
    })
})
