window.addEventListener("load", function(){

    // Your client-side JavaScript here
    displayAllPokemon();
    displayRandomPokemonDetails();

    // All data from the server must be accessed via AJAX fetch requests.
    async function displayAllPokemon() {
        let pokemonArray = await getPokemonArray();
        let pokemonTable = document.querySelector("#allPokemonTable");
        
        for (let i = 0; i < pokemonArray.length; i++) {
            let pokemonName = pokemonArray[i].name;
            let newRow = document.createElement("tr");
            let newCell = document.createElement("td");
            newCell.innerText = pokemonName;
            pokemonTable.appendChild(newRow);
            newRow.appendChild(newCell);
        }
    }

    async function getPokemonArray() {
        let allPokemonResponse = await fetch("https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon");
        let allPokemonArray = await allPokemonResponse.json();
        return allPokemonArray;
    }

    async function displayRandomPokemonDetails() {
        let randomPokemonResponse = await fetch("https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/random");
        let randomPokemonObj = await randomPokemonResponse.json();
        displayPokemonDetails(randomPokemonObj);
    }

    function displayPokemonDetails(pokemonObj) {
        insertName(pokemonObj.name);
        insertImage(pokemonObj.imageUrl, pokemonObj.name);
        insertPokedexNum(pokemonObj.dexNumber);
        insertDescription(pokemonObj.dexEntry);
        insertTypesList(pokemonObj.types);
    }

    function insertName(name) {
        let nameArray = document.querySelectorAll(".pokemonName");
        nameArray.forEach((space) => {
            space.innerText = name;
        });
    }

    function insertImage(url, name) {
        let image = document.querySelector("#image");
        image.src = url;
        image.alt = name;
    }

    function insertPokedexNum(num) {
        let pokedexNum = document.querySelector("#pokedexNum");
        pokedexNum.innerText = num;
    }

    function insertDescription(description) {
        let descripBox = document.querySelector("#description");
        descripBox.innerText = description;
    }

    function insertTypesList(typesArray) {
        let typesList = document.querySelector("#typesList");
        for (let i = 0; i < typesArray.length; i++) {
            typesList.innerHTML += typesArray[i];
            if (i != typesArray.length-1) {
                typesList.innerHTML += ", ";
            }
        }
    }

});