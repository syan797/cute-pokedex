window.addEventListener("load", function(){
    
    // This variable stores the dexNumber of the currently displayed Pokemon.
    let currentPokemonDexNum;

    //Functions to run when page is first loaded
    setupButtons();
    loadSidebar();
    displayPokemon("random");
    updateFavsSection();

    /* 
    Functions for controlling the buttons:
    */

    //Adds event listeners to buttons
    function setupButtons() {
        favButton = document.querySelector("#favButton");
        clearButton = document.querySelector("#clearButton");
        favButton.addEventListener("click", favButtonClick);
        clearButton.addEventListener("click", clearButtonClick);
    }

    //Disables all buttons
    function disableButtons() {
        const buttons = document.querySelectorAll("button");
        buttons.forEach((button) => button.classList.remove("active"));
    }

    //Changes the main panel button to "Add" or "Remove"
    // depending on whether the current Pokemon is in the favourites list
    function updateFavButton() {
        let favButton = document.querySelector("#favButton");
        let favs = getFavs();

        if (favs.includes(currentPokemonDexNum)) {
            favButton.innerText = "Remove from My Favourite Pokemon";
        } else {
            favButton.innerText = "Add to My Favourite Pokemon";
        }
    }

    //Event handler for favButton:
    // Adds or removes the current Pokemon to/from the Favourites list
    function favButtonClick(event) {
        if (event.target.classList.contains("active")) {
            const favs = getFavs();
            if (favs.includes(currentPokemonDexNum)) {
                removeFromFavs();
            } else {
                addToFavs();
            }
        }
    }

    //Event handler for clearButton:
    // User is asked to confirm that they want to clear their Favourites list
    function clearButtonClick() {
        if (clearButton.classList.contains("active")) {
            const userConfirmed = window.confirm("Are you sure? You will lose all Pokemon currently in your favourites.");
            if (userConfirmed) {
                clearAllFavs();
            }
        }
    }

    /* 
    Functions for loading the sidebar:
    */

    //Fills the table in the sidebar with all available Pokemon
    async function loadSidebar() {
        let pokemonArray = await getPokemonArray();
        let pokemonTable = document.querySelector("#allPokemonTable");
        
        for (let i = 0; i < pokemonArray.length; i++) {
            //Creating a new row & cell
            let newRow = document.createElement("tr");
            let newCell = document.createElement("td");
            
            //Setting up new cell with appropriate name and event listener
            let pokemon = pokemonArray[i];
            newCell.innerText = pokemon.name;
            newCell.addEventListener("click", () => displayPokemon(pokemon.dexNumber));

            //Adding the new row & cell to the table
            pokemonTable.appendChild(newRow);
            newRow.appendChild(newCell);
        }
    }

    //Retrieves array of all Pokemon from server
    async function getPokemonArray() {
        let allPokemonResponse = await fetch("https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon");
        let allPokemonArray = await allPokemonResponse.json();
        return allPokemonArray;
    }

    /* 
    Functions for loading Pokemon:
    */

    //Shows loading screen, retrieves information for selected Pokemon
    // and displays it on the page
    async function displayPokemon(dexNum) {
        //Displaying the loading screen while information is being retrieved
        showLoading();

        //Retrieving the information for the selected Pokemon
        let pokemonObj;
        try {
            pokemonObj = await getPokemon(dexNum);
        } catch (error) {
            //Handling errors if any
            console.error("Error:", error);
            showError();
            disableButtons();
        }

        //Displaying retrieved information
        displayPokemonDetails(pokemonObj);
    }

    //Retrieves information for selected Pokemon from server
    async function getPokemon(dexNum) {
        let pokemonResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}`);
        let pokemonObj = await pokemonResponse.json();
        return pokemonObj;
    }

    //Given a Pokemon object, displays details onto the page
    function displayPokemonDetails(pokemonObj) {
        //Storing the Pokemon's dexNumber into the currentPokemonDexNum variable
        currentPokemonDexNum = pokemonObj.dexNumber;

        //Updating information in main details panel & type info panel
        insertName(pokemonObj.name);
        insertImage(pokemonObj.imageUrl, pokemonObj.name);
        insertPokedexNum(currentPokemonDexNum);
        insertDescription(pokemonObj.dexEntry);
        insertTypeInfo(pokemonObj);
        updateFavButton();
    }

    /* 
    Functions for displaying main Pokemon details:
    */

    //Displays Pokemon name in every location with "pokemonName" class on page
    function insertName(name) {
        let nameArray = document.querySelectorAll(".pokemonName");
        nameArray.forEach((space) => {
            space.innerText = name;
        });
    }

    //Displays Pokemon image in main image area
    function insertImage(url, name) {
        //Hiding the loading or error text
        hideLoading();

        //Displaying the image
        let image = document.querySelector("#image");
        image.src = url;
        image.alt = name;
    }

    //Displays Pokemon dexNumber in relevant location
    function insertPokedexNum(num) {
        let pokedexNum = document.querySelector("#pokedexNum");
        pokedexNum.innerText = num;
    }

    //Displays Pokemon description in relevant location
    function insertDescription(description) {
        let descripBox = document.querySelector("#description");
        descripBox.innerText = description;
    }

    /* 
    Functions for displaying Pokemon type info:
    */

    //Displays information in Types panel
    function insertTypeInfo(pokemonObj) {
        //Getting & clearing relevant containers
        let typesList = getAndClearContainer("#typesList");
        let offenseInfo = getAndClearContainer("#offenseTablesContainer");
        let defenseInfo = getAndClearContainer("#defenseTBody");
        
        //Getting array of types
        let typesArray = pokemonObj.types;

        //Adding relevant info to Types list and tables
        insertTypesList(typesArray, typesList);
        typesArray.forEach((type) => addOffenseTable(type, offenseInfo));
        addDefenseTable(currentPokemonDexNum, defenseInfo);
    }
    
    //Displays comma-separated list of types
    function insertTypesList(typesArray, container) {
        for (let i = 0; i < typesArray.length; i++) {
            //Adds each type to list
            type = typesArray[i];
            container.innerHTML += type;
            
            //Adds comma & space if this is not the last item in the array
            if (i != typesArray.length-1) {
                container.innerHTML += ", ";
            }
        }
    }
    
    //Clears & returns element on page with given selector (used to clear existing type info)
    function getAndClearContainer(selector) {
        let container = document.querySelector(selector);
        container.innerHTML = "";
        return container;
    }

    //Adds offense table for the given type to the given container 
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

    //Adds defense table for the Pokemon with the given dexNumber to the given container
    async function addDefenseTable(dexNum, container) {
        //Retrieving the defense data
        let defenseResponse = await fetch(`https://cs719-a01-pt-server.trex-sandwich.com/api/pokemon/${dexNum}/defense-profile`);
        let defenseArray = await defenseResponse.json();
        
        //Adding the data to the table
        defenseArray.forEach((rowInfo) => addRowInfo(rowInfo, container));
    }

    //Creates a row with the given information and adds it to the given table
    function addRowInfo(rowInfo, tbody) {
        let newRow = document.createElement("tr");
        let multiplierText = getMultiplierText(rowInfo.multiplier);
        newRow.innerHTML = `<td>${rowInfo.type}</td><td>${multiplierText}</td>`;
        tbody.appendChild(newRow);
    }

    //Gets the appropriate text for the given multiplier number
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

    /* 
    Functions for displaying loading or errors:
    */

    //Shows the "Loading" animation where the image usually is on the page
    function showLoading() {
        document.querySelector("#image").classList.add("hidden");
        document.querySelector("#loadingText").classList.remove("hidden");
    }

    //Shows "Error" text where the image usually is on the page
    function showError() {
        document.querySelector("#loadingText").classList.add("hidden");
        document.querySelector("#errorText").classList.remove("hidden");
    }

    //Hides any "Loading" or "Error" in the image space and shows the image
    function hideLoading() {
        document.querySelector("#image").classList.remove("hidden");
        document.querySelector("#loadingText").classList.add("hidden");
        document.querySelector("#errorText").classList.add("hidden");
    }

    /* 
    Functions for favourites section:
    */
    
    //Gets the current array of favourites from local storage
    function getFavs() {
        //Getting "favs" from local storage
        let favs = localStorage.getItem("favs");
        
        //Setting "favs" to empty array if it does not already exist
        if (favs !== null) {
            favs = JSON.parse(favs);
        } else {
            favs = [];
        }

        //Returning either the existing array or a new empty array
        return favs;
    }

    //Adds the dexNumber of the currently displayed Pokemon to the "favs" array in local storage
    function addToFavs() {
        //Adding current Pokemon dexNumber to array in local storage
        let favs = getFavs();
        favs.push(currentPokemonDexNum);
        localStorage.setItem("favs", JSON.stringify(favs));
        
        //Updating relevant parts of page
        updateFavsSection();
        updateFavButton();
    }
    
    //Removes the dexNumber of the currently displayed Pokemon from the "favs" array in local storage
    function removeFromFavs() {
        let favs = getFavs();
        const index = favs.indexOf(currentPokemonDexNum);

        //Checking that the current Pokemon dexNumber is in the "favs" array
        if (index !== -1) {
            //Removes the current Pokemon dexNumber from the array
            favs.splice(index, 1);
            localStorage.setItem("favs", JSON.stringify(favs));

            //Updating relevant parts of page
            updateFavsSection();
            updateFavButton();
        }
    }

    //Displays all favourited Pokemon in the Favourites panel
    function updateFavsSection() {
        //Clears any favourite Pokemon currently in the Favourites panel
        const favsContainer = document.querySelector("#favsContainer");
        favsContainer.innerHTML = "";

        //Checks if there are any Pokemon currently in the "favs" array in local storage
        let favs = getFavs();
        if (favs.length > 0) {
            //If there are favourites to display, "Clear" button is set to active and each Pokemon is displayed
            clearButton.classList.add("active");
            favs.forEach((dexNum) => displayImageInFavs(dexNum));
        } else {
            //If there are no favourites to display, "Clear" button is disabled and text is displayed.
            clearButton.classList.remove("active");
            favsContainer.innerHTML = "<p>No favourites to display.</p>";
        }
    }
    
    //Displays the Pokemon with the given dexNumber in the Favourites panel
    async function displayImageInFavs(dexNum) {
        //Creating a new div to contain this specific Pokemon
        let favPokemon = document.createElement("div");
        favPokemon.classList.add("favPokemonContainer");
        
        //Adding the new div to the "#favsContainer" div
        const favsContainer = document.querySelector("#favsContainer");
        favsContainer.appendChild(favPokemon);
        
        //Adding a background div to the new div
        let bkg = document.createElement("div");
        bkg.classList.add("pokemonBackground", "favBackground");
        favPokemon.appendChild(bkg);
        
        //Getting the image for the Pokemon with the given dexNumber
        let pokemonObj = await getPokemon(dexNum);
        let img = document.createElement("img");
        img.src = pokemonObj.imageUrl;
        img.alt = pokemonObj.name;
        img.classList.add("favImage");

        //Adding event listeners to the image
        img.addEventListener("click", () => displayPokemon(pokemonObj.dexNumber));
        img.addEventListener("mouseenter", () => favPokemon.classList.add("highlight"));
        img.addEventListener("mouseleave", () => favPokemon.classList.remove("highlight"));
        
        //Adding the image to the new div
        favPokemon.appendChild(img);
    }

    //Clears the "favs" array in local storage and on the page
    function clearAllFavs() {
        newFavArray = [];
        localStorage.setItem("favs", JSON.stringify(newFavArray));
        updateFavsSection();
    }

});