class ScrumBoard {
    constructor() {
        this.columns = {
            todo: document.getElementById('todo-column'),
            'in-progress': document.getElementById('in-progress-column'),
            review: document.getElementById('review-column'),
            done: document.getElementById('done-column'),
        };
        this.addCardButtons = {
            todo: document.getElementById('add-card-todo'),
            'in-progress': document.getElementById('add-card-in-progress'),
            review: document.getElementById('add-card-review'),
            done: document.getElementById('add-card-done'),
        };
        this.modal = document.getElementById('add-card-modal');
        this.cardTitleInput = document.getElementById('card-title-input');
        this.cardDateInput = document.getElementById('card-date-input');
        this.userNameInput = document.getElementById('userName');
        this.cardColumnInput = document.getElementById('cardColumn');
        this.submitCardBtn = document.getElementById('submit-card-btn');
        this.cancelCardBtn = document.getElementById('cancel-card-btn');
        this.currentColumnId = 'todo';

        this.initEventListeners();
        this.loadFromLocalStorage();
    }
// event listeners
    initEventListeners() {
        // modal 
        Object.entries(this.addCardButtons).forEach(([columnId, button]) => {
            button.addEventListener('click', () => this.openAddCardModal(columnId));
        });

        // modal buttons
        this.submitCardBtn.addEventListener('click', () => this.submitCard());
        this.cancelCardBtn.addEventListener('click', () => this.closeAddCardModal());

        // drag and drop listeners
        Object.values(this.columns).forEach(column => {
            column.addEventListener('dragover', this.handleDragOver);
            column.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    openAddCardModal(columnId) {
        this.currentColumnId = columnId;
        this.modal.style.display = 'block';
        this.cardTitleInput.value = '';
        this.cardDateInput.value = this.formatDateForInput(new Date());
        this.userNameInput.value = '';
        this.cardColumnInput.value = columnId;
    }

    closeAddCardModal() {
        this.modal.style.display = 'none';
    }

    submitCard() {
        const title = this.cardTitleInput.value.trim();
        const endDate = this.cardDateInput.value;
        const userName = this.userNameInput.value.trim();
        const columnId = this.cardColumnInput.value;

        if (!title || !endDate) return;

        const card = this.createCard(title, endDate, userName, columnId);
        const column = this.columns[columnId];
        column.appendChild(card);

        this.closeAddCardModal();
        this.saveToLocalStorage();
    }

    createCard(title, endDate, userName, columnId) {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.endDate = endDate;
        card.dataset.userName = userName;
        const cardId = `card-${Date.now()}`;
        card.id = cardId;
        card.innerHTML = `
            <span class="delete-btn" onclick="scrumBoard.deleteCard('${cardId}')">✖</span>
            <div class="card-details">
                <span class="card-title">${title}</span>
                <span class="assigned-user">${userName}</span>
            </div>
            <div class="card-details">
                <span class="date-badge">${this.formatDate(new Date(endDate))}</span>
                <input type="checkbox" onchange="scrumBoard.toggleComplete('${cardId}')">
            </div>
        `;

        card.addEventListener('dragstart', this.handleDragStart.bind(this));
        return card;
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e) {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(cardId);

        if (card) {
            e.currentTarget.appendChild(card);
            card.classList.remove('dragging');
            this.saveToLocalStorage();
        }
    }

    deleteCard(cardId) {
        const card = document.getElementById(cardId);
        if (card) {
            card.remove();
            this.saveToLocalStorage();
        }
    }

    toggleComplete(cardId) {
        const card = document.getElementById(cardId);
        const titleSpan = card.querySelector('.card-title');
        titleSpan.classList.toggle('completed');
        this.saveToLocalStorage();
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    saveToLocalStorage() {
        const boardState = {};
        Object.entries(this.columns).forEach(([columnName, columnEl]) => {
            boardState[columnName] = Array.from(columnEl.querySelectorAll('.card')).map(card => ({
                id: card.id,
                title: card.querySelector('.card-title').textContent,
                endDate: card.dataset.endDate,
                completed: card.querySelector('.card-title').classList.contains('completed'),
                userName: card.dataset.userName,
            }));
        });
        localStorage.setItem('scrumBoardState', JSON.stringify(boardState));
    }

    loadFromLocalStorage() {
        const savedState = localStorage.getItem('scrumBoardState');
        if (savedState) {
            const boardState = JSON.parse(savedState);
            Object.entries(boardState).forEach(([columnName, cards]) => {
                const column = this.columns[columnName];
                cards.forEach(cardData => {
                    const card = this.createCard(cardData.title, cardData.endDate, cardData.userName, columnName);
                    if (cardData.completed) {
                        card.querySelector('.card-title').classList.add('completed');
                        card.querySelector('input[type="checkbox"]').checked = true;
                    }
                    column.appendChild(card);
                });
            });
        }
    }
}

// create  event handling
const scrumBoard = new ScrumBoard();
