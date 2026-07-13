const API_BASE = '/api/tasks';

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const sourceLabel = document.getElementById('source');

async function fetchTasks() {
  const res = await fetch(API_BASE);
  const data = await res.json();
  sourceLabel.textContent = `Data source: ${data.source}`;
  renderTasks(data.tasks);
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <div>
        <div class="title">${task.title}</div>
        <div class="desc">${task.description || ''}</div>
      </div>
      <div class="actions">
        <button data-action="toggle" data-id="${task._id}">${task.completed ? 'Undo' : 'Done'}</button>
        <button data-action="delete" data-id="${task._id}">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  taskForm.reset();
  fetchTasks();
});

taskList.addEventListener('click', async (e) => {
  const { action, id } = e.target.dataset;
  if (!action) return;

  if (action === 'delete') {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  } else if (action === 'toggle') {
    const completed = e.target.textContent === 'Done';
    await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
  }
  fetchTasks();
});

fetchTasks();
