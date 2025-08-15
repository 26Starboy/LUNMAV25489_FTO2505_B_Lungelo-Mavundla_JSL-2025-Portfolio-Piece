// ========================
// Base API URL
// ========================
const API_URL = "http://localhost:3000/tasks";

// ========================
// DOM Elements
// ========================
const todoContainer = document.getElementById("todo-tasks");
const doingContainer = document.getElementById("doing-tasks");
const doneContainer = document.getElementById("done-tasks");

const addTaskModal = document.getElementById("task-modal1");
const editTaskModal = document.getElementById("task-modal");
const topModal = document.getElementById("top-modal");

const addTaskTitle = document.getElementById("add-task-title");
const addTaskDescription = document.getElementById("add-task-description");
const addTaskPriority = document.getElementById("add-task-priority");
const addTaskDueDate = document.getElementById("add-task-due-date");
const addTaskStatus = document.getElementById("add-task-status");

const editTaskTitle = document.getElementById("edit-task-title");
const editTaskDescription = document.getElementById("edit-task-description");
const editTaskPriority = document.getElementById("edit-task-priority");
const editTaskDueDate = document.getElementById("edit-task-due-date");
const editTaskStatus = document.getElementById("edit-task-status");

let currentEditTaskId = null;
let draggedTaskId = null;

// ========================
// Fetch Tasks from API
// ========================
async function fetchTasksFromAPI() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// ========================
// Render Tasks
// ========================
function renderTasks(tasks) {
  // Clear current tasks
  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-div";
    taskDiv.innerText = task.title;
    taskDiv.draggable = true;
    taskDiv.dataset.id = task.id;

    // Click to open edit modal
    taskDiv.onclick = () => openEditTaskModal(task);

    // Drag events
    taskDiv.addEventListener("dragstart", dragStart);

    // Append to correct column
    switch (task.status) {
      case "todo":
        todoContainer.appendChild(taskDiv);
        break;
      case "doing":
        doingContainer.appendChild(taskDiv);
        break;
      case "done":
        doneContainer.appendChild(taskDiv);
        break;
    }
  });

  // Update column headers count
  document.getElementById("toDoText").innerText = `TODO (${tasks.filter(t => t.status === "todo").length})`;
  document.getElementById("doingText").innerText = `DOING (${tasks.filter(t => t.status === "doing").length})`;
  document.getElementById("doneText").innerText = `DONE (${tasks.filter(t => t.status === "done").length})`;

  // Setup drop zones
  [todoContainer, doingContainer, doneContainer].forEach(container => {
    container.addEventListener("dragover", dragOver);
    container.addEventListener("drop", drop);
  });
}

// ========================
// Drag & Drop Handlers
// ========================
function dragStart(e) {
  draggedTaskId = e.target.dataset.id;
}

function dragOver(e) {
  e.preventDefault(); // Needed to allow drop
}

async function drop(e) {
  const newStatus = e.currentTarget.dataset.status;
  if (!draggedTaskId || !newStatus) return;

  try {
    await fetch(`${API_URL}/${draggedTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    draggedTaskId = null;
    fetchTasksFromAPI();
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}

// ========================
// Add Task
// ========================
function openAddTaskModal() {
  addTaskModal.showModal();
}

async function addTask() {
  const newTask = {
    title: addTaskTitle.value,
    description: addTaskDescription.value,
    priority: addTaskPriority.value,
    dueDate: addTaskDueDate.value,
    status: addTaskStatus.value
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });
    closeModal();
    clearAddTaskForm();
    fetchTasksFromAPI();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

function clearAddTaskForm() {
  addTaskTitle.value = "";
  addTaskDescription.value = "";
  addTaskPriority.value = "medium";
  addTaskDueDate.value = "";
  addTaskStatus.value = "todo";
}

// ========================
// Edit Task
// ========================
function openEditTaskModal(task) {
  currentEditTaskId = task.id;
  editTaskTitle.value = task.title;
  editTaskDescription.value = task.description;
  editTaskPriority.value = task.priority;
  editTaskDueDate.value = task.dueDate;
  editTaskStatus.value = task.status;

  editTaskModal.showModal();
}

async function updateTask() {
  const updatedTask = {
    title: editTaskTitle.value,
    description: editTaskDescription.value,
    priority: editTaskPriority.value,
    dueDate: editTaskDueDate.value,
    status: editTaskStatus.value
  };

  try {
    await fetch(`${API_URL}/${currentEditTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask)
    });
    closeModal();
    fetchTasksFromAPI();
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function deleteTask() {
  try {
    await fetch(`${API_URL}/${currentEditTaskId}`, {
      method: "DELETE"
    });
    closeModal();
    fetchTasksFromAPI();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// ========================
// Sidebar & Modals
// ========================
function closeModal() {
  editTaskModal.close();
  addTaskModal.close();
  topModal.close();
}

function openTopModal() {
  topModal.showModal();
}

function hideSidebar() {
  document.getElementById("side-bar-div").style.display = "none";
  document.getElementById("show-sidebar-btn").style.display = "block";
}

function showSidebar() {
  document.getElementById("side-bar-div").style.display = "flex";
  document.getElementById("show-sidebar-btn").style.display = "none";
}

// ========================
// Dark/Light Theme Toggle
// ========================
const logo = document.getElementById("logo");
const logoMobile = document.getElementById("logo-mobile");

function toggleTheme() {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    // Switch to dark logo
    logo.src = "assets/logo-dark.svg";
    if (logoMobile) logoMobile.src = "assets/logo-dark.svg";
  } else {
    // Switch back to light logo
    logo.src = "assets/logo-light.svg";
    if (logoMobile) logoMobile.src = "assets/logo-light.svg";
  }
}

// ========================
// Initialize
// ========================
fetchTasksFromAPI();
