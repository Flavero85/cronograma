/* 05/11/2025 22:05 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GERENCIAMENTO DAS ABAS (Slide) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const contentSections = document.querySelectorAll('.content-section');
    const mainElement = document.getElementById('main-content');
    let currentTabIndex = 0; 

    document.getElementById('inicio').style.display = 'block';
    document.getElementById('inicio').style.transform = 'translateX(0)';
    document.getElementById('inicio').style.opacity = 1;

    function showTab(newTabId, newIndex) {
        if (newIndex === currentTabIndex || !tabButtons[newIndex]) return; 
        const oldTabId = tabButtons[currentTabIndex].dataset.tab;
        const oldSection = document.getElementById(oldTabId);
        const newSection = document.getElementById(newTabId);
        if (!newSection) return; 
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabButtons[newIndex].classList.add('active');
        newSection.style.display = 'block';
        if (newIndex > currentTabIndex) {
            newSection.classList.remove('slide-in-left');
            newSection.style.transform = 'translateX(100%)';
            if (oldSection) oldSection.classList.add('slide-out-left'); 
        } else {
            newSection.classList.add('slide-in-left');
            if (oldSection) oldSection.classList.remove('slide-out-left');
        }
        void newSection.offsetWidth;
        newSection.style.transform = 'translateX(0)';
        newSection.style.opacity = 1;
        newSection.classList.add('active');
        if (oldSection) {
            oldSection.classList.remove('active');
            oldSection.style.opacity = 0; 
            setTimeout(() => {
                oldSection.style.display = 'none';
                oldSection.classList.remove('slide-out-left', 'slide-in-left');
            }, 400); 
        }
        currentTabIndex = newIndex;
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => showTab(button.dataset.tab, index));
    });

    // --- 1.5. GERENCIAMENTO DE TAREFAS FIXAS ---
    const defaultFixedSchedule = [
        { id: 1, time: "07:00", task: "😴 Acordar" },
        { id: 2, time: "08:00", task: "☕ Café" },
        { id: 3, time: "08:30", task: "🏋️ Academia" },
        { id: 4, time: "10:25", task: "👟 Sair de casa" },
        { id: 5, time: "10:40", task: "💻 Início Trabalho" },
        { id: 6, time: "19:00", task: "🏁 Fim Trabalho" },
        { id: 7, time: "19:15", task: "🏠 Chegar em casa" },
    ];
    let tasks_fixas = JSON.parse(localStorage.getItem('tasks_fixas')) || defaultFixedSchedule;
    function saveTasksFixas() { localStorage.setItem('tasks_fixas', JSON.stringify(tasks_fixas)); }
    
    // --- 1.6. RENDERIZAR HORÁRIOS FIXOS NO INÍCIO ---
    const fixedScheduleList = document.getElementById('resumo-afazeres-fixos');
    function renderFixedScheduleSummary() {
        fixedScheduleList.innerHTML = ''; 
        tasks_fixas.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="modal-time">${item.time}</span> ${item.task}`;
            fixedScheduleList.appendChild(li);
        });
    }

    // --- (Função auxiliar para salvar e renderizar tudo) ---
    function saveAndRenderAll() {
        // Salva tudo
        saveTasksPessoal();
        saveTasksTrabalho();
        saveItemsFinanceiro();
        saveTasksEntretenimento();
        saveTasksFolga(); 
        saveTasksFixas();
        saveStats(); 
        saveRewardsShop(); 
        
        // Renderiza tudo
        renderTasksPessoal('lista-pessoal');
        renderTasksPessoal('resumo-tarefas-pessoal');
        renderTasksTrabalho('lista-trabalho');
        renderTasksTrabalho('resumo-tarefas-trabalho');
        renderItemsFinanceiro();
        renderTasksEntretenimento();
        renderTasksFolga(); 
        renderTasksFixasSettings(); 
        renderStats(); 
        renderFixedScheduleSummary(); 
        renderRewardsShop(); 
        updateCategoriesDatalist('pessoal');
        updateCategoriesDatalist('trabalho');

        checkCompletionStatus();
        updateCalendarMarkers(); 
    }

    // --- 2. GERENCIAMENTO TAREFAS PESSOAL (AFAZERES) ---
    const formPessoal = document.getElementById('form-pessoal');
    const inputPessoalText = document.getElementById('input-pessoal-text');
    const inputPessoalCategory = document.getElementById('input-pessoal-category'); // (NOVO)
    const inputPessoalHour = document.getElementById('input-pessoal-hour'); 
    const inputPessoalMinute = document.getElementById('input-pessoal-minute'); 
    let tasks_pessoal = JSON.parse(localStorage.getItem('tasks_pessoal')) || [];

    function saveTasksPessoal() { localStorage.setItem('tasks_pessoal', JSON.stringify(tasks_pessoal)); }
    
    // (ATUALIZADO) Renderiza por Categoria
    function renderTasksPessoal(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        const isResumo = (containerId === 'resumo-tarefas-pessoal');
        const tasksToRender = isResumo ? tasks_pessoal.filter(t => !t.completed) : tasks_pessoal;

        if (tasksToRender.length === 0) {
            if (isResumo) container.innerHTML = '<p class="no-tasks-message">🎉 Nenhuma tarefa pendente!</p>';
            else container.innerHTML = '<p class="no-tasks-message">(Sem afazeres ainda)</p>';
            return;
        }

        // 1. Agrupar tarefas por categoria
        const categories = tasksToRender.reduce((acc, task) => {
            const category = task.category || 'Geral';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(task);
            return acc;
        }, {});

        // 2. Renderizar cada categoria
        Object.keys(categories).sort().forEach(category => {
            const categoryWrapper = document.createElement('div');
            categoryWrapper.className = 'task-category';
            categoryWrapper.dataset.category = category;
            
            const header = document.createElement('h4');
            header.className = 'task-category-header';
            header.textContent = category;
            categoryWrapper.appendChild(header);
            
            const ul = document.createElement('ul');
            ul.className = 'task-list';
            
            categories[category].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')).forEach(task => {
                ul.appendChild(createTaskElement(task, 'pessoal', true));
            });
            
            categoryWrapper.appendChild(ul);
            
            // Adicionar listeners de drag-and-drop
            addDragDropListeners(categoryWrapper, category, 'pessoal');
            
            container.appendChild(categoryWrapper);
        });
    }

    formPessoal.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputPessoalText.value.trim();
        const category = inputPessoalCategory.value.trim() || 'Geral'; // (NOVO)
        const hour = inputPessoalHour.value;
        const minute = inputPessoalMinute.value;
        const time = (hour && minute) ? `${hour}:${minute}` : ''; 
        if (text) {
            tasks_pessoal.push({ id: Date.now(), text, time, category, completed: false }); // (ATUALIZADO)
            inputPessoalText.value = '';
            inputPessoalCategory.value = ''; // (NOVO)
            inputPessoalHour.value = ''; 
            inputPessoalMinute.value = ''; 
            saveAndRenderAll();
        }
    });

    // --- 3. GERENCIAMENTO TAREFAS TRABALHO ---
    const formTrabalho = document.getElementById('form-trabalho');
    const inputTrabalhoText = document.getElementById('input-trabalho-text');
    const inputTrabalhoCategory = document.getElementById('input-trabalho-category'); // (NOVO)
    const inputTrabalhoHour = document.getElementById('input-trabalho-hour'); 
    const inputTrabalhoMinute = document.getElementById('input-trabalho-minute'); 
    let tasks_trabalho = JSON.parse(localStorage.getItem('tasks_trabalho')) || [];

    function saveTasksTrabalho() { localStorage.setItem('tasks_trabalho', JSON.stringify(tasks_trabalho)); }
    
    // (ATUALIZADO) Renderiza por Categoria
    function renderTasksTrabalho(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        const isResumo = (containerId === 'resumo-tarefas-trabalho');
        const tasksToRender = isResumo ? tasks_trabalho.filter(t => !t.completed) : tasks_trabalho;

        if (tasksToRender.length === 0) {
            if (isResumo) container.innerHTML = '<p class="no-tasks-message">🎉 Nenhuma tarefa pendente!</p>';
            else container.innerHTML = '<p class="no-tasks-message">(Sem tarefas ainda)</p>';
            return;
        }

        const categories = tasksToRender.reduce((acc, task) => {
            const category = task.category || 'Geral';
            if (!acc[category]) acc[category] = [];
            acc[category].push(task);
            return acc;
        }, {});

        Object.keys(categories).sort().forEach(category => {
            const categoryWrapper = document.createElement('div');
            categoryWrapper.className = 'task-category';
            categoryWrapper.dataset.category = category;
            
            const header = document.createElement('h4');
            header.className = 'task-category-header';
            header.textContent = category;
            categoryWrapper.appendChild(header);
            
            const ul = document.createElement('ul');
            ul.className = 'task-list';
            
            categories[category].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')).forEach(task => {
                ul.appendChild(createTaskElement(task, 'trabalho', true));
            });
            
            categoryWrapper.appendChild(ul);
            
            // Adicionar listeners de drag-and-drop
            addDragDropListeners(categoryWrapper, category, 'trabalho');
            
            container.appendChild(categoryWrapper);
        });
    }

    formTrabalho.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputTrabalhoText.value.trim();
        const category = inputTrabalhoCategory.value.trim() || 'Geral'; // (NOVO)
        const hour = inputTrabalhoHour.value;
        const minute = inputTrabalhoMinute.value;
        const time = (hour && minute) ? `${hour}:${minute}` : ''; 
        if (text) {
            tasks_trabalho.push({ id: Date.now(), text, time, category, completed: false }); // (ATUALIZADO)
            inputTrabalhoText.value = '';
            inputTrabalhoCategory.value = ''; // (NOVO)
            inputTrabalhoHour.value = ''; 
            inputTrabalhoMinute.value = ''; 
            saveAndRenderAll();
        }
    });

    // (NOVO) Atualiza Datalists de Categoria
    function updateCategoriesDatalist(type) {
        const tasks = type === 'pessoal' ? tasks_pessoal : tasks_trabalho;
        const datalist = document.getElementById(`${type}-categories`);
        if (!datalist) return;
        
        const categories = [...new Set(tasks.map(t => t.category || 'Geral'))];
        datalist.innerHTML = '';
        categories.forEach(category => {
            datalist.innerHTML += `<option value="${category}"></option>`;
        });
    }

    // --- 4. GERENCIAMENTO FINANCEIRO ---
    const formFinanceiro = document.getElementById('form-financeiro');
    const inputFinanceiroDesc = document.getElementById('input-financeiro-desc');
    const inputFinanceiroValor = document.getElementById('input-financeiro-valor');
    const listFinanceiro = document.getElementById('lista-financeiro');
    const totalFinanceiro = document.getElementById('total-financeiro');
    let items_financeiro = JSON.parse(localStorage.getItem('items_financeiro')) || [];

    function saveItemsFinanceiro() { localStorage.setItem('items_financeiro', JSON.stringify(items_financeiro)); }
    function renderItemsFinanceiro() {
        listFinanceiro.innerHTML = '';
        let total = 0;
        items_financeiro.forEach(item => {
            const li = document.createElement('li');
            li.setAttribute('data-id', item.id);
            const valorFormatado = parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            li.innerHTML = `
                <div class="task-info">
                    <span class="task-text">${item.desc} (${valorFormatado})</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" aria-label="Editar item ${item.desc}">✏️</button>
                    <button class="delete-btn" aria-label="Excluir item ${item.desc}">❌</button>
                </div>
            `;
            li.querySelector('.delete-btn').addEventListener('click', () => {
                showConfirmModal("Confirmar Exclusão", `<p>Excluir lançamento: <strong>${item.desc}</strong>?</p>`, () => {
                    items_financeiro = items_financeiro.filter(i => i.id !== item.id);
                    saveAndRenderAll();
                });
            });
            li.querySelector('.edit-btn').addEventListener('click', () => editFinancialItem(item));
            listFinanceiro.appendChild(li);
            total += parseFloat(item.valor);
        });
        totalFinanceiro.textContent = `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    }
    function editFinancialItem(item) {
        inputFinanceiroDesc.value = item.desc;
        inputFinanceiroValor.value = item.valor;
        items_financeiro = items_financeiro.filter(i => i.id !== item.id);
        saveAndRenderAll();
        inputFinanceiroDesc.focus();
    }
    formFinanceiro.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = inputFinanceiroDesc.value.trim();
        const valor = inputFinanceiroValor.value;
        if (desc && valor) {
            items_financeiro.push({ id: Date.now(), desc, valor });
            inputFinanceiroDesc.value = '';
            inputFinanceiroValor.value = '';
            saveAndRenderAll();
        }
    });

    // --- 5. GERENCIAMENTO ENTRETENIMENTO ---
    const formEntretenimento = document.getElementById('form-entretenimento');
    const inputEntretenimentoText = document.getElementById('input-entretenimento-text');
    const inputEntretenimentoHour = document.getElementById('input-entretenimento-hour'); 
    const inputEntretenimentoMinute = document.getElementById('input-entretenimento-minute'); 
    const listEntretenimento = document.getElementById('lista-entretenimento');
    let tasks_entretenimento = JSON.parse(localStorage.getItem('tasks_entretenimento')) || [];

    function saveTasksEntretenimento() { localStorage.setItem('tasks_entretenimento', JSON.stringify(tasks_entretenimento)); }
    function renderTasksEntretenimento() {
        listEntretenimento.innerHTML = '';
        tasks_entretenimento.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
        tasks_entretenimento.forEach(task => {
            // (ATUALIZADO) usa 'entretenimento'
            listEntretenimento.appendChild(createTaskElement(task, 'entretenimento', true));
        });
    }
    formEntretenimento.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputEntretenimentoText.value.trim();
        const hour = inputEntretenimentoHour.value;
        const minute = inputEntretenimentoMinute.value;
        const time = (hour && minute) ? `${hour}:${minute}` : ''; 
        if (text) {
            tasks_entretenimento.push({ id: Date.now(), text, time, completed: false }); 
            inputEntretenimentoText.value = '';
            inputEntretenimentoHour.value = ''; 
            inputEntretenimentoMinute.value = ''; 
            saveAndRenderAll();
        }
    });

    // --- 6. FUNÇÕES GLOBAIS DE TAREFAS (COM BOTÃO CONCLUIR) ---
    function createTaskElement(task, type, isTask = true) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.setAttribute('draggable', true); // (NOVO) Draggable
        if (task.completed) li.classList.add('completed');
        
        // (NOVO) Listener de Drag
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            e.dataTransfer.setData('task-type', type);
            setTimeout(() => li.classList.add('dragging'), 0);
        });
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        
        if (task.time) { 
            const timeSpan = document.createElement('span');
            timeSpan.className = 'task-time';
            timeSpan.textContent = task.time;
            taskInfo.appendChild(timeSpan);
        }
        const textContainer = document.createElement('span');
        textContainer.className = 'task-text';
        textContainer.textContent = task.text;
        taskInfo.appendChild(textContainer);
        
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'task-actions';
        
        if(type !== 'fixa') { 
            const completeBtn = document.createElement('button');
            completeBtn.innerHTML = task.completed ? '↩️' : '✔️'; 
            completeBtn.className = task.completed ? 'btn-undo' : 'btn-complete';
            completeBtn.setAttribute('aria-label', task.completed ? 'Desfazer' : 'Concluir');
            completeBtn.addEventListener('click', () => toggleTask(type, task.id));
            actionsContainer.appendChild(completeBtn); 
        }
        
        if(type !== 'fixa') { 
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️'; 
            editBtn.setAttribute('aria-label', `Editar ${task.text}`);
            editBtn.addEventListener('click', () => editTask(li, task, type));
            actionsContainer.appendChild(editBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '❌'; 
        deleteBtn.setAttribute('aria-label', `Excluir ${task.text}`);
        deleteBtn.addEventListener('click', () => {
             showConfirmModal("Confirmar Exclusão", `<p>Excluir: <strong>${task.text}</strong>?</p>`, () => deleteTask(type, task.id));
        });
        
        actionsContainer.appendChild(deleteBtn);
        
        li.appendChild(taskInfo);
        li.appendChild(actionsContainer);
        
        return li;
    }
    
    function editTask(li, task, type) {
        if (li.querySelector('.edit-input')) return;
        const taskInfo = li.querySelector('.task-info');
        const actions = li.querySelector('.task-actions');
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = task.text; 
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '✔️'; 
        saveBtn.setAttribute('aria-label', 'Salvar edição');
        
        li.replaceChild(editInput, taskInfo); 
        actions.innerHTML = '';
        actions.appendChild(saveBtn);
        
        editInput.focus();
        
        const saveAction = () => {
            const newText = editInput.value.trim();
            let list;
            if (type === 'pessoal') list = tasks_pessoal;
            else if (type === 'trabalho') list = tasks_trabalho;
            else if (type === 'entretenimento') list = tasks_entretenimento;
            else if (type === 'folga') list = tasks_folga;
            
            const taskToUpdate = list.find(t => t.id === task.id);
            if (taskToUpdate) {
                taskToUpdate.text = newText || task.text; 
            }
            saveAndRenderAll(); 
        };

        saveBtn.addEventListener('click', saveAction);
        editInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveAction(); });
        editInput.addEventListener('blur', saveAction); 
    }

    function toggleTask(type, id) {
        let list;
        if (type === 'pessoal') list = tasks_pessoal;
        else if (type === 'trabalho') list = tasks_trabalho;
        else if (type === 'entretenimento') list = tasks_entretenimento;
        else if (type === 'folga') list = tasks_folga;
        
        if (list) {
            const task = list.find(t => t.id === id);
            if (task) {
                const oldLevelInfo = calculateLevel(userStats.points);
                const wasCompleted = task.completed;
                task.completed = !task.completed;
                const pointsPerTask = 10; 
                if (task.completed && !wasCompleted) {
                    userStats.points += pointsPerTask;
                    if (confettiEnabled) triggerConfetti();
                } else if (!task.completed && wasCompleted) {
                    userStats.points = Math.max(0, userStats.points - pointsPerTask);
                }
                const newLevelInfo = calculateLevel(userStats.points);
                if (newLevelInfo.level > oldLevelInfo.level) {
                    triggerLevelUp(newLevelInfo.level);
                }
            }
            saveAndRenderAll();
        }
    }
    
    function deleteTask(type, id) {
        if (type === 'pessoal') tasks_pessoal = tasks_pessoal.filter(t => t.id !== id);
        else if (type === 'trabalho') tasks_trabalho = tasks_trabalho.filter(t => t.id !== id);
        else if (type === 'entretenimento') tasks_entretenimento = tasks_entretenimento.filter(t => t.id !== id);
        else if (type === 'folga') tasks_folga = tasks_folga.filter(t => t.id !== id);
        else if (type === 'fixa') tasks_fixas = tasks_fixas.filter(t => t.id !== id); 
        saveAndRenderAll();
    }
    
    // --- 6.5 (NOVO) DRAG AND DROP (Recategorizar) ---
    function addDragDropListeners(categoryWrapper, category, type) {
        categoryWrapper.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            categoryWrapper.classList.add('drag-over');
        });
        categoryWrapper.addEventListener('dragleave', () => {
            categoryWrapper.classList.remove('drag-over');
        });
        categoryWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            categoryWrapper.classList.remove('drag-over');
            
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            const taskType = e.dataTransfer.getData('task-type');
            
            if (taskType !== type) return; // Não permite dropar entre Pessoal e Trabalho

            let list = (type === 'pessoal') ? tasks_pessoal : tasks_trabalho;
            const task = list.find(t => t.id === taskId);
            
            if (task && task.category !== category) {
                task.category = category;
                saveAndRenderAll();
            }
        });
    }

    // --- 7. GERENCIAMENTO DA AGENDA MENSAL (Interativa) ---
    let currentViewDate = new Date(); 
    const today = new Date(); 
    const monthYearDisplay = document.getElementById('month-year-display');
    const calendarDaysGrid = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    function getFormattedDate(date) { return date.toISOString().split('T')[0]; }
    function renderCalendar() {
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
        calendarDaysGrid.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDaysGrid.appendChild(document.createElement('div')).classList.add('calendar-day', 'empty-day');
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;
            const dayDate = new Date(year, month, day);
            dayElement.dataset.date = getFormattedDate(dayDate); 
            if (getFormattedDate(dayDate) === getFormattedDate(today)) {
                dayElement.classList.add('current-day');
            }
            dayElement.addEventListener('click', () => openDayModal(dayDate));
            calendarDaysGrid.appendChild(dayElement);
        }
        updateCalendarMarkers(); 
    }
    function updateCalendarMarkers() {
        document.querySelectorAll('.day-has-tasks').forEach(d => d.classList.remove('day-has-tasks'));
        if (tasks_pessoal.length > 0 || tasks_trabalho.length > 0 || tasks_folga.length > 0) {
            const todayElement = document.querySelector('.current-day');
            if (todayElement) todayElement.classList.add('day-has-tasks');
        }
    }
    prevMonthBtn.addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
        renderCalendar();
    });

    // --- 8. SISTEMA DE RECOMPENSA (Lógica Refinada) ---
    const userPointsDisplay = document.getElementById('user-points');
    const userStreakDisplay = document.getElementById('user-streak');
    const completeDayBtn = document.getElementById('complete-day-btn');
    let userStats = JSON.parse(localStorage.getItem('user_stats')) || { points: 0, last_completed: null, streak: 0 };

    const levelDisplay = document.getElementById('level-display');
    const xpBarFill = document.getElementById('xp-bar-fill');
    const xpText = document.getElementById('xp-text');

    function saveStats() { localStorage.setItem('user_stats', JSON.stringify(userStats)); }

    function calculateLevel(totalPoints) {
        let level = 1;
        let pointsNeededForNextLevel = 100; 
        let pointsInCurrentLevel = totalPoints;
        while (pointsInCurrentLevel >= pointsNeededForNextLevel) {
            pointsInCurrentLevel -= pointsNeededForNextLevel;
            pointsNeededForNextLevel = Math.floor(pointsNeededForNextLevel * 1.5); 
            level++;
        }
        return { level, currentLevelPoints: pointsInCurrentLevel, pointsForNextLevel: pointsNeededForNextLevel };
    }

    function getLevelIcon(level) {
        if (level < 5) return '🌱'; if (level < 10) return '🌳'; if (level < 15) return '🌟';
        if (level < 20) return '💎'; if (level < 25) return '🏆'; return '🚀';
    }

    function renderStats() {
        userPointsDisplay.textContent = userStats.points;
        userStreakDisplay.textContent = `${userStats.streak} 🔥`;
        
        const { level, currentLevelPoints, pointsForNextLevel } = calculateLevel(userStats.points);
        const icon = getLevelIcon(level);
        
        levelDisplay.innerHTML = `<span>${icon}</span> Nível ${level}`; 
        xpText.textContent = `${currentLevelPoints} / ${pointsForNextLevel} XP`;
        const xpPercentage = (currentLevelPoints / pointsForNextLevel) * 100;
        xpBarFill.style.width = `${xpPercentage}%`;

        document.getElementById('loja-pontos-display').textContent = userStats.points; 
    }

    function checkStreakOnLoad() {
        const todayStr = getFormattedDate(new Date());
        const yesterdayStr = getFormattedDate(new Date(Date.now() - 86400000));
        if (userStats.last_completed && userStats.last_completed !== todayStr && userStats.last_completed !== yesterdayStr) {
            userStats.streak = 0;
            saveStats();
        }
    }

    function checkCompletionStatus() {
        const todayString = getFormattedDate(new Date());
        if (userStats.last_completed === todayString) {
            completeDayBtn.textContent = 'Dia Salvo! 🎉';
            completeDayBtn.disabled = true;
            return;
        }
        const isDayOff = (JSON.parse(localStorage.getItem('dias_folga')) || []).includes(todayString);
        if (isDayOff) {
            completeDayBtn.textContent = 'Dia de Folga! 🏖️';
            completeDayBtn.disabled = true;
            return;
        }
        const totalTasks = tasks_pessoal.length + tasks_trabalho.length;
        if (totalTasks === 0) {
            completeDayBtn.textContent = 'Adicione tarefas para Salvar';
            completeDayBtn.disabled = true;
            return;
        }
        completeDayBtn.disabled = false; 
        const completedTasks = tasks_pessoal.filter(t => t.completed).length + tasks_trabalho.filter(t => t.completed).length;
        if (completedTasks === totalTasks) {
            completeDayBtn.textContent = 'Salvar Dia e Coletar Bônus! 🚀';
        } else {
            completeDayBtn.textContent = `Salvar Dia (${completedTasks}/${totalTasks} completas)`;
        }
    }

    completeDayBtn.addEventListener('click', () => {
        const todayStr = getFormattedDate(new Date());
        if (userStats.last_completed === todayStr || completeDayBtn.disabled) return;

        const allPessoalDone = tasks_pessoal.every(task => task.completed);
        const allTrabalhoDone = tasks_trabalho.every(task => task.completed);
        
        if (allPessoalDone && allTrabalhoDone) {
            const oldLevelInfo = calculateLevel(userStats.points); 
            
            const yesterdayStr = getFormattedDate(new Date(Date.now() - 86400000));
            let streakBonus = 0;
            if (userStats.last_completed === yesterdayStr) {
                userStats.streak++;
            } else {
                userStats.streak = 1; 
            }
            streakBonus = 50 + (userStats.streak * 10); 
            userStats.points += streakBonus; 
            userStats.last_completed = todayStr;
            
            const newLevelInfo = calculateLevel(userStats.points); 
            if (newLevelInfo.level > oldLevelInfo.level) {
                triggerLevelUp(newLevelInfo.level);
            }
            
            saveAndRenderAll(); 
            
            if (confettiEnabled) triggerConfetti();
            showInfoModal("Bônus de Sequência! 🥳", `<p style="text-align: center; font-size: 1.1rem;">Você completou todas as tarefas e ganhou <strong>+${streakBonus} pontos de bônus</strong>! <br><br>Sua sequência agora é de <strong>${userStats.streak} dias</strong>! 🔥</p>`);
        } else {
            showConfirmModal("Salvar Dia?", "<p>Você não completou todas as tarefas. Deseja 'Salvar o Dia' assim mesmo? Você <strong>não</strong> ganhará o bônus de sequência.</p>", () => {
                 userStats.last_completed = todayStr; 
                 userStats.streak = 0; 
                 saveAndRenderAll();
                 showInfoModal("Dia Salvo", "<p>O dia foi salvo, mas a sequência foi perdida. Complete tudo amanhã para começar uma nova!</p>");
            });
        }
    });

    // --- 9. GERENCIAMENTO DE MODAL (com Confirmação) ---
    const modalOverlay = document.getElementById('info-modal-overlay');
    const modalTitle = document.getElementById('info-modal-title');
    const modalBody = document.getElementById('info-modal-body');
    const modalCloseBtn = document.getElementById('info-modal-close-btn');
    const modalActions = document.getElementById('info-modal-actions');
    const modalCancelBtn = document.getElementById('info-modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('info-modal-confirm-btn');
    let onConfirmCallback = null; 

    function showInfoModal(title, htmlMessage) {
        modalTitle.textContent = title;
        modalBody.innerHTML = htmlMessage;
        modalCloseBtn.style.display = 'block'; 
        modalActions.style.display = 'none'; 
        modalOverlay.classList.add('active');
    }
    function showConfirmModal(title, htmlMessage, onConfirm) {
        modalTitle.textContent = title;
        modalBody.innerHTML = htmlMessage;
        modalCloseBtn.style.display = 'none'; 
        modalActions.style.display = 'flex'; 
        onConfirmCallback = onConfirm; 
        modalOverlay.classList.add('active');
    }
    function hideInfoModal() {
        modalOverlay.classList.remove('active');
        onConfirmCallback = null; 
    }
    modalCloseBtn.addEventListener('click', hideInfoModal);
    modalCancelBtn.addEventListener('click', hideInfoModal);
    modalConfirmBtn.addEventListener('click', () => {
        if (onConfirmCallback) onConfirmCallback(); 
        hideInfoModal(); 
    });
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideInfoModal();
    });

    function openDayModal(date) {
        const clickedDateString = getFormattedDate(date);
        modalTitle.textContent = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        let contentHTML = '<ul>';
        
        tasks_fixas.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')).forEach(item => {
            contentHTML += `<li><span class="modal-time">${item.time}</span> ${item.task}</li>`;
        });
        
        const diasDeFolga = JSON.parse(localStorage.getItem('dias_folga')) || [];
        if (diasDeFolga.includes(clickedDateString)) {
             contentHTML += '<li><strong>🏖️ Afazeres (Dia de Folga):</strong></li>';
             const folgaTasksDoDia = (clickedDateString === getFormattedDate(today)) ? tasks_folga : []; 
             if(folgaTasksDoDia.length > 0) {
                 folgaTasksDoDia.forEach(task => {
                    const statusClass = task.completed ? 'modal-task-completed' : 'modal-task-pending';
                    contentHTML += `<li class="${statusClass}">${task.time ? `<span class="modal-time">${task.time}</span>` : ''}${task.text}</li>`;
                 });
             } else {
                 contentHTML += '<li class="modal-no-tasks">(Sem afazeres de folga registrados para hoje)</li>';
             }
        } 
        else if (clickedDateString === getFormattedDate(today)) {
            // (ATUALIZADO) Renderiza por Categoria no Modal
            contentHTML += '<li><strong>📋 Afazeres Pessoal:</strong></li>';
            const categoriesPessoal = tasks_pessoal.reduce((acc, task) => { (acc[task.category || 'Geral'] = acc[task.category || 'Geral'] || []).push(task); return acc; }, {});
            if (tasks_pessoal.length > 0) {
                Object.keys(categoriesPessoal).sort().forEach(category => {
                    contentHTML += `<li><strong>${category}</strong></li>`;
                    categoriesPessoal[category].forEach(task => {
                        const statusClass = task.completed ? 'modal-task-completed' : 'modal-task-pending';
                        contentHTML += `<li class="${statusClass}">${task.time ? `<span class="modal-time">${task.time}</span>` : ''}${task.text}</li>`;
                    });
                });
            } else { contentHTML += '<li class="modal-no-tasks">(Sem afazeres hoje)</li>'; }

            contentHTML += '<li><strong>💼 Tarefas Trabalho:</strong></li>';
            const categoriesTrabalho = tasks_trabalho.reduce((acc, task) => { (acc[task.category || 'Geral'] = acc[task.category || 'Geral'] || []).push(task); return acc; }, {});
            if (tasks_trabalho.length > 0) {
                 Object.keys(categoriesTrabalho).sort().forEach(category => {
                    contentHTML += `<li><strong>${category}</strong></li>`;
                    categoriesTrabalho[category].forEach(task => {
                        const statusClass = task.completed ? 'modal-task-completed' : 'modal-task-pending';
                        contentHTML += `<li class="${statusClass}">${task.time ? `<span class="modal-time">${task.time}</span>` : ''}${task.text}</li>`;
                    });
                });
            } else { contentHTML += '<li class="modal-no-tasks">(Sem tarefas de trabalho hoje)</li>'; }

        } else {
             contentHTML += '<li class="modal-no-tasks">(Afazeres são gerenciados apenas para o dia de hoje.)</li>';
        }
        
        contentHTML += '</ul>';
        modalBody.innerHTML = contentHTML;
        modalCloseBtn.style.display = 'block';
        modalActions.style.display = 'none';
        modalOverlay.classList.add('active');
    }

    // --- 10. EFEITO DE CONFETE (com Toggle) ---
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiPieces = [];
    const confettiColors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'];
    const toggleConfetti = document.getElementById('toggle-confetti');
    let confettiEnabled = JSON.parse(localStorage.getItem('confettiEnabled')) ?? true; 
    toggleConfetti.checked = confettiEnabled;
    toggleConfetti.addEventListener('change', () => {
        confettiEnabled = toggleConfetti.checked;
        localStorage.setItem('confettiEnabled', JSON.stringify(confettiEnabled));
    });
    function resizeConfettiCanvas() { confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
    function createConfettiPiece() { /* ... (código inalterado) ... */ 
        const width = Math.random() * 10 + 5; const height = Math.random() * 20 + 10;
        return { x: Math.random() * confettiCanvas.width, y: -height, w: width, h: height, color: confettiColors[Math.floor(Math.random() * confettiColors.length)], angle: Math.random() * Math.PI * 2, speed: Math.random() * 3 + 2, rotateSpeed: (Math.random() - 0.5) * 0.1 };
    }
    function drawConfetti() { /* ... (código inalterado) ... */
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiPieces.forEach((piece, index) => {
            piece.y += piece.speed; piece.angle += piece.rotateSpeed; if (piece.y > confettiCanvas.height) confettiPieces.splice(index, 1);
            confettiCtx.save(); confettiCtx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2); confettiCtx.rotate(piece.angle); confettiCtx.fillStyle = piece.color; confettiCtx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h); confettiCtx.restore();
        });
        if (confettiPieces.length > 0) requestAnimationFrame(drawConfetti); else confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    function triggerConfetti() {
        if (!confettiEnabled) return; 
        resizeConfettiCanvas(); const pieceCount = 100; const wasEmpty = confettiPieces.length === 0;
        for (let i = 0; i < pieceCount; i++) confettiPieces.push(createConfettiPiece());
        if (wasEmpty) requestAnimationFrame(drawConfetti);
    }
    window.addEventListener('resize', resizeConfettiCanvas);


    // --- 11. NAVEGAÇÃO POR SWIPE ---
    let touchStartX = 0; let touchEndX = 0; const swipeThreshold = 50; 
    mainElement.addEventListener('touchstart', (e) => {
        const targetTag = e.target.tagName.toLowerCase();
        if (targetTag === 'input' || targetTag === 'button' || targetTag === 'select' || e.target.closest('.calendar-grid') || e.target.closest('.slider') || e.target.closest('[draggable="true"]')) { return; }
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    mainElement.addEventListener('touchend', (e) => {
        const targetTag = e.target.tagName.toLowerCase();
        if (targetTag === 'input' || targetTag === 'button' || targetTag === 'select' || e.target.closest('.calendar-grid') || e.target.closest('.slider') || e.target.closest('[draggable="true"]') || touchStartX === 0) { touchStartX = 0; return; }
        touchEndX = e.changedTouches[0].screenX; const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX < 0) { const nextIndex = Math.min(currentTabIndex + 1, tabButtons.length - 1); showTab(tabButtons[nextIndex].dataset.tab, nextIndex); } 
            else { const prevIndex = Math.max(currentTabIndex - 1, 0); showTab(tabButtons[prevIndex].dataset.tab, prevIndex); }
        }
        touchStartX = 0; 
    }, { passive: true });


    // --- 12. LÓGICA DA ABA CONFIGURAÇÕES (ATUALIZADO) ---
    
    // --- 12.1. TEMA ESCURO ---
    const toggleDarkMode = document.getElementById('toggle-dark-mode');
    const themeMeta = document.getElementById('theme-color-meta');
    let isDarkMode = JSON.parse(localStorage.getItem('darkMode')) ?? false;
    toggleDarkMode.checked = isDarkMode;
    function applyDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeMeta.setAttribute('content', '#1b5e20'); 
        } else {
            document.body.classList.remove('dark-mode');
            themeMeta.setAttribute('content', '#4CAF50'); 
        }
    }
    toggleDarkMode.addEventListener('change', () => {
        isDarkMode = toggleDarkMode.checked;
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        applyDarkMode(isDarkMode);
    });
    
    // --- 12.2. INSTALAR PWA ---
    let deferredPrompt;
    const installPwaBtn = document.getElementById('install-pwa-btn');
    const installPwaInfo = document.getElementById('install-pwa-info');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e;
        installPwaBtn.style.display = 'block'; installPwaInfo.style.display = 'none'; 
    });
    installPwaBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') { installPwaBtn.style.display = 'none'; installPwaInfo.style.display = 'block'; }
            deferredPrompt = null;
        }
    });
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installPwaBtn.style.display = 'none'; installPwaInfo.style.display = 'block';
    }
    
    // --- 12.3. EXPORTAR RESUMO .TXT ---
    const exportSummaryBtn = document.getElementById('export-summary-btn');
    function exportSummaryTxt() {
        let summary = `RESUMO DA ROTINA - ${new Date().toLocaleDateString('pt-BR')}\n`;
        summary += "========================================\n\n";
        
        summary += "⏰ HORÁRIOS FIXOS\n";
        summary += "------------------\n";
        tasks_fixas.forEach(item => {
            summary += `${item.time} - ${item.task}\n`;
        });
        summary += "\n";

        const todayTasks = [...tasks_pessoal, ...tasks_trabalho, ...tasks_folga].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
        summary += "📋 TAREFAS DO DIA\n";
        summary += "------------------\n";
        if (todayTasks.length > 0) {
            todayTasks.forEach(task => {
                const status = task.completed ? '[X]' : '[ ]';
                const time = task.time ? `(${task.time})` : '';
                const category = task.category ? `[${task.category}] ` : ''; // (NOVO)
                summary += `${status} ${time} ${category}${task.text}\n`;
            });
        } else {
            summary += "Nenhuma tarefa registrada para hoje.\n";
        }
        summary += "\n";
        
        summary += "💸 GASTOS (MÊS)\n";
        summary += "------------------\n";
        if (items_financeiro.length > 0) {
            let total = 0;
            items_financeiro.forEach(item => {
                const valor = parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                summary += `- ${item.desc}: ${valor}\n`;
                total += parseFloat(item.valor);
            });
            summary += `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
        } else {
            summary += "Nenhum gasto registrado.\n";
        }
        summary += "\n";
        
        summary += "🍿 ENTRETENIMENTO (LISTA)\n";
        summary += "-------------------------\n";
        if (tasks_entretenimento.length > 0) {
            tasks_entretenimento.forEach(task => {
                const status = task.completed ? '[X]' : '[ ]';
                const time = task.time ? `(${task.time})` : '';
                summary += `${status} ${time} ${task.text}\n`;
            });
        } else {
            summary += "Nenhum item na lista.\n";
        }

        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumo_rotina_${getFormattedDate(new Date())}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    exportSummaryBtn.addEventListener('click', exportSummaryTxt);

    // --- 12.4. FAZER BACKUP .JSON ---
    const exportBackupBtn = document.getElementById('export-backup-btn');
    function exportBackupJson() {
        const allData = {
            tasks_pessoal, tasks_trabalho, items_financeiro, tasks_entretenimento, tasks_folga,
            tasks_fixas, 
            rewards_shop, 
            userStats,
            dias_folga: JSON.parse(localStorage.getItem('dias_folga')) || [],
            darkMode: isDarkMode,
            confettiEnabled,
            savedLink: localStorage.getItem('saved_link') || ''
        };
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_rotina_${getFormattedDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    exportBackupBtn.addEventListener('click', exportBackupJson);
    
    // --- 12.5. IMPORTAR BACKUP .JSON ---
    const importBackupBtn = document.getElementById('import-backup-btn');
    const importFileInput = document.getElementById('import-file-input');
    importBackupBtn.addEventListener('click', () => {
        importFileInput.click(); 
    });
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/json') {
            showInfoModal("Erro", "<p>Arquivo inválido. Por favor, selecione um arquivo <strong>.json</strong> de backup.</p>");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!importedData.userStats || !importedData.tasks_pessoal) {
                    throw new Error("Arquivo não parece ser um backup válido.");
                }
                showConfirmModal("Importar Backup", "<p>Isso <strong>substituirá TODOS</strong> os seus dados atuais. Deseja continuar?</p>", () => {
                    localStorage.clear();
                    tasks_pessoal = importedData.tasks_pessoal || [];
                    tasks_trabalho = importedData.tasks_trabalho || [];
                    items_financeiro = importedData.items_financeiro || [];
                    tasks_entretenimento = importedData.tasks_entretenimento || [];
                    tasks_folga = importedData.tasks_folga || [];
                    tasks_fixas = importedData.tasks_fixas || defaultFixedSchedule; 
                    rewards_shop = importedData.rewards_shop || []; 
                    userStats = importedData.userStats || { points: 0, last_completed: null, streak: 0 };
                    localStorage.setItem('dias_folga', JSON.stringify(importedData.dias_folga || []));
                    localStorage.setItem('darkMode', JSON.stringify(importedData.darkMode || false));
                    localStorage.setItem('confettiEnabled', JSON.stringify(importedData.confettiEnabled ?? true));
                    localStorage.setItem('saved_link', importedData.savedLink || '');
                    saveAndRenderAll();
                    location.reload(); 
                });
            } catch (error) {
                showInfoModal("Erro de Importação", `<p>Não foi possível ler o arquivo. Erro: ${error.message}</p>`);
            }
        };
        reader.readAsText(file);
        importFileInput.value = null;
    });

    // --- 12.6. EXPORTAR GOOGLE CALENDAR ---
    const exportGcalBtn = document.getElementById('export-gcal-btn');
    function exportToGoogleCalendar() {
        onConfirmCallback = () => {
            const today = new Date(); const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
            const tasksToExport = [...tasks_pessoal, ...tasks_trabalho, ...tasks_folga];
            let tasksExported = 0;
            tasksToExport.forEach((task, index) => {
                if (task.completed) return; 
                let startHour, endHour;
                if(task.time) {
                    startHour = task.time.replace(':', '');
                    let [h, m] = task.time.split(':'); let d = new Date(); d.setHours(parseInt(h), parseInt(m), 0);
                    d.setHours(d.getHours() + 1);
                    endHour = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                } else {
                    let dStart = new Date(); dStart.setHours(dStart.getHours() + index); 
                    let dEnd = new Date(dStart.getTime() + 3600000); 
                    startHour = `${String(dStart.getHours()).padStart(2, '0')}${String(dStart.getMinutes()).padStart(2, '0')}`;
                    endHour = `${String(dEnd.getHours()).padStart(2, '0')}${String(dEnd.getMinutes()).padStart(2, '0')}`;
                }
                const dates = `${todayStr}T${startHour}00/${todayStr}T${endHour}00`;
                const text = encodeURIComponent(task.text);
                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}`;
                window.open(url, '_blank');
                tasksExported++;
            });
            if(tasksExported === 0) {
                showInfoModal("Exportar", "<p>Nenhuma tarefa pendente para exportar hoje.</p>");
            }
        };
        showConfirmModal("Exportar para Google Agenda?", `<p>Isso abrirá novas abas para cada tarefa pendente de <strong>Hoje</strong>. Deseja continuar?</p>`, onConfirmCallback);
    }
    exportGcalBtn.addEventListener('click', exportToGoogleCalendar);
    
    // --- 12.7. BOTÕES DE RESET ---
    const resetPointsBtn = document.getElementById('reset-points-btn');
    const resetTasksBtn = document.getElementById('reset-tasks-btn');
    const resetFinanceBtn = document.getElementById('reset-finance-btn');
    const resetLojaBtn = document.getElementById('reset-loja-btn'); 
    const resetAllBtn = document.getElementById('reset-all-btn');
    resetPointsBtn.addEventListener('click', () => {
        showConfirmModal("Resetar Pontos", "<p>Tem certeza que deseja zerar seus pontos e sua sequência?</p>", () => {
            userStats = { points: 0, last_completed: null, streak: 0 };
            saveAndRenderAll();
            showInfoModal("Sucesso", "<p>Seus pontos e sequência foram zerados.</p>");
        });
    });
    resetTasksBtn.addEventListener('click', () => {
         showConfirmModal("Limpar Tarefas", "<p>Apagar <strong>TODAS</strong> as tarefas (Pessoal, Trabalho, Entretenimento e Folga)?</p>", () => {
            tasks_pessoal = []; tasks_trabalho = []; tasks_entretenimento = []; tasks_folga = [];
            saveAndRenderAll();
            showInfoModal("Sucesso", "<p>Todas as tarefas foram limpas.</p>");
        });
    });
    resetFinanceBtn.addEventListener('click', () => {
         showConfirmModal("Limpar Finanças", "<p>Tem certeza que deseja apagar todos os lançamentos financeiros?</p>", () => {
            items_financeiro = [];
            saveAndRenderAll();
            showInfoModal("Sucesso", "<p>Seus lançamentos financeiros foram limpos.</p>");
        });
    });
    resetLojaBtn.addEventListener('click', () => {
         showConfirmModal("Limpar Loja", "<p>Tem certeza que deseja apagar todas as recompensas criadas na loja?</p>", () => {
            rewards_shop = [];
            saveAndRenderAll();
            showInfoModal("Sucesso", "<p>Sua loja de recompensas foi limpa.</p>");
        });
    });
    resetAllBtn.addEventListener('click', () => {
         showConfirmModal("⚠️ APAGAR TUDO ⚠️", "<p>Tem certeza? Isso apagará <strong>TODOS</strong> os dados do aplicativo e recarregará a página.</p>", () => {
            localStorage.clear();
            location.reload();
        });
    });
    
    // --- 12.8. LINK SALVO ---
    const formLink = document.getElementById('form-link');
    const inputLink = document.getElementById('input-link');
    const savedLinkContainer = document.getElementById('saved-link-container');
    
    function saveLink(link) {
        localStorage.setItem('saved_link', link);
        renderSavedLink();
    }
    function renderSavedLink() {
        const link = localStorage.getItem('saved_link');
        savedLinkContainer.innerHTML = '';
        if (link) {
            const a = document.createElement('a');
            a.href = link;
            a.textContent = link;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'saved-link';
            savedLinkContainer.appendChild(a);
        }
    }
    formLink.addEventListener('submit', (e) => {
        e.preventDefault();
        let link = inputLink.value.trim();
        if(link && !link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'https://' + link; 
        }
        if (link) {
            saveLink(link);
            inputLink.value = '';
        }
    });

    // --- 12.9. GERENCIAR TAREFAS FIXAS (CONFIG) ---
    const formFixa = document.getElementById('form-fixa');
    const inputFixaText = document.getElementById('input-fixa-text');
    const inputFixaHour = document.getElementById('input-fixa-hour');
    const inputFixaMinute = document.getElementById('input-fixa-minute');
    const listFixa = document.getElementById('lista-tarefas-fixas');

    function renderTasksFixasSettings() {
        listFixa.innerHTML = '';
        tasks_fixas.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')).forEach(task => {
            listFixa.appendChild(createTaskElement(task, 'fixa', false));
        });
    }
    
    formFixa.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputFixaText.value.trim();
        const hour = inputFixaHour.value;
        const minute = inputFixaMinute.value;
        const time = (hour && minute) ? `${hour}:${minute}` : ''; 
        
        if (text && time) { 
            tasks_fixas.push({ id: Date.now(), text, time, task: text }); 
            inputFixaText.value = '';
            inputFixaHour.value = '';
            inputFixaMinute.value = '';
            saveAndRenderAll();
        } else if (!time) {
            showInfoModal("Erro", "<p>Por favor, defina um horário para a tarefa fixa.</p>");
        }
    });

    // --- 13. LÓGICA DO DIA DE FOLGA ---
    const dayOffBtn = document.getElementById('day-off-btn');
    const folgaModalOverlay = document.getElementById('folga-modal-overlay');
    const folgaModalCloseBtn = document.getElementById('folga-modal-close-btn');
    const formFolga = document.getElementById('form-folga');
    const inputFolgaText = document.getElementById('input-folga-text');
    const inputFolgaHour = document.getElementById('input-folga-hour');
    const inputFolgaMinute = document.getElementById('input-folga-minute');
    const listFolga = document.getElementById('lista-folga');
    let tasks_folga = JSON.parse(localStorage.getItem('tasks_folga')) || [];
    
    function saveTasksFolga() { localStorage.setItem('tasks_folga', JSON.stringify(tasks_folga)); }
    function renderTasksFolga() {
        listFolga.innerHTML = '';
        tasks_folga.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
        tasks_folga.forEach(task => {
            listFolga.appendChild(createTaskElement(task, 'folga', true));
        });
    }
    formFolga.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputFolgaText.value.trim();
        const hour = inputFolgaHour.value;
        const minute = inputFolgaMinute.value;
        const time = (hour && minute) ? `${hour}:${minute}` : ''; 
        if (text) {
            tasks_folga.push({ id: Date.now(), text, time, completed: false });
            inputFolgaText.value = '';
            inputFolgaHour.value = '';
            inputFolgaMinute.value = '';
            saveAndRenderAll(); 
        }
    });
    dayOffBtn.addEventListener('click', () => {
        const todayStr = getFormattedDate(new Date());
        let diasDeFolga = JSON.parse(localStorage.getItem('dias_folga')) || [];
        if (!diasDeFolga.includes(todayStr)) {
            showConfirmModal("Dia de Folga?", "<p>Deseja marcar hoje como um dia de folga? Isso irá desativar as recompensas do dia e limpar suas tarefas de Pessoal/Trabalho de hoje.</p>", () => {
                diasDeFolga.push(todayStr);
                localStorage.setItem('dias_folga', JSON.stringify(diasDeFolga));
                tasks_pessoal = [];
                tasks_trabalho = [];
                saveAndRenderAll();
                checkCompletionStatus(); 
                folgaModalOverlay.classList.add('active');
                triggerBubbles();
            });
        } else {
            folgaModalOverlay.classList.add('active');
        }
    });
    folgaModalCloseBtn.addEventListener('click', () => { folgaModalOverlay.classList.remove('active'); });
    folgaModalOverlay.addEventListener('click', (e) => { if (e.target === folgaModalOverlay) folgaModalOverlay.classList.remove('active'); });

    // --- 14. EFEITO DE BOLHAS ---
    const bubbleCanvas = document.getElementById('bubble-canvas');
    const bubbleCtx = bubbleCanvas.getContext('2d');
    let bubbles = [];
    function resizeBubbleCanvas() { bubbleCanvas.width = window.innerWidth; bubbleCanvas.height = window.innerHeight; }
    function createBubble() { /* ... (código inalterado) ... */ 
        const r = Math.random() * 10 + 10; 
        return { x: Math.random() * bubbleCanvas.width, y: bubbleCanvas.height + r, r: r, color: `rgba(255, 255, 255, 0.3)`, speed: Math.random() * 2 + 1, wave: Math.random() * 5 };
    }
    function drawBubbles() { /* ... (código inalterado) ... */
        bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
        bubbles.forEach((bubble, index) => {
            bubble.y -= bubble.speed; bubble.x += Math.sin(bubble.y / bubble.r) * bubble.wave;
            if (bubble.y < -bubble.r) bubbles.splice(index, 1);
            bubbleCtx.beginPath(); bubbleCtx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2); bubbleCtx.fillStyle = bubble.color; bubbleCtx.fill(); bubbleCtx.closePath();
        });
        if (bubbles.length > 0) requestAnimationFrame(drawBubbles); else bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
    }
    function triggerBubbles() {
        resizeBubbleCanvas(); const bubbleCount = 50; const wasEmpty = bubbles.length === 0;
        for (let i = 0; i < bubbleCount; i++) bubbles.push(createBubble());
        if (wasEmpty) requestAnimationFrame(drawBubbles);
    }
    window.addEventListener('resize', resizeBubbleCanvas);

    // --- 15. POPULAR SELECTS DE HORA/MINUTO ---
    function populateTimeSelects() {
        const forms = ['pessoal', 'trabalho', 'entretenimento', 'folga', 'fixa'];
        
        forms.forEach(form => {
            const hourSelect = document.getElementById(`input-${form}-hour`);
            const minuteSelect = document.getElementById(`input-${form}-minute`);
            
            if (!hourSelect || !minuteSelect) return;

            hourSelect.innerHTML = '<option value="">-- Hora --</option>';
            minuteSelect.innerHTML = '<option value="">-- Min --</option>';

            for (let i = 0; i < 24; i++) {
                const hour = String(i).padStart(2, '0');
                hourSelect.innerHTML += `<option value="${hour}">${hour}</option>`;
            }
            
            for (let i = 0; i < 60; i += 5) {
                const minute = String(i).padStart(2, '0');
                minuteSelect.innerHTML += `<option value="${minute}">${minute}</option>`;
            }
        });
    }

    // --- 16. (ATUALIZADO) LOJA DE RECOMPENSAS ---
    const formLoja = document.getElementById('form-loja');
    const inputLojaText = document.getElementById('input-loja-text');
    const inputLojaCost = document.getElementById('input-loja-cost');
    const listLoja = document.getElementById('lista-loja');
    // (ATUALIZADO) 13 novos itens
    let rewards_shop = JSON.parse(localStorage.getItem('rewards_shop')) || [
        { id: 1, text: "15 min. Rede Social", cost: 50 },
        { id: 2, text: "1 Café Especial", cost: 70 },
        { id: 3, text: "1 Episódio de Série", cost: 150 },
        { id: 4, text: "30 min. de Jogo", cost: 200 },
        { id: 5, text: "1h de Jogo", cost: 300 },
        { id: 6, text: "1 Sobremesa", cost: 350 },
        { id: 7, text: "Assistir um Filme", cost: 400 },
        { id: 8, text: "Pedir Comida (iFood)", cost: 1000 },
        { id: 9, text: "Comprar Roupa Nova", cost: 1500 },
        { id: 10, text: "1 dia de Folga Total", cost: 2000 },
        { id: 11, "text": "Jantar Fora", cost: 1200 },
        { id: 12, "text": "Passeio no Parque", cost: 250 },
        { id: 13, "text": "Soneca de 30 min", cost: 100 },
        { id: 14, "text": "Música alta por 15 min", cost: 50 },
        { id: 15, "text": "Comprar um Livro", cost: 800 }
    ];
    
    function saveRewardsShop() { localStorage.setItem('rewards_shop', JSON.stringify(rewards_shop)); }

    function renderRewardsShop() {
        listLoja.innerHTML = '';
        if (rewards_shop.length === 0) {
            listLoja.innerHTML = '<li>(Crie suas próprias recompensas!)</li>';
            return;
        }
        
        rewards_shop.sort((a, b) => a.cost - b.cost).forEach(reward => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="reward-shop-info">
                    <span class="reward-shop-text">${reward.text}</span>
                    <span class="reward-shop-cost">${reward.cost} XP</span>
                </div>
                <button class="btn-redeem" data-id="${reward.id}" data-cost="${reward.cost}">Resgatar</button>
            `;
            
            const redeemBtn = li.querySelector('.btn-redeem');
            if (userStats.points < reward.cost) {
                redeemBtn.disabled = true;
            }
            
            redeemBtn.addEventListener('click', () => redeemReward(reward));
            listLoja.appendChild(li);
        });
    }

    function redeemReward(reward) {
        if (userStats.points < reward.cost) {
            showInfoModal("Pontos Insuficientes", "<p>Você não tem XP suficiente para resgatar esta recompensa.</p>");
            return;
        }
        
        showConfirmModal("Resgatar Recompensa?", `<p>Deseja gastar <strong>${reward.cost} XP</strong> para resgatar: <strong>${reward.text}</strong>?</p>`, () => {
            userStats.points -= reward.cost;
            saveAndRenderAll(); 
            showInfoModal("Recompensa Resgatada!", `<p>Você resgatou "${reward.text}"! Aproveite!</p>`);
        });
    }

    formLoja.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputLojaText.value.trim();
        const cost = parseInt(inputLojaCost.value);
        
        if (text && cost && cost > 0) {
            rewards_shop.push({ id: Date.now(), text, cost });
            inputLojaText.value = '';
            inputLojaCost.value = '';
            saveAndRenderAll();
        } else {
            showInfoModal("Erro", "<p>Por favor, preencha o nome e um custo válido.</p>");
        }
    });

    // --- 17. ANIMAÇÃO DE LEVEL UP ---
    const levelUpModal = document.getElementById('level-up-modal-overlay');
    const levelUpIcon = document.getElementById('level-up-icon');
    const levelUpText = document.getElementById('level-up-text');
    const levelUpCloseBtn = document.getElementById('level-up-close-btn');
    
    function playLevelUpSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.type = 'triangle'; gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.15);
            oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.25);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 0.3);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
            oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.6);
        } catch (e) { console.warn("Web Audio API não suportada ou falhou.", e); }
    }

    function triggerLevelUp(level) {
        const icon = getLevelIcon(level);
        levelUpIcon.textContent = icon;
        levelUpText.textContent = `Nível ${level}!`;
        levelUpModal.classList.add('active');
        playLevelUpSound();
        setTimeout(hideLevelUpModal, 3000); 
    }
    
    function hideLevelUpModal() { levelUpModal.classList.remove('active'); }
    levelUpCloseBtn.addEventListener('click', hideLevelUpModal);

    // --- 18. (NOVO) NOTIFICAÇÕES LOCAIS ---
    const enableNotificationsBtn = document.getElementById('enable-notifications-btn');
    const notificationsInfo = document.getElementById('notifications-info');
    let notificationPermission = Notification.permission;

    function updateNotificationButton() {
        if (notificationPermission === 'granted') {
            enableNotificationsBtn.style.display = 'none';
            notificationsInfo.style.display = 'block';
        } else {
            enableNotificationsBtn.style.display = 'block';
            notificationsInfo.style.display = 'none';
        }
    }

    enableNotificationsBtn.addEventListener('click', async () => {
        notificationPermission = await Notification.requestPermission();
        updateNotificationButton();
        if (notificationPermission === 'granted') {
            showInfoModal("Notificações Ativadas!", "<p>Você receberá lembretes das suas tarefas.</p>");
        } else {
            showInfoModal("Notificações Bloqueadas", "<p>Você precisa permitir as notificações nas configurações do seu navegador para receber lembretes.</p>");
        }
    });

    let notifiedTasks = new Set(); // Para não notificar duas vezes
    function checkTaskReminders() {
        if (notificationPermission !== 'granted') return;

        const now = new Date();
        const alertTime = new Date(now.getTime() + 5 * 60000); // 5 minutos no futuro
        const currentHour = String(alertTime.getHours()).padStart(2, '0');
        const currentMinute = String(alertTime.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;
        
        const allTasks = [...tasks_fixas, ...tasks_pessoal, ...tasks_trabalho, ...tasks_folga];
        
        allTasks.forEach(task => {
            if (task.time === currentTime && !notifiedTasks.has(task.id) && !task.completed) {
                const swRegistration = navigator.serviceWorker.getRegistration();
                if (swRegistration) {
                    swRegistration.then(reg => {
                        reg.showNotification('Lembrete de Tarefa!', {
                            body: `Às ${task.time}: ${task.text}`,
                            icon: 'icon-192x192.png',
                            badge: 'icon-192x192.png',
                            vibrate: [200, 100, 200]
                        });
                        notifiedTasks.add(task.id);
                        // Reseta o "notified" depois de um tempo
                        setTimeout(() => notifiedTasks.delete(task.id), 61000);
                    });
                }
            }
        });
    }

    // --- 19. INICIALIZAÇÃO GERAL ---
    populateTimeSelects(); 
    applyDarkMode(isDarkMode); 
    checkStreakOnLoad();    
    renderCalendar();       
    saveAndRenderAll();     
    renderSavedLink(); 
    updateNotificationButton(); // (NOVO)
    setInterval(checkTaskReminders, 60000); // Checa a cada minuto (NOVO)

    // Registrar o Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registrado:', registration);
                })
                .catch(error => {
                    console.log('Falha no registro do SW:', error);
                });
        });
    }
});