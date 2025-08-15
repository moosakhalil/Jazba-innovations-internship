
const STORAGE_KEY = "todos_v1"

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms))

export const TodoService = {
  load: async () => {
    await delay()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const todos = raw ? JSON.parse(raw) : []
      return Array.isArray(todos) ? todos : []
    } catch (_) {
      return []
    }
  },

  save: async (todos) => {
    await delay()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    return true
  },

  create: async (title, dueAt = null) => {
    const todos = await TodoService.load()
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    const newTodo = { id, title, completed: false, createdAt: Date.now(), dueAt }
    const updated = [newTodo, ...todos]
    await TodoService.save(updated)
    return newTodo
  },

  toggle: async (id) => {
    const todos = await TodoService.load()
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    await TodoService.save(updated)
    return updated.find(({ id: tid }) => tid === id)
  },

  setCompleted: async (id, completed = true) => {
    const todos = await TodoService.load()
    const updated = todos.map((t) => (t.id === id ? { ...t, completed } : t))
    await TodoService.save(updated)
    return updated.find(({ id: tid }) => tid === id)
  },

  updateTitle: async (id, title) => {
    const todos = await TodoService.load()
    const updated = todos.map((t) => (t.id === id ? { ...t, title } : t))
    await TodoService.save(updated)
    return updated.find(({ id: tid }) => tid === id)
  },

  remove: async (id) => {
    const todos = await TodoService.load()
    const updated = todos.filter(({ id: tid }) => tid !== id)
    await TodoService.save(updated)
    return true
  },

  clearCompleted: async () => {
    const todos = await TodoService.load()
    const updated = todos.filter(({ completed }) => !completed)
    await TodoService.save(updated)
    return updated
  },

  completeDue: async (now = Date.now()) => {
    const todos = await TodoService.load()
    let changed = false
    const updated = todos.map((t) => {
      const GRACE_MS = 10 * 60 * 1000 
      if (!t.completed && t.dueAt && (Number(t.dueAt) + GRACE_MS) <= now) {
        changed = true
        return { ...t, completed: true }
      }
      return t
    })
    if (changed) await TodoService.save(updated)
    return changed
  },

  stats: async () => {
    const todos = await TodoService.load()
    const { total, completed, remaining } = todos.reduce(
      (acc, { completed }) => {
        acc.total += 1
        if (completed) acc.completed += 1
        acc.remaining = acc.total - acc.completed
        return acc
      },
      { total: 0, completed: 0, remaining: 0 }
    )
    return { total, completed, remaining }
  },
}
