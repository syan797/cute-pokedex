window.addEventListener("load", function(){

    // Your client-side JavaScript here
    let currentPokemonDexNum;

    favButton = document.querySelector("#favButton");
    clearButton = document.querySelector("#clearButton");
    favButton.addEventListener("click", favButtonClick);
    clearButton.addEventListener("click", clearButtonClick);
    
    displayAllPokemon();
    //displayRandomPokemonDetails();
    displayPokemon("random");
    updateFavsSection();
    

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
            /*
            newCell.setAttribute("data-dex-num", pokemon.dexNumber);
            newCell.addEventListener("click", displaySpecificPokemonDetails);
            */
            newCell.addEventListener("click", () => displayPokemon(pokemon.dexNumber));

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

    /*
    async function displayRandomPokemonDetails() {
        let randomPokemonResponse = await fetch("https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/random");
        let randomPokemonObj = await randomPokemonResponse.json();
        displayPokemonDetails(randomPokemonObj);
        let randomPokemonObj = await fetchPokemonObj("https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/random");
        displayPokemonDetails(randomPokemonObj);
    }
    */

    /*
    async function displaySpecificPokemonDetails(event) {
        let dexNum = event.target.getAttribute("data-dex-num");
        let pokemonObj = await getSpecificPokemon(dexNum);
        displayPokemonDetails(pokemonObj);
    }
    */

    async function displayPokemon(dexNum) {
        showLoading();
        let pokemonObj;
        try {
            console.log(dexNum);
            pokemonObj = await getPokemon(dexNum);
            console.log(pokemonObj);
        } catch (error) {
            console.error("Error:", error);
            showError();
        }
        displayPokemonDetails(pokemonObj);
    }

    /*
    async function displaySpecificPokemonDetails(dexNum) {
        let pokemonObj = await getSpecificPokemon(dexNum);
        displayPokemonDetails(pokemonObj);
    }
    */

    async function getPokemon(dexNum) {
        let pokemonResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}`);
        let pokemonObj = await pokemonResponse.json();
        return pokemonObj;
    }
    
    /*
    async function fetchPokemonObj(link) {
        showLoading();
        try {
            let pokemonResponse = await fetch(link);
            let pokemonObj = await pokemonResponse.json();
            return pokemonObj;
        } catch (error) {
            console.error("Error:", error);
            showError();
        }
    }
    */

    function showLoading() {
        document.querySelector("#image").classList.add("hidden");
        document.querySelector("#loadingBox").classList.remove("hidden");
    }

    function showError() {
        document.querySelector("#loadingText").classList.add("hidden");
        document.querySelector("#errorText").classList.remove("hidden");
    }

    function hideLoadingBox() {
        document.querySelector("#image").classList.remove("hidden");
        document.querySelector("#loadingText").classList.remove("hidden");
        document.querySelector("#errorText").classList.add("hidden");
        document.querySelector("#loadingBox").classList.add("hidden");
    }

    function displayPokemonDetails(pokemonObj) {
        currentPokemonDexNum = pokemonObj.dexNumber;
        insertName(pokemonObj.name);
        insertImage(pokemonObj.imageUrl, pokemonObj.name);
        insertPokedexNum(currentPokemonDexNum);
        insertDescription(pokemonObj.dexEntry);
        insertTypeInfo(pokemonObj);
        setFavButton();
    }

    function insertName(name) {
        let nameArray = document.querySelectorAll(".pokemonName");
        nameArray.forEach((space) => {
            space.innerText = name;
        });
    }

    function insertImage(url, name) {
        hideLoadingBox();
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

    function insertTypeInfo(pokemonObj) {
        let typesList = getAndClearContainer("#typesList");
        let offenseInfo = getAndClearContainer("#offenseTablesContainer");
        let defenseInfo = getAndClearContainer("#defenseTBody");
        
        let typesArray = pokemonObj.types;
        insertTypesList(typesArray, typesList);
        typesArray.forEach((type) => addOffenseTable(type, offenseInfo));
        addDefenseTable(currentPokemonDexNum, defenseInfo);
    }
    
    function insertTypesList(typesArray, container) {
        for (let i = 0; i < typesArray.length; i++) {
            type = typesArray[i];
            container.innerHTML += type;
            if (i != typesArray.length-1) {
                container.innerHTML += ", ";
            }
        }
    }
    
    function getAndClearContainer(selector) {
        let container = document.querySelector(selector);
        container.innerHTML = "";
        return container;
    }

    async function addOffenseTable(type, container) {
        //Setting up the table
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
        container.appendChild(table);
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        //Retrieving the offense data
        let typeResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/types/${type}`);
        let typeObj = await typeResponse.json();
        let offenseArray = typeObj.offenseDamageMultipliers;

        //Adding the data to the table
        offenseArray.forEach((rowInfo) => addRowInfo(rowInfo, tbody));
    }

    async function addDefenseTable(dexNum, container) {
        //Retrieving the defense data
        let defenseResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}/defense-profile`);
        let defenseArray = await defenseResponse.json();
        
        //Adding the data to the table
        defenseArray.forEach((rowInfo) => addRowInfo(rowInfo, container));
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

    function getFavs() {
        let favs = localStorage.getItem("favs");
        if (favs !== null) {
            favs = JSON.parse(favs);
        } else {
            favs = [];
        }
        return favs;
    }

    function setFavButton() {
        let favButton = document.querySelector("#favButton");
        let favs = getFavs();

        //check if this Pokemon is already in My Favourite Pokemon
        if (favs.includes(currentPokemonDexNum)) {
            //Button is set to remove
            favButton.innerText = "Remove from My Favourite Pokemon";
        } else {
            //Button is set to add
            favButton.innerText = "Add to My Favourite Pokemon";
        }
    }

    function favButtonClick() {
        //check if this Pokemon is already in My Favourite Pokemon
        const favs = getFavs();
        if (favs.includes(currentPokemonDexNum)) {
            removeFromFavs();
        } else {
            addToFavs();
        }
    }
    
    function addToFavs() {
        let favs = getFavs();
        favs.push(currentPokemonDexNum);
        localStorage.setItem("favs", JSON.stringify(favs));
        updateFavsSection();
        favButton.innerText = "Remove from My Favourite Pokemon";
    }
    
    function removeFromFavs() {
        let favs = getFavs();
        const index = favs.indexOf(currentPokemonDexNum);
        if (index !== -1) {
            favs.splice(index, 1);
            localStorage.setItem("favs", JSON.stringify(favs));
            updateFavsSection();
        }
        favButton.innerText = "Add to My Favourite Pokemon";
    }

    function updateFavsSection() {
        const favsContainer = document.querySelector("#favsContainer");
        favsContainer.innerHTML = "";

        let favs = getFavs();
        
        //changes status of clear button
        if (favs.length > 0) {
            clearButton.classList.add("active");
            favs.forEach((dexNum) => displayImageInFavs(dexNum));
        } else {
            clearButton.classList.remove("active");
            favsContainer.innerHTML = "<p>No favourites to display.</p>";
        }

        
        async function displayImageInFavs(dexNum) {
            let pokemonObj = await getPokemon(dexNum);
            let favPokemon = document.createElement("div");
            favPokemon.classList.add("favPokemonContainer");
            favsContainer.appendChild(favPokemon);

            let bkg = document.createElement("div");
            bkg.classList.add("pokemonBackground", "favBackground");
            favPokemon.appendChild(bkg);
            
            let img = document.createElement("img");
            img.src = pokemonObj.imageUrl;
            img.alt = pokemonObj.name;
            img.classList.add("fav");
            img.addEventListener("click", () => displayPokemon(pokemonObj.dexNumber));
            img.addEventListener("mouseenter", () => favPokemon.classList.add("highlight"));
            img.addEventListener("mouseleave", () => favPokemon.classList.remove("highlight"));
            favPokemon.appendChild(img);
        }
    }

    function clearButtonClick() {
        if (clearButton.classList.contains("active")) {
            const userConfirmed = window.confirm("Are you sure? You will lose all Pokemon currently in your favourites.");
            if (userConfirmed) {
                clearAllFavs();
            }
        }
    }

    function clearAllFavs() {
        newFavArray = [];
        localStorage.setItem("favs", JSON.stringify(newFavArray));
        updateFavsSection();
    }

});