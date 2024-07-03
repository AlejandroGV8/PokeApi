const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const searchInput = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");
const paginationContainer = document.getElementById("pagination");
const URL = "https://pokeapi.co/api/v2/";
let allPokemons = [];
let filteredPokemons = [];
let currentPage = 1;
const itemsPerPage = 20;
const maxPageButtons = 5;

// Función para obtener todos los Pokémon
async function obtenerTodosLosPokemons() {
    try {
        const response = await fetch(URL + "pokemon?limit=1302");
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de Pokémon.');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error al obtener todos los Pokémon:', error);
        return [];
    }
}

// Función para obtener Pokémon por tipo
async function obtenerPokemonsPorTipo(type) {
    try {
        const response = await fetch(URL + `type/${type}`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de Pokémon por tipo.');
        }
        const data = await response.json();
        return data.pokemon.map(pokemon => ({
            name: pokemon.pokemon.name,
            url: pokemon.pokemon.url
        }));
    } catch (error) {
        console.error('Error al obtener los Pokémon por tipo:', error);
        return [];
    }
}

// Inicializar la página
async function inicializarPagina() {
    try {
        allPokemons = await obtenerTodosLosPokemons();
        filteredPokemons = allPokemons; // Inicialmente, todos los Pokémon están filtrados
        mostrarPagina(currentPage);
        setupPagination();
    } catch (error) {
        console.error('Error al inicializar la página:', error);
    }
}

// Función para formatear medidas (altura y peso)
function formatearMedida(medida) {
    return (medida / 10).toFixed(1).replace('.', ',');
}

// Función para mostrar un Pokémon en el DOM
async function mostrarPokemon(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del Pokémon.');
        }
        const data = await response.json();

        let tipos = data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
        tipos = tipos.join('');

        let pokeId = data.id.toString().padStart(4, '0');

        const pesoFormateado = formatearMedida(data.weight);
        const alturaFormateada = formatearMedida(data.height);

        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
            <p class="pokemon-id-back">#${pokeId}</p>
            <div class="pokemon-imagen">
                <img src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}">
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h2 class="pokemon-nombre">${data.name}</h2>
                </div>
                <div class="pokemon-tipos">
                    ${tipos}
                </div>
                <div class="pokemon-stats">
                    <p class="stat">${alturaFormateada}m</p>
                    <p class="stat">${pesoFormateado}kg</p>
                </div>
            </div>`;

        // Manejador de eventos de clic para obtener el ID del Pokémon
        div.addEventListener('click', () => {
            window.location.href = `./paginas/pokemonStats.html?id=${data.id}`;
        });
        listaPokemon.appendChild(div);
    } catch (error) {
        console.error('Error al mostrar el Pokémon:', error);
    }
}

// Función para mostrar una página de Pokémon
async function mostrarPagina(page) {
    listaPokemon.innerHTML = "";
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPokemons = filteredPokemons.slice(start, end);

    for (let i = 0; i < paginatedPokemons.length; i++) {
        await mostrarPokemon(paginatedPokemons[i].url);
    }
}

// Configurar la paginación
function setupPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);
    let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
    let endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

    if (endPage - startPage < maxPageButtons - 1) {
        startPage = Math.max(endPage - maxPageButtons + 1, 1);
    }

    // Botón "Volver al principio"
    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.className = 'pagination-control';
        firstButton.textContent = 'Volver al principio';
        firstButton.addEventListener('click', () => {
            currentPage = 1;
            mostrarPagina(currentPage);
            setupPagination();
        });
        paginationContainer.appendChild(firstButton);
    }

    // Botones de páginas
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button';
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            mostrarPagina(currentPage);
            setupPagination();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Botón "Ir al final"
    if (currentPage < totalPages) {
        const lastButton = document.createElement('button');
        lastButton.className = 'pagination-control';
        lastButton.textContent = 'Ir al final';
        lastButton.addEventListener('click', () => {
            currentPage = totalPages;
            mostrarPagina(currentPage);
            setupPagination();
        });
        paginationContainer.appendChild(lastButton);
    }
}

// Función para filtrar Pokémon por nombre
function filtrarPokemon(query) {
    const filtered = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(query.toLowerCase()));
    return filtered;
}

// Evento de búsqueda
searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (query.length >= 0) {
        filteredPokemons = filtrarPokemon(query);
        currentPage = 1; // Reiniciar a la primera página después de filtrar
        mostrarPagina(currentPage);
        setupPagination();
    }
    // Mostrar el botón "X" si hay texto en el campo de búsqueda
    clearButton.style.display = query.length > 0 ? 'block' : 'none';
});

// Evento para el botón "X"
clearButton.addEventListener("click", async () => {
    searchInput.value = '';
    clearButton.style.display = 'none';
    filteredPokemons = allPokemons; // Restablecer a la lista completa
    currentPage = 1; // Reiniciar a la primera página
    mostrarPagina(currentPage);
    setupPagination();
});

// Eventos de botones de tipo de Pokémon
botonesHeader.forEach(boton => boton.addEventListener("click", async (event) => {
    const botonId = event.currentTarget.id;
    listaPokemon.innerHTML = "";

    try {
        if (botonId === "ver-todos") {
            allPokemons = await obtenerTodosLosPokemons();
        } else {
            const type = botonId.toLowerCase();
            allPokemons = await obtenerPokemonsPorTipo(type);
        }
        filteredPokemons = allPokemons; // Actualizar la lista filtrada también
        currentPage = 1; // Reiniciar a la primera página después de filtrar
        mostrarPagina(currentPage);
        setupPagination();
    } catch (error) {
        console.error(error.message);
    }
}));

// Inicializar la página al cargar
inicializarPagina();
