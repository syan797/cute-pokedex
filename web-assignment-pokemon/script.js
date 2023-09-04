window.addEventListener("load", function(){

    // Your client-side JavaScript here
    displayAllPokemon();
    displayRandomPokemonDetails();

    // All data from the server must be accessed via AJAX fetch requests.
    async function displayAllPokemon() {
        let pokemonArray = await getPokemonArray();
        let pokemonTable = document.querySelector("#allPokemonTable");
        
        for (let i = 0; i < pokemonArray.length; i++) {
            //Creating a new row & cell
            let newRow = document.createElement("tr");
            let newCell = document.createElement("td");
            
            //Setting up new cell with appropriate name and event listener
            let pokemon = pokemonArray[i];
            newCell.innerText = pokemon.name;
            newCell.setAttribute("data-dex-num", pokemon.dexNumber);
            newCell.addEventListener("click", displaySpecificPokemonDetails);

            //Adding the new row & cell to the table
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

    async function displaySpecificPokemonDetails(event) {
        let dexNum = event.target.getAttribute("data-dex-num");
        let pokemonResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}`);
        let pokemonObj = await pokemonResponse.json();
        displayPokemonDetails(pokemonObj);
    }

    function displayPokemonDetails(pokemonObj) {
        insertName(pokemonObj.name);
        insertImage(pokemonObj.imageUrl, pokemonObj.name);
        insertPokedexNum(pokemonObj.dexNumber);
        insertDescription(pokemonObj.dexEntry);
        
        let typesArray = pokemonObj.types;
        insertTypesList(typesArray);
        typesArray.forEach((type) => addOffenseTable(type));

        addDefenseTable(pokemonObj.dexNumber);
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
            type = typesArray[i];
            typesList.innerHTML += type;
            if (i != typesArray.length-1) {
                typesList.innerHTML += ", ";
            }
        }
    }

    async function addOffenseTable(type) {
        //Setting up the table
        let offenseTables = document.querySelector("#offenseTablesContainer");
        let table = document.createElement("table");
        table.classList.add("typeTable");
        table.innerHTML =   `<thead>
                                <tr>
                                    <th colspan="2">${type} type attacks:</th>
                                </tr>
                                <tr>
                                    <th>Defending type</th><th>Damage dealt</th>
                                </tr>
                            </thead>`;
        offenseTables.appendChild(table);
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        //Retrieving the offense data
        let typeResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/types/${type}`);
        let typeObj = await typeResponse.json();
        let offenseArray = typeObj.offenseDamageMultipliers;

        //Adding the data to the table
        offenseArray.forEach((rowInfo) => addRowInfo(rowInfo, tbody));
    }

    async function addDefenseTable(dexNum) {
        //Getting the tbody of the table
        let tbody = document.querySelector("#defenseTBody");

        //Retrieving the defense data
        let defenseResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}/defense-profile`);
        let defenseArray = await defenseResponse.json();
        
        //Adding the data to the table
        defenseArray.forEach((rowInfo) => addRowInfo(rowInfo, tbody));
    }

    function addRowInfo(rowInfo, tbody) {
        let newRow = document.createElement("tr");
        let multiplierText = getMultiplierText(rowInfo.multiplier);
        newRow.innerHTML = `<td>${rowInfo.type}</td><td>${multiplierText}</td>`;
        tbody.appendChild(newRow);
    }

    function getMultiplierText(num) {
        if (num == 0) {
            return "No damage";
        } else if (num == 0.25) {
            return "Quarter damage";
        } else if (num == 0.5) {
            return "Half damage";
        } else if (num == 1) {
            return "Normal damage";
        } else if (num == 2) {
            return "Double damage";
        } else if (num == 4) {
            return "Quadruple damage";
        }
    }

});