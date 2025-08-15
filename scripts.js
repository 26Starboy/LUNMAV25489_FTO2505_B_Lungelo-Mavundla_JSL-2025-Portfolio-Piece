// ========================
// Base API URL
// ========================
// Defines the base URL for the JSON server or backend API that stores tasks
const API_URL = "http://localhost:3000/tasks";

// ========================
// DOM Elements
// ========================
// Grabbing references to the HTML containers for each column of tasks
const todoContainer = document.getElementById("todo-tasks");
const doingContainer = document.getElementById("doing-tasks");
const doneContainer = document.getElementById("done-tasks");

// Grabbing references to the modals
const addTaskModal = document.getElementById("task-modal1"); // Add task modal
const editTaskModal = document.getElementById("task-modal"); // Edit task modal
const topModal = document.getElementById("top-modal"); // Top/settings modal

// Grabbing Add Task form inputs
const addTaskTitle = document.getElementById("add-task-title");
const addTaskDescription = document.getElementById("add-task-description");
const addTaskPriority = document.getElementById("add-task-priority");
const addTaskDueDate = document.getElementById("add-task-due-date");
const addTaskStatus = document.getElementById("add-task-status");

// Grabbing Edit Task form inputs
const editTaskTitle = document.getElementById("edit-task-title");
const editTaskDescription = document.getElementById("edit-task-description");
const editTaskPriority = document.getElementById("edit-task-priority");
const editTaskDueDate = document.getElementById("edit-task-due-date");
const editTaskStatus = document.getElementById("edit-task-status");

// Variables to keep track of current task being edited or dragged
let currentEditTaskId = null; 
let draggedTaskId = null;

// ========================
// Fetch Tasks from API
// ========================
// Fetches all tasks from the backend API
async function fetchTasksFromAPI() {
  try {
    const response = await fetch(API_URL); // Make a GET request
    const tasks = await response.json(); // Convert response to JSON
    renderTasks(tasks); // Render tasks to the DOM
  } catch (error) {
    console.error("Error fetching tasks:", error); // Log error if fetch fails
  }
}

// ========================
// Render Tasks
// ========================
// Takes an array of task objects and displays them in their respective columns
function renderTasks(tasks) {
  // Clear existing task elements in each column
  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  // Loop through each task and create a DOM element for it
  tasks.forEach(task => {
    const taskDiv = document.createElement("div"); // Create a div
    taskDiv.className = "task-div"; // Add CSS class
    taskDiv.innerText = task.title; // Display task title
    taskDiv.draggable = true; // Make the task draggable
    taskDiv.dataset.id = task.id; // Store task id in dataset for later use

    // Clicking a task opens the edit modal
    taskDiv.onclick = () => openEditTaskModal(task);

    // Add drag event listeners
    taskDiv.addEventListener("dragstart", dragStart);

    // Append the task div to the correct column based on status
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

  // Update the column headers with the count of tasks
  document.getElementById("toDoText").innerText = `TODO (${tasks.filter(t => t.status === "todo").length})`;
  document.getElementById("doingText").innerText = `DOING (${tasks.filter(t => t.status === "doing").length})`;
  document.getElementById("doneText").innerText = `DONE (${tasks.filter(t => t.status === "done").length})`;

  // Add drag & drop listeners to the columns
  [todoContainer, doingContainer, doneContainer].forEach(container => {
    container.addEventListener("dragover", dragOver); // Allow dropping
    container.addEventListener("drop", drop); // Handle drop
  });
}

// ========================
// Drag & Drop Handlers
// ========================

// When dragging starts, store the task's ID
function dragStart(e) {
  draggedTaskId = e.target.dataset.id;
}

// Allow dropping by preventing default
function dragOver(e) {
  e.preventDefault();
}

// Handle dropping a task into a new column
async function drop(e) {
  const newStatus = e.currentTarget.dataset.status; // Get the target column's status
  if (!draggedTaskId || !newStatus) return; // Safety check

  try {
    // Update task status in backend
    await fetch(`${API_URL}/${draggedTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    draggedTaskId = null; // Reset dragged task
    fetchTasksFromAPI(); // Re-render tasks
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}

// ========================
// Add Task
// ========================

// Open the Add Task modal
function openAddTaskModal() {
  addTaskModal.showModal();
}

// Add a new task to the backend
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
    closeModal(); // Close modal after adding
    clearAddTaskForm(); // Reset form fields
    fetchTasksFromAPI(); // Refresh task list
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// Reset Add Task form inputs
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

// Open Edit Task modal and populate with current task data
function openEditTaskModal(task) {
  currentEditTaskId = task.id;
  editTaskTitle.value = task.title;
  editTaskDescription.value = task.description;
  editTaskPriority.value = task.priority;
  editTaskDueDate.value = task.dueDate;
  editTaskStatus.value = task.status;

  editTaskModal.showModal();
}

// Update task in backend
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

// Delete a task from backend
async function deleteTask() {
  try {
    await fetch(`${API_URL}/${currentEditTaskId}`, { method: "DELETE" });
    closeModal();
    fetchTasksFromAPI();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// ========================
// Sidebar & Modals
// ========================

// Close all open modals
function closeModal() {
  editTaskModal.close();
  addTaskModal.close();
  topModal.close();
}

// Open the top/settings modal
function openTopModal() {
  topModal.showModal();
}

// Hide sidebar
function hideSidebar() {
  document.getElementById("side-bar-div").style.display = "none";
  document.getElementById("show-sidebar-btn").style.display = "block";
}

// Show sidebar
function showSidebar() {
  document.getElementById("side-bar-div").style.display = "flex";
  document.getElementById("show-sidebar-btn").style.display = "none";
}

// ========================
// Dark/Light Theme Toggle
// ========================

// Grab references to sidebar and mobile logos
const logo = document.getElementById("logo");
const logoMobile = document.getElementById("logo-mobile");

// Toggle dark theme and update logos
function toggleTheme() {
  document.body.classList.toggle("dark-theme"); // Toggle dark-theme class

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
// Fetch tasks when the page loads
fetchTasksFromAPI();
