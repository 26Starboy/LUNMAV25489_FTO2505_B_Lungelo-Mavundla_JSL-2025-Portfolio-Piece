// ========================
// Kanban Board with Fixed Titles + Status Dots + Placeholders
// ========================

// ========================
// Task Data
// ========================
let tasks = [
  { id: 1, title: "Launch Epic Career 🚀", description: "Create a killer resume and LinkedIn profile", status: "todo" },
  { id: 2, title: "Master JavaScript 💛", description: "Complete advanced JavaScript course", status: "doing" },
  { id: 3, title: "Build Portfolio Website 🏗️", description: "Design and develop personal portfolio", status: "doing" },
  { id: 4, title: "Learn React ⚛️", description: "Complete React fundamentals course", status: "todo" },
  { id: 5, title: "Network with Professionals 🤝", description: "Attend 3 tech meetups this month", status: "todo" },
  { id: 6, title: "Complete Project X 🎯", description: "Finalize and deploy the full-stack project", status: "done" },
  { id: 7, title: "Update CV 📄", description: "Add recent projects and skills", status: "done" },
  { id: 8, title: "Prepare for Interviews 💼", description: "Practice 50 coding challenges", status: "todo" }
];

// ========================
// DOM Elements
// ========================
const todoContainer = document.getElementById("todo-tasks");
const doingContainer = document.getElementById("doing-tasks");
const doneContainer = document.getElementById("done-tasks");
const addTaskModalEl = document.getElementById("task-modal1");
const editTaskModalEl = document.getElementById("task-modal");
let currentTask = null;

// ========================
// Initialize Board
// ========================
function initializeBoard() {
  const savedTasks = localStorage.getItem("kanban-tasks");
  if (savedTasks) tasks = JSON.parse(savedTasks);

  renderTasks();
  setupDragAndDrop();

  const savedTheme = localStorage.getItem("kanban-theme");
  if (savedTheme === "dark") toggleTheme();
}

// ========================
// Render Tasks with Status Dots
// ========================
function renderTasks() {
  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-div";
    taskDiv.setAttribute("data-id", task.id);
    taskDiv.draggable = true;

    // Determine status dot color
    let statusColor = "";
    if (task.status === "todo") statusColor = "#49c4e5";    // Blue
    else if (task.status === "doing") statusColor = "#8471f2"; // Purple
    else if (task.status === "done") statusColor = "#219c90";  // Green

    taskDiv.innerHTML = `
      <span>${task.title}</span>
      <span style="margin-left:auto; color:${statusColor}; font-size:15px;">●</span>
    `;

    // Click to edit
    taskDiv.addEventListener("click", () => setUpdateTaskValues(task.id));

    // Drag start
    taskDiv.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", task.id));

    // Append to correct column
    if (task.status === "todo") todoContainer.appendChild(taskDiv);
    else if (task.status === "doing") doingContainer.appendChild(taskDiv);
    else if (task.status === "done") doneContainer.appendChild(taskDiv);
  });

  updateTaskCounts();
  localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
}

// ========================
// Drag & Drop
// ========================
let draggedTask = null;

function setupDragAndDrop() {
  const columns = document.querySelectorAll(".tasks-container");

  columns.forEach(col => {
    col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drag-over"); });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain");
      const task = tasks.find(t => t.id == taskId);
      const newStatus = col.id.replace("-tasks", "");
      if (task && task.status !== newStatus) { task.status = newStatus; renderTasks(); }
    });
  });
}

// ========================
// Update Task Counts
// ========================
function updateTaskCounts() {
  document.getElementById("toDoText").textContent = `TODO (${tasks.filter(t => t.status==="todo").length})`;
  document.getElementById("doingText").textContent = `DOING (${tasks.filter(t => t.status==="doing").length})`;
  document.getElementById("doneText").textContent = `DONE (${tasks.filter(t => t.status==="done").length})`;
}

// ========================
// Modals
// ========================
function openAddTaskModal() {
  document.getElementById("add-task-title").value = "";
  document.getElementById("add-task-title").placeholder = "Enter task title";
  document.getElementById("add-task-description").value = "";
  document.getElementById("add-task-description").placeholder = "Enter task description";
  document.getElementById("add-task-status").value = "todo";
  addTaskModalEl.showModal();
}

function closeModal() {
  addTaskModalEl.close();
  editTaskModalEl.close();
}

function setUpdateTaskValues(taskId) {
  currentTask = tasks.find(t => t.id === Number(taskId));
  if (!currentTask) return;

  document.getElementById("edit-task-title").value = currentTask.title;
  document.getElementById("edit-task-title").placeholder = "Edit task title";
  document.getElementById("edit-task-description").value = currentTask.description || "";
  document.getElementById("edit-task-description").placeholder = "Edit task description";
  document.getElementById("edit-task-status").value = currentTask.status;

  editTaskModalEl.showModal();
}

// ========================
// Task Operations
// ========================
function addTask() {
  const title = document.getElementById("add-task-title").value;
  if(!title){ alert("Please enter a task title"); return; }

  const newTask = {
    id: tasks.length>0 ? Math.max(...tasks.map(t=>t.id))+1 : 1,
    title,
    description: document.getElementById("add-task-description").value,
    status: document.getElementById("add-task-status").value
  };

  tasks.push(newTask);
  renderTasks();
  closeModal();
}

function updateTask() {
  if(!currentTask) return;
  const newTitle = document.getElementById("edit-task-title").value;
  if(!newTitle){ alert("Task title cannot be empty"); return; }

  currentTask.title = newTitle;
  currentTask.description = document.getElementById("edit-task-description").value;
  currentTask.status = document.getElementById("edit-task-status").value;

  renderTasks();
  closeModal();
}

function deleteTask() {
  if(!currentTask) return;
  if(confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter(t => t.id !== currentTask.id);
    renderTasks();
    closeModal();
  }
}

// ========================
// Sidebar Functions
// ========================
function hideSidebar() {
  document.getElementById("side-bar-div").style.display="none";
  document.getElementById("show-sidebar-btn").style.display="flex";
}

function showSidebar() {
  document.getElementById("side-bar-div").style.display="flex";
  document.getElementById("show-sidebar-btn").style.display="none";
}

// ========================
// Theme Toggle
// ========================
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-theme");
  localStorage.setItem("kanban-theme", isDark ? "dark":"light");
}

// ========================
// Initialize on DOM Load
// ========================
document.addEventListener("DOMContentLoaded", initializeBoard);
