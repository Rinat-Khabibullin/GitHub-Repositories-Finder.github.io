const searchInput = document.getElementById('searchInput');
const autocomplete = document.getElementById('autocomplete');
const repositoriesList = document.getElementById('repositories');

let debounceTimeout;


function clearAutocomplete() {
    autocomplete.innerHTML = '';
}

function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

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


searchInput.addEventListener('input', handleInput);

repositoriesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const repoElement = event.target.closest('.repository');
        repositoriesList.removeChild(repoElement);
    }
});
