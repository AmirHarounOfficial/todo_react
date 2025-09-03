import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, LogOut, Trash2, Pen } from 'lucide-react'
import { tasksAPI } from '../api/tasks'
import useAuthStore from '../store/authStore'
import TaskModal from './TaskModal'

// frontend droppable columns
const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' }
]

// map backend column values -> droppable IDs
const columnMap = {
  'Backlog': 'backlog',
  'In Progress': 'in_progress',
  'Review': 'review',
  'Done': 'done',
}

// reverse map (droppableId -> backend label)
const reverseColumnMap = Object.fromEntries(
  Object.entries(columnMap).map(([k, v]) => [v, k])
)

const normalizeColumn = (col) => columnMap[col] || col

const KanbanBoard = () => {
  const { token, user, logout } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const queryClient = useQueryClient()

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', searchTerm],
    queryFn: () => tasksAPI.getTasks(token, { search: searchTerm, per_page: 100 }),
    enabled: !!token
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => tasksAPI.updateTask(token, taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => tasksAPI.deleteTask(token, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    }
  })

  const tasks = tasksData?.tasks || []

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => normalizeColumn(task.column) === columnId)
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const { draggableId, source, destination } = result
    const taskId = parseInt(draggableId)
    const newColumnId = destination.droppableId
    const newColumnLabel = reverseColumnMap[newColumnId] || newColumnId

    // 🔹 Optimistic update
    queryClient.setQueryData(['tasks', searchTerm], (old) => {
      if (!old) return old
      return {
        ...old,
        tasks: old.tasks.map((t) =>
          t.id === taskId ? { ...t, column: newColumnLabel } : t
        )
      }
    })

    // 🔹 Persist to backend
    updateTaskMutation.mutate({
      taskId,
      updates: { column: newColumnLabel }
    })
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">ToDo List - Kanban Board</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className='container mx-auto px-30 py-4'>

                              <Card
                                className={`mb-3 cursor-pointer hover:shadow-md transition-shadow`}
                              >
                                <CardContent className="p-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 border-b py-2">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button className="bg-[#1163e2] text-white" onClick={handleCreateTask}>
            Add Task
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map(({ id, label }) => (
              <div key={id} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{label}</h3>
                    <Badge variant="secondary">
                      {getTasksByColumn(id).length}
                    </Badge>
                  </div>
                </div>

                <Droppable droppableId={id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[500px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {getTasksByColumn(id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card
                                className={`mb-3 cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm">{task.title}</h4>

                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className='flex justify-end space-x-2'>

                                      <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-black-500 hover:text-red-700"
                                      onClick={() => handleEditTask(task)}

                                    >
                                      <Pen className="w-3 h-3" />
                                    </Button>

                                      <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-black-500 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteTask(task.id)
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
</CardContent>
</Card>
</div>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
    </div>
  )
}

export default KanbanBoard
