"use strict";
const STORAGE_KEY = "todo-list-items";
const THEME_STORAGE_KEY = "todo-theme";
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const itemsLeft = document.querySelector("#items-left");
const clearCompletedButton = document.querySelector("#clear-completed");
const toggleCompletedVisibilityButton = document.querySelector("#toggle-completed-visibility");
const themeToggleButton = document.querySelector("#theme-toggle");
let todos = loadTodos();
let hideDone = false;
function getPreferredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(theme) {
    document.body.dataset.theme = theme;
    themeToggleButton.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}
function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}
function toggleTheme() {
    const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
}
function loadTodos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isValidTodoItem);
    }
    catch {
        return [];
    }
}
function isValidTodoItem(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value;
    return (typeof candidate.id === "number" &&
        typeof candidate.text === "string" &&
        typeof candidate.completed === "boolean");
}
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function updateItemsLeft() {
    const activeCount = todos.filter((todo) => !todo.completed).length;
    itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? "item" : "items"} left`;
}
function render() {
    list.innerHTML = "";
    const visibleTodos = hideDone ? todos.filter((todo) => !todo.completed) : todos;
    visibleTodos.forEach((todo) => {
        const item = document.createElement("li");
        item.className = `todo-item${todo.completed ? " completed" : ""}`;
        item.dataset.id = String(todo.id);
        const main = document.createElement("div");
        main.className = "todo-main";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.setAttribute("aria-label", `Mark "${todo.text}" as completed`);
        checkbox.addEventListener("change", () => toggleTodo(todo.id));
        const text = document.createElement("span");
        text.className = "todo-text";
        text.textContent = todo.text;
        const actions = document.createElement("div");
        actions.className = "todo-actions";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);
        deleteButton.addEventListener("click", () => deleteTodo(todo.id));
        main.append(checkbox, text);
        actions.append(deleteButton);
        item.append(main, actions);
        list.append(item);
    });
    updateItemsLeft();
}
function addTodo(text) {
    const newTodo = {
        id: Date.now(),
        text,
        completed: false,
    };
    todos.unshift(newTodo);
    saveTodos();
    render();
}
function toggleTodo(id) {
    todos = todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveTodos();
    render();
}
function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    render();
}
function toggleCompletedVisibility() {
    hideDone = !hideDone;
    toggleCompletedVisibilityButton.textContent = hideDone ? "Show done" : "Hide done";
    render();
}
function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    render();
}
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
        return;
    }
    addTodo(text);
    form.reset();
    input.focus();
});
const importCsvInput = document.querySelector("#import-csv");
function importCsv(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const lines = reader.result.trim().split("\n");
        const imported = [];
        for (const line of lines) {
            const commaIndex = line.lastIndexOf(",");
            if (commaIndex === -1)
                continue;
            const text = line.slice(0, commaIndex).trim();
            const completed = line.slice(commaIndex + 1).trim().toLowerCase() === "true";
            if (!text)
                continue;
            imported.push({ id: Date.now() + imported.length, text, completed });
        }
        if (imported.length === 0)
            return;
        todos = imported;
        saveTodos();
        render();
    });
    reader.readAsText(file);
}
importCsvInput.addEventListener("change", () => {
    const file = importCsvInput.files?.[0];
    if (file) {
        importCsv(file);
        importCsvInput.value = "";
    }
});
clearCompletedButton.addEventListener("click", clearCompleted);
toggleCompletedVisibilityButton.addEventListener("click", toggleCompletedVisibility);
themeToggleButton.addEventListener("click", toggleTheme);
applyTheme(getPreferredTheme());
render();
