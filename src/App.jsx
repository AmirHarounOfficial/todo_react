import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuthStore from './store/authStore'
import LoginForm from './components/LoginForm'
import KanbanBoard from './components/KanbanBoard'
import './App.css'

const queryClient = new QueryClient()

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {isAuthenticated ? <KanbanBoard /> : <LoginForm />}
      </div>
    </QueryClientProvider>
  )
}

export default App
