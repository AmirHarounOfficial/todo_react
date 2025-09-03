import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { tasksAPI } from '../api/tasks'
import useAuthStore from '../store/authStore'

const COLUMNS = ['Backlog', 'In Progress', 'Review', 'Done']

const TaskModal = ({ isOpen, onClose, task }) => {
  const { token } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [column, setColumn] = useState('Backlog')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setColumn(task.column)
    } else {
      setTitle('')
      setDescription('')
      setColumn('Backlog')
    }
  }, [task])

  const createTaskMutation = useMutation({
    mutationFn: (newTask) => tasksAPI.createTask(token, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      onClose()
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => tasksAPI.updateTask(token, taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      onClose()
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const taskData = { title, description, column }
    
    if (task) {
      updateTaskMutation.mutate({
        taskId: task.id,
        updates: taskData
      })
    } else {
      createTaskMutation.mutate(taskData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Column</label>
            <Select value={column} onValueChange={setColumn}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TaskModal

