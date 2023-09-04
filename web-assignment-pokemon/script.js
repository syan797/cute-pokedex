window.addEventListener("load", function(){

    // Your client-side JavaScript here
    displayAllPokemon();

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

});