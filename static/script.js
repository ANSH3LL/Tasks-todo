let todoItems = [];

//remember theme selection
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

//check for and display pending modal notifications
try {
  var notif = document.getElementById("notification");
  var span = document.getElementsByClassName("close-notif")[0];
  span.onclick = function() {
    notif.style.display = "none";
  }
} catch(err) {
  //pass
}

//request and display saved tasks
function populate() {
  $.ajax({
    type: 'GET',
    url: '/gettasks',
    success: function(tasks) {
      const list = document.querySelector('.js-todo-list');
      for(var i = 0; i < tasks.length; i++) {
        list.insertAdjacentHTML('beforeend', `
          <li class="todo-item" data-key="${tasks[i].id}">
            <input id="${tasks[i].id}" type="checkbox"/>
            <label for="${tasks[i].id}" class="tick js-tick"></label>
            <span style="width: 70%;">${tasks[i].text}</span>
            <button title="Edit" class="edit-todo js-edit-todo">
            <svg><use href="#edit-icon"></use></svg>
            </button>
            <button title="Delete" class="delete-todo js-delete-todo">
            <svg><use href="#delete-icon"></use></svg>
            </button>
          </li>
        `);
        if(tasks[i].checked) {
          document.querySelector(`[data-key='${tasks[i].id}']`).classList.add('done');
        }
      }
      todoItems = tasks;
    }
  });
}

function submitItems(selection, payload) {
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({sel: selection, pload: payload}),
    url: '/submit',
    success: function () {
      console.log("Submission success");
  }});
}

function addTodo(text) {
  const todo = {
    text,
    checked: false,
    id: Date.now(),
  };

  todoItems.push(todo);

  const list = document.querySelector('.js-todo-list');
  list.insertAdjacentHTML('beforeend', `
    <li class="todo-item" data-key="${todo.id}">
      <input id="${todo.id}" type="checkbox"/>
      <label for="${todo.id}" class="tick js-tick"></label>
      <span style="width: 70%;">${todo.text}</span>
      <button title="Edit" class="edit-todo js-edit-todo">
        <svg><use href="#edit-icon"></use></svg>
      </button>
      <button title="Delete" class="delete-todo js-delete-todo">
        <svg><use href="#delete-icon"></use></svg>
      </button>
    </li>
  `);
  submitItems(1, todo);
}

function toggleDone(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  todoItems[index].checked = !todoItems[index].checked;

  const item = document.querySelector(`[data-key='${key}']`);
  if (todoItems[index].checked) {
    item.classList.add('done');
  } else {
    item.classList.remove('done');
  }
  submitItems(2, {id: todoItems[index].id, checked: todoItems[index].checked});
}

function editTodo(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  var oldtext = todoItems[index].text;

  var newtext = prompt('Edit contents', oldtext);
  if(newtext != null && newtext.trim() != "") {
    todoItems[index].text = newtext;

    const item = document.querySelector(`[data-key='${key}']`);
    todo = todoItems[index];

    item.innerHTML = `
    <input id="${todo.id}" type="checkbox"/>
    <label for="${todo.id}" class="tick js-tick"></label>
    <span style="width: 70%;">${todo.text}</span>
    <button title="Edit" class="edit-todo js-edit-todo">
        <svg><use href="#edit-icon"></use></svg>
    </button>
    <button title="Delete" class="delete-todo js-delete-todo">
        <svg><use href="#delete-icon"></use></svg>
    </button>
    `;
    submitItems(3, {id: todoItems[index].id, text: todoItems[index].text});
  }
}

function deleteTodo(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  myid = todoItems[index].id;

  todoItems = todoItems.filter(item => item.id !== Number(key));
  const item = document.querySelector(`[data-key='${key}']`);
  item.remove();

  const list = document.querySelector('.js-todo-list');
  if (todoItems.length === 0) list.innerHTML = '';
  submitItems(4, {id: myid});
}

const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.js-todo-input');

  const text = input.value.trim();
  if (text !== '') {
    addTodo(text);
    input.value = '';
    input.focus();
  }
});

const list = document.querySelector('.js-todo-list');
list.addEventListener('click', event => {
  if (event.target.classList.contains('js-tick')) {
    const itemKey = event.target.parentElement.dataset.key;
    toggleDone(itemKey);
  }
  if(event.target.classList.contains('js-edit-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    editTodo(itemKey);
  }
  if (event.target.classList.contains('js-delete-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    deleteTodo(itemKey);
  }
});

function toggleDarkMode() {
  var current = document.documentElement.getAttribute('data-theme');
  if(current != 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}

var modal1 = document.getElementById('sign-in');
var modal2 = document.getElementById('sign-up');
var username1 = document.getElementById("username1");
var username2 = document.getElementById("username2");
var password1 = document.getElementById("password1");
var password2 = document.getElementById("password2");

window.onclick = function(event) {
  if(event.target == modal1) {
    modal1.style.display = "none";
  }
  else if(event.target == modal2) {
    modal2.style.display = "none";
  }
  else {
    try { notif.style.display = "none"; }
    catch(err) { }
  }
}

function signIn(which) {
  if(which == 1) {
    modal1.style.display = 'block';
    username1.focus();
  }
  else {
    modal1.style.display = 'none';
    document.querySelector('.js-todo-input').focus();
  }
}

function signUp(which) {
  if(which == 1) {
    modal2.style.display = 'block';
    username2.focus();
  }
  else {
    modal2.style.display = 'none';
    document.querySelector('.js-todo-input').focus();
  }
}

function checkUsername() {
  if(username2.value != "") {
    username2.setCustomValidity("Checking...");
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({uname: username2.value}),
      url: '/checkuname',
      success: function(response) {
        available = response.availability;
        if(!available) {
          username2.setCustomValidity("Username unavailable");
          username2.removeAttribute("title");
          username2.style.borderColor = "red";
        } else {
          username2.setCustomValidity('');
          username2.setAttribute("title", "Username available");
          username2.style.borderColor = "#4caf50";
        }
      }
    });
  }
}
username2.onchange = checkUsername;

function validatePassword() {
  if(password1.value != password2.value) {
    password2.setCustomValidity("Passwords Don't Match");
  } else {
    password2.setCustomValidity('');
  }
}
password1.onchange = validatePassword;
password2.onkeyup = validatePassword;