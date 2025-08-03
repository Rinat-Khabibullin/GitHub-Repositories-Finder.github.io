const searchInput = document.getElementById('searchInput');
const autocomplete = document.getElementById('autocomplete');
const repositoriesList = document.getElementById('repositories');

let debounceTimeout;

// Функция для очистки autocomplete
function clearAutocomplete() {
    autocomplete.innerHTML = '';
}

// Функция для создания дебаунса
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Функция для получения данных с GitHub API
async function fetchRepositories(query) {
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${query}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return { items: [] };
    }
}

// Обработка ввода в поле поиска
const handleInput = debounce(async () => {
    const query = searchInput.value.trim();
    
    if (!query) {
        clearAutocomplete();
        return;
    }

    const { items } = await fetchRepositories(query);
    
    clearAutocomplete();
    
    if (items.length > 0) {
        const fragment = document.createDocumentFragment();
        
        items.slice(0, 5).forEach(repo => {
            const repoItem = document.createElement('div');
            repoItem.dataset.id = repo.id;
            repoItem.textContent = repo.name;
            repoItem.addEventListener('click', () => addRepository(repo));
            
            fragment.appendChild(repoItem);
        });
        
        autocomplete.appendChild(fragment);
    }
}, 400);

// Добавление репозитория в список
function addRepository(repo) {
    const repoElement = document.createElement('div');
    repoElement.classList.add('repository');
    
    repoElement.innerHTML = `
        <div class="repository-info">
            <div class="repository-name">Name: ${repo.name}</div>
            <div class="repository-owner">Owner:  ${repo.owner.login}</div>
            <div class="repository-stars">Stars:  ${repo.stargazers_count}</div>
        </div>
        <div class="remove-btn" data-id="${repo.id}"></div>
    `;
    
    repositoriesList.appendChild(repoElement);
    
    searchInput.value = '';
    clearAutocomplete();
    
    repoElement.querySelector('.remove-btn').addEventListener('click', () => {
        repositoriesList.removeChild(repoElement);
    });
}

// Обработчик событий
searchInput.addEventListener('input', handleInput);

// Делегирование событий для удаления
repositoriesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const repoElement = event.target.closest('.repository');
        repositoriesList.removeChild(repoElement);
    }
});
