const URL = "https://pokeapi.co/api/v2/pokemon/";
const infoPokemon = document.querySelector("#info-pokemon");

function changePokemon(index) {
    // Ocultar todas las imágenes
    var images = document.querySelectorAll('.pokemon-img');
    images.forEach(img => {
        img.classList.remove('active');
    });

    // Mostrar la imagen seleccionada
    images[index - 1].classList.add('active');

    // Cambiar el estado activo de los círculos
    var circles = document.querySelectorAll('.circle');
    circles.forEach(circle => {
        circle.classList.remove('active');
    });
    circles[index - 1].classList.add('active');

    // Obtener el nombre del Pokémon desde el elemento DOM
    const nombrePokemonElemento = document.querySelector('.nombre-pokemon p');
    const nombrePokemon = nombrePokemonElemento.textContent;

    // Modificar el nombre del Pokémon según la imagen seleccionada
    if (index === 1) {
        // Imagen normal
        nombrePokemonElemento.textContent = nombrePokemon.replace(' - Shiny', '');
    } else if (index === 2) {
        // Imagen shiny
        if (!nombrePokemon.endsWith(' - Shiny')) {
            nombrePokemonElemento.textContent = `${nombrePokemon} - Shiny`;
        }
    }
}

function obtenerPokemonIdDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function inicializarPagina() {
    const pokemonId = obtenerPokemonIdDesdeUrl();
    if (pokemonId) {
        fetch(URL + pokemonId)
            .then(response => response.json())
            .then(data => {
                obtenerDatosPokemon(data);
            })
            .catch(error => {
                console.error('Error al obtener datos del Pokémon:', error);
            });
    } else {
        console.error('No se encontró el ID del Pokémon en la URL.');
    }
}

function obtenerDatosPokemon(poke) {
    if (!infoPokemon) {
        console.error('No se encontró el elemento con el ID "info-pokemon" en el documento.');
        return;
    }

    infoPokemon.innerHTML = `
        <div class="pokemon-container">
            <div class="pokemon-card">
                <div class="imagenes">
                    <img src="${poke.sprites.other['official-artwork'].front_default}"
                        alt="${poke.name}" class="pokemon-img active" id="pokemon-normal">
                    <img src="${poke.sprites.other['official-artwork'].front_shiny}"
                        alt="${poke.name}" class="pokemon-img" id="pokemon-shiny">
                </div>
                <div class="circles">
                    <div class="circle active" onclick="changePokemon(1)"></div>
                    <div class="circle" onclick="changePokemon(2)"></div>
                </div>
            </div>
            <div class="nombre-pokemon">
                <p>${poke.name}</p>
            </div>
        </div>
        <div class="info">
            <p class="texto">Número en la pokedex: <span class="texto-info numero">#${poke.id}</span></p>
            <p class="texto">Altura: <span class="texto-info">${poke.height / 10} m</span></p>
            <p class="texto">Peso: <span class="texto-info">${poke.weight / 10} kg</span></p>
            <p class="texto">Tipo: ${obtenerTiposConColor(poke.types)}</p>
            <p class="texto">Debilidad: ${obtenerDebilidades(poke.types)}</p>
        </div>
    `;
}

function obtenerTiposConColor(types) {
    const tipoHTML = types.map(type => {
        const typeName = type.type.name;
        return `<span class="tipo ${typeName}">${typeName}</span>`;
    }).join(' ');

    return tipoHTML;
}

// Implementación de obtenerDebilidades para obtener las debilidades reales
function obtenerDebilidades(types) {
    // Obtener debilidades del módulo debilidades.js
    return obtenerDebilidadesReales(types);
}

// debilidades.js (aquí debes tener el siguiente código)
const debilidadesPorTipo = {
    normal: [],
    fire: ['water', 'rock', 'ground'],
    water: ['electric', 'grass'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dark: ['fighting', 'bug', 'fairy'],
    dragon: ['ice', 'dragon', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

function obtenerDebilidadesReales(types) {
    const tipos = types.map(type => type.type.name);
    const debilidades = tipos.reduce((acc, tipo) => {
        const weaknesses = debilidadesPorTipo[tipo];
        if (weaknesses) {
            acc.push(...weaknesses);
        }
        return acc;
    }, []);

    const debilidadesUnicas = [...new Set(debilidades)];
    const debilidadesHTML = debilidadesUnicas.map(tipo => {
        return `<span class="tipo ${tipo}">${tipo}</span>`;
    }).join(' ');

    return debilidadesHTML;
}

// Inicialización de la página al cargar
inicializarPagina();
