
import "../css/styles.css"
import { TodoService } from "./todoService.js"

const { renderTodos, updateStats } = window


let todos = []
let currentFilter = "all" 


const computeStats = (list) =>
  list.reduce(
    (acc, { completed }) => {
      acc.total += 1
      if (completed) acc.completed += 1
      acc.remaining = acc.total - acc.completed
      return acc
    },
    { total: 0, completed: 0, remaining: 0 }
  )


const handlers = {
  onToggle: async (id) => {
    await TodoService.toggle(id)
    todos = await TodoService.load()
    render()
  },
  onRemove: async (id) => {
    await TodoService.remove(id)
    todos = await TodoService.load()
    render()
  },
  onEdit: async (id, title) => {
    await TodoService.updateTitle(id, title)
    todos = await TodoService.load()
    render()
  },
}


const render = () => {
  renderTodos(todos, handlers, currentFilter, Date.now())
  const stats = computeStats(todos)
  updateStats(stats)
}

const init = async () => {
  const input = document.getElementById("todoInput")
  const addBtn = document.getElementById("addBtn")
  const dueDate = document.getElementById("dueDate")
  const dueTime = document.getElementById("dueTime")
  const filterAll = document.getElementById("filterAll")
  const filterActive = document.getElementById("filterActive")
  const filterCompleted = document.getElementById("filterCompleted")
  const clearCompleted = document.getElementById("clearCompleted")

  const addTodo = async () => {
    const title = input.value.trim()
    if (!title) return
    let dueAt = null
    if (dueDate && dueDate.value) {
      const dateStr = dueDate.value
      const timeStr = (dueTime && dueTime.value ? dueTime.value : "00:00")
      const isoLike = `${dateStr}T${timeStr}`
      const d = new Date(isoLike)
      if (!Number.isNaN(d.getTime())) {
        dueAt = d.getTime()
      }
    }
    await TodoService.create(title, dueAt)
    input.value = ""
    if (dueDate) dueDate.value = ""
    if (dueTime) dueTime.value = ""
    todos = await TodoService.load()
    render()
  }

  addBtn.addEventListener("click", addTodo)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo()
  })

  filterAll.addEventListener("click", () => {
    currentFilter = "all"
    render()
  })
  filterActive.addEventListener("click", () => {
    currentFilter = "active"
    render()
  })
  filterCompleted.addEventListener("click", () => {
    currentFilter = "completed"
    render()
  })

  clearCompleted.addEventListener("click", async () => {
    await TodoService.clearCompleted()
    todos = await TodoService.load()
    render()
  })

  todos = await TodoService.load()
  const changed = await TodoService.completeDue(Date.now())
  if (changed) todos = await TodoService.load()
  render()

  setInterval(async () => {
    const changed = await TodoService.completeDue(Date.now())
    if (changed) {
      todos = await TodoService.load()
    }
    render()
  }, 1000)
}

document.addEventListener("DOMContentLoaded", init)
