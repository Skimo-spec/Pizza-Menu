// API URL
const API_URL = 'https://forkify-api.herokuapp.com/api/search?q=pizza';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const publisherInput = document.getElementById('publisherInput');
const searchButton = document.getElementById('searchButton');
const menuContainer = document.querySelector('.container');

// Function to create alert message
function createAlert(message, type = 'warning') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '1000';
    alertDiv.style.maxWidth = '600px';
    alertDiv.style.width = '90%';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);

    // Auto dismiss after 8 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 8000);
}

// Function to fetch recipe details
async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`https://forkify-api.herokuapp.com/api/get?rId=${recipeId}`);
        const data = await response.json();
        return data.recipe;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// Function to show product details
async function showProductDetails(pizza) {
    const recipe = await fetchRecipeDetails(pizza.recipe_id);
    
    if (!recipe) {
        createAlert('Error loading recipe details. Please try again.', 'danger');
        return;
    }

    const ingredientsList = recipe.ingredients
        .map(ingredient => `<li>${ingredient}</li>`)
        .join('');

    const message = `
        <div class="recipe-details">
            <h4 class="mb-3">${pizza.title}</h4>
            <p class="mb-2"><strong>Publisher:</strong> ${pizza.publisher}</p>
            <div class="ingredients-section">
                <h5 class="mb-2">Ingredients:</h5>
                <ul class="ingredients-list mb-3">
                    ${ingredientsList}
                </ul>
            </div>
            <div class="recipe-links">
                <a href="${pizza.source_url}" target="_blank" class="btn btn-sm btn-primary me-2">View Full Recipe</a>
                <a href="${recipe.source_url}" target="_blank" class="btn btn-sm btn-secondary">Original Source</a>
            </div>
        </div>
    `;
    createAlert(message);
}

// Function to fetch pizza data from API
async function fetchPizzas() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.recipes;
    } catch (error) {
        console.error('Error fetching pizzas:', error);
        return [];
    }
}

// Function to filter pizzas based on search criteria
function filterPizzas(pizzas, searchTerm, publisherTerm) {
    return pizzas.filter(pizza => {
        const matchesSearch = searchTerm ? 
            pizza.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesPublisher = publisherTerm ? 
            pizza.publisher.toLowerCase().includes(publisherTerm.toLowerCase()) : true;
        return matchesSearch && matchesPublisher;
    });
}

// Function to create pizza card HTML
function createPizzaCard(pizza) {
    return `
        <div class="col-lg-4 col-md-6 col-sm-12 pizza-card">
            <div class="card">
                <img src="${pizza.image_url}" class="card-img-top" alt="${pizza.title}">
                <div class="card-body">
                    <h5 class="card-title">${pizza.title}</h5>
                    <p class="card-text">By: ${pizza.publisher}</p>
                    <button class="btn btn-primary view-recipe" data-pizza='${JSON.stringify(pizza)}'>View Recipe</button>
                </div>
            </div>
        </div>
    `;
}

// Function to display pizzas
async function displayPizzas() {
    const pizzas = await fetchPizzas();
    const searchTerm = searchInput.value.trim();
    const publisherTerm = publisherInput.value.trim();
    
    const filteredPizzas = filterPizzas(pizzas, searchTerm, publisherTerm);
    
    if (filteredPizzas.length === 0) {
        createAlert('No pizzas found matching your search criteria.', 'info');
    }
    
    const pizzaCards = filteredPizzas.map(pizza => createPizzaCard(pizza)).join('');
    
    // Clear existing content and add new pizza cards
    menuContainer.innerHTML = `
        <div class="row">
            ${pizzaCards}
        </div>
    `;

    // Add event listeners to all view recipe buttons
    document.querySelectorAll('.view-recipe').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pizzaData = JSON.parse(button.dataset.pizza);
            showProductDetails(pizzaData);
        });
    });
}

// Function to search pizzas
async function searchPizzas() {
    const searchTerm = searchInput.value.trim();
    const publisherTerm = publisherInput.value.trim();

    if (!searchTerm && !publisherTerm) {
        createAlert('Please enter a search term for pizza name or publisher.', 'warning');
        return;
    }

    try {
        const response = await fetch(`https://forkify-api.herokuapp.com/api/search?q=${searchTerm || 'pizza'}`);
        const data = await response.json();
        const filteredPizzas = filterPizzas(data.recipes, searchTerm, publisherTerm);
        
        if (filteredPizzas.length === 0) {
            createAlert('No pizzas found matching your search criteria.', 'info');
        }
        
        const pizzaCards = filteredPizzas.map(pizza => createPizzaCard(pizza)).join('');
        
        menuContainer.innerHTML = `
            <div class="row">
                ${pizzaCards}
            </div>
        `;

        // Add event listeners to all view recipe buttons
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const pizzaData = JSON.parse(button.dataset.pizza);
                showProductDetails(pizzaData);
            });
        });
    } catch (error) {
        console.error('Error searching pizzas:', error);
        createAlert('Error searching for pizzas. Please try again.', 'danger');
    }
}

// Event Listeners
searchButton.addEventListener('click', searchPizzas);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPizzas();
    }
});
publisherInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPizzas();
    }
});


// Initial load
displayPizzas();
