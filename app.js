// ---------- календарь ----------
var today = new Date();
var viewYear = today.getFullYear();
var viewMonth = today.getMonth();

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var calendarDays = document.getElementById('calendarDays');
var monthText = document.getElementById('monthText');

// номер недели в году
function getWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function showCalendar() {
    monthText.textContent = monthNames[viewMonth] + ' ' + viewYear;
    calendarDays.innerHTML = '';

    var first = new Date(viewYear, viewMonth, 1);
    var start = first.getDay() || 7; // понедельник = 1
    var cursor = new Date(viewYear, viewMonth, 1 - (start - 1));

    for (var week = 0; week < 6; week++) {
        var w = document.createElement('span');
        w.className = 'calendar-week';
        w.textContent = getWeek(cursor);
        calendarDays.appendChild(w);

        for (var i = 0; i < 7; i++) {
            var day = document.createElement('span');
            day.className = 'calendar-day';
            day.textContent = cursor.getDate();

            if (cursor.getMonth() !== viewMonth) day.classList.add('other');
            else if (i >= 5) day.classList.add('weekend');

            if (cursor.toDateString() === today.toDateString()) day.classList.add('today');

            calendarDays.appendChild(day);
            cursor.setDate(cursor.getDate() + 1);
        }
    }
}

document.getElementById('prevBtn').onclick = function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    showCalendar();
};

document.getElementById('nextBtn').onclick = function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    showCalendar();
};

// дата сверху
document.getElementById('dayName').textContent = dayNames[today.getDay()];
var dd = String(today.getDate()).padStart(2, '0');
document.getElementById('dateText').textContent = dd + ', ' + monthNames[today.getMonth()] + ' ' + today.getFullYear();

showCalendar();

// ---------- todo ----------
var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
var created = Number(localStorage.getItem('created')) || tasks.length;
var shown = 4;

var form = document.getElementById('taskForm');
var titleInput = document.getElementById('taskTitle');
var textInput = document.getElementById('taskText');
var taskList = document.getElementById('taskList');
var statusSelect = document.getElementById('statusSelect');
var sortSelect = document.getElementById('sortSelect');
var searchInput = document.getElementById('searchInput');
var loadBtn = document.getElementById('loadBtn');

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('created', created);
}

function showTasks() {
    var list = tasks.slice();

    if (statusSelect.value === 'done') list = list.filter(function (t) { return t.done; });
    if (statusSelect.value === 'pending') list = list.filter(function (t) { return !t.done; });

    var word = searchInput.value.toLowerCase();
    if (word) list = list.filter(function (t) { return t.title.toLowerCase().indexOf(word) !== -1; });

    if (sortSelect.value === 'new') list.reverse();

    taskList.innerHTML = '';

    if (list.length === 0) {
        taskList.innerHTML = '<p class="empty">No tasks yet. Add your first one above.</p>';
    }

    list.slice(0, shown).forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'task' + (t.done ? ' task-done' : '');
        card.innerHTML =
            '<div class="task-info">' +
            '<h3 class="task-title"></h3>' +
            '<p class="task-text"></p>' +
            '<p class="task-date">Start date : <b>' + t.date + '</b></p>' +
            '</div>' +
            '<div class="task-btns">' +
            '<button class="task-btn" data-act="done" title="Done"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg></button>' +
            '<button class="task-btn" data-act="edit" title="Edit"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/></svg></button>' +
            '<button class="task-btn" data-act="delete" title="Delete"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg></button>' +
            '</div>';
        // textContent чтобы текст не ломал html
        card.querySelector('.task-title').textContent = t.title;
        card.querySelector('.task-text').textContent = t.text;

        card.querySelector('[data-act="done"]').onclick = function () { t.done = !t.done; update(); };
        card.querySelector('[data-act="edit"]').onclick = function () {
            var newTitle = prompt('Title', t.title);
            if (newTitle === null || newTitle.trim() === '') return;
            var newText = prompt('Detail', t.text);
            t.title = newTitle.trim();
            if (newText !== null) t.text = newText.trim();
            update();
        };
        card.querySelector('[data-act="delete"]').onclick = function () {
            tasks = tasks.filter(function (x) { return x.id !== t.id; });
            update();
        };

        taskList.appendChild(card);
    });

    loadBtn.style.display = list.length > shown ? 'block' : 'none';

    // счётчики
    var doneNum = tasks.filter(function (t) { return t.done; }).length;
    document.getElementById('doneCount').textContent = String(doneNum).padStart(2, '0');
    document.getElementById('pendingCount').textContent = String(tasks.length - doneNum).padStart(2, '0');
    document.getElementById('createdCount').textContent = created.toLocaleString('en-US');
}

function update() {
    save();
    showTasks();
}

form.onsubmit = function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    if (title === '') {
        titleInput.focus();
        return;
    }
    var d = new Date();
    tasks.push({
        id: Date.now(),
        title: title,
        text: textInput.value.trim(),
        done: false,
        date: String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear()
    });
    created++;
    titleInput.value = '';
    textInput.value = '';
    update();
};

loadBtn.onclick = function () { shown += 4; showTasks(); };
statusSelect.onchange = function () { shown = 4; showTasks(); };
sortSelect.onchange = showTasks;
searchInput.oninput = function () { shown = 4; showTasks(); };

showTasks();