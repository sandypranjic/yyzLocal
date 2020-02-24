const app = {};

app.listenForStart = function() {
    document.getElementById("startButton").addEventListener("click", function() {
        startButton.classList.add("clicked");
        app.scrollToMain();
    });
}

app.scrollTo = function(element) {
    const body = document.querySelector("body");
    body.style.overflow = "auto";
    window.scroll({
        behavior: 'smooth',
        left: 0,
        top: element.offsetTop,
    });
    setTimeout(function() {
        body.style.overflow = "hidden";
    }, 1700);
}

app.scrollToMain = function() {
    const main = document.querySelector("main");
    setTimeout(function() {
        main.style.display = "block";
        console.log(main);
        app.scrollTo(main);
    }, 1500);
    setTimeout(function() {
        const startButton = document.getElementById("startButton");
        startButton.classList.remove("clicked");
    }, 2000);
}

app.listenForFormSubmit = function() {
    document.getElementById("searchForANeighbourhood").addEventListener("submit", function(event) {
        event.preventDefault();
        const searchQuery = document.getElementById("searchTerm").value;
        if (searchQuery !== "") {
            app.searchDataSet(searchQuery);
        }
        document.getElementById("searchTerm").value = "";
    })
}

app.dataQueries = {
    // Neighbourhood Data:
    population: "Population, 2016",
    totalIncome: "Total income: Average amount ($)",
    unaffordableHousing: "Rate of unaffordable housing",
    highriseBuilding: "Apartment in a building that has five or more storeys",
    privateDwellings: "Occupied private dwellings",
    condo: "Condominium",
    pre1960: "1960 or before",
    // Age Characteristics:
    children: "Children (0-14 years)",
    youth: "Youth (15-24 years)",
    workingAge: "Working Age (25-54 years)",
    preRetirement: "Pre-retirement (55-64 years)",
    seniors: "Seniors (65+ years)",
}

app.searchMatches = [];

app.searchDataSet = function(searchQuery) {
    fetch('./neighbourhood-profiles-2016-csv.json')
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.json().then(function(data) {
            app.searchMatches = [];
            data.forEach(function(item) {
            const cleanedSearchQuery = app.cleanData(searchQuery);
            if (item.Characteristic === "Neighbourhood Number") {
                for (prop in item) {
                    const cleanedPropData = app.cleanData(prop);
                    if (cleanedPropData === "Weston" && cleanedSearchQuery.includes("Pelham Park") === false && cleanedSearchQuery === "Weston") {
                        console.log(`${prop} exists in this list`);
                        app.searchMatches.push(prop);
                    } else if (cleanedPropData.includes(cleanedSearchQuery) && cleanedSearchQuery !== "Weston" || cleanedPropData === cleanedSearchQuery && cleanedSearchQuery !== "Weston") {
                        console.log(`${prop} exists in this list`);
                        app.searchMatches.push(prop);
                    }
                }
                app.checkHowManyMatches(data);
            }
        });
    });
    }).catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
}

app.checkHowManyMatches = function(data) {
    if (app.searchMatches.length === 0) {
        console.log(`Sorry, we couldn't find a match for your search.`);
        app.noResults();
    } else if (app.searchMatches.length === 1) {
        console.log(`There is one match`);
        app.getData(data, app.searchMatches[0]);
    } else if (app.searchMatches.length > 1) {
        console.log(`${app.searchMatches} There are multiple matches.`);
        app.multipleSearchOptions(data);
    }
}

app.noResults = function() {
    const noResultsText = document.getElementById("noResults");
    noResultsText.style.display = "flex";
    app.scrollTo(noResultsText);
    app.listenForTryAgain();
}

app.listenForTryAgain = function() {
    const main = document.querySelector("main");
    main.addEventListener("click", function(event) {
        const clickedElement = event.target;
        if (clickedElement.classList.contains("tryAgain") === true) {
            clickedElement.classList.add("tryAgainClicked");
            const noResults = document.getElementById("noResults");
            const multipleSuggestions = document.getElementById("multipleSuggestions");
            setTimeout(function() {
                app.scrollTo(main);
            }, 1500);
            setTimeout(function() {
                noResults.style.display = "none";
                multipleSuggestions.style.display = "none";
                clickedElement.classList.remove("tryAgainClicked");
            }, 2000);
            setTimeout(function() {
                if (clickedElement.classList.contains("searchAnotherNeighbourhood") === true) {
                    clickedElement.classList.remove("showSearchAnother");
                }
            }, 2000);
        }
    });
}

app.multipleSearchOptions = function(data) {
    console.log(`Did you mean...`);

    const multipleSuggestions = document.getElementById("multipleSuggestions");
    const searchOptionsList = document.getElementById("listOfSuggestions");
    // Go through the list of matches that the app.searchDataSet() function found and pushed into the app.searchMatches array, and create a li node for each one
    app.searchMatches.forEach(function(searchTerm) {
        console.log(searchTerm);
        const searchOption = document.createElement("li");
        searchOption.setAttribute("value", searchTerm);
        searchOption.innerText = searchTerm;
        searchOptionsList.appendChild(searchOption);
    });
    // Listen for the user to click the exit button

    // Listen for the user to click on a search option
    multipleSuggestions.style.display = "flex";
    app.searchBasedOnSuggestions(data);
    app.scrollTo(multipleSuggestions);
    app.listenForTryAgain();
}

// app.exitSearchOptions = function() {
//     const main = document.querySelector("main");
//     main.addEventListener("click", function(event) {
//         if (event.target.id === "exitOptionsButton") {
//             console.log("you clicked the button wowowowow");
//             const selectAnOption = document.getElementById("selectAnOption");
//             selectAnOption.parentNode.removeChild(selectAnOption);
//         }
//     });
// };

app.searchBasedOnSuggestions = function(data) {
    const main = document.querySelector("main");
    main.addEventListener("click", function(event) {
        if (event.target.localName == "li") {
            console.log(`You clicked ${event.target.textContent}!`);
            app.getData(data, event.target.textContent);
        }
    });
}

app.getData = function(data, prop) {
    const neighbourhoodName = document.getElementById("neighbourhoodName");
    neighbourhoodName.innerText = prop;
    data.forEach(function(item) {
        if (item.Characteristic === app.dataQueries.population) {
            app.displayPopulationData(prop, item[prop]);
            const totalPopulation = item[prop];
            data.forEach(function(item) {
                if (item.Characteristic === app.dataQueries.children) {
                    app.displayChildrenData(prop, item[prop], totalPopulation);
                }
                if (item.Characteristic === app.dataQueries.youth) {
                    app.displayYouthData(prop, item[prop], totalPopulation);
                }
                if (item.Characteristic === app.dataQueries.workingAge) {
                    app.displayWorkingAgeData(prop, item[prop], totalPopulation);
                }
                if (item.Characteristic === app.dataQueries.preRetirement) {
                    app.displayPreRetirementData(prop, item[prop], totalPopulation);
                }
                if (item.Characteristic === app.dataQueries.seniors) {
                    app.displaySeniorsData(prop, item[prop], totalPopulation);
                }
            })
        }
        // Average Income Data
        if (item.Characteristic === app.dataQueries.totalIncome) {
            app.displayIncomeData(prop, item[prop]);
        }
        // Rate of Unaffordable Housing Data (Rental)
        if (item.Characteristic === app.dataQueries.unaffordableHousing) {
            app.displayUnaffordableHousingData(prop, item[prop]);
        }
        // Data Relating to Dwellings
        if (item.Characteristic === app.dataQueries.privateDwellings) {
            const numberOfPrivateDwellings = item[prop];
            data.forEach(function(item) {
                // Number of Highrise Buildings
                if (item.Characteristic.trim() === app.dataQueries.highriseBuilding) {
                    app.displayHighriseData(prop, item[prop], numberOfPrivateDwellings);
                }
                // Number of Condos
                if (item.Characteristic.trim() === app.dataQueries.condo) {
                    app.displayCondoData(prop, item[prop], numberOfPrivateDwellings);
                }
                if (item.Characteristic.trim() === app.dataQueries.pre1960) {
                    app.displayPre1960Data(prop, item[prop], numberOfPrivateDwellings);
                }
            })
        }
    })
    setTimeout(function(){
        const results = document.getElementById("results");
        results.style.display = "flex";
        app.scrollTo(results);
    }, 1000);
    setTimeout(function() {
        const searchAnotherNeighbourhood = document.getElementById("searchAnotherNeighbourhood");
        searchAnotherNeighbourhood.classList.add("showSearchAnother");
    }, 2000);
    app.listenForTryAgain();
}

app.dropDownMenu = function() {
    fetch('./neighbourhood-profiles-2016-csv.json')
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.json().then(function(data) {
            data.forEach(function(item) {
            if (item.Characteristic === "Neighbourhood Number") {
                for (prop in item) {
                    if (prop !== "_id" && prop !== "Characteristics" && prop !== "Category" && prop !== "Topic" && prop !== "Data Source" && prop !== "City of Toronto") {
                        const propToString = JSON.stringify(prop);
                        const removeQuotes = propToString.replace(/['"]+/g, '')
                        const optionsMenu = document.getElementById("neighbourhoodOptions");
                        const option = document.createElement('option');
                        option.appendChild(document.createTextNode(removeQuotes));
                        option.value = removeQuotes;
                        optionsMenu.appendChild(option);
                    }
                }
            }
        });
    });
    }).catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
}

app.listenForSelectChange = function() {
    const selectMenu = document.getElementById("neighbourhoodOptions");
    selectMenu.addEventListener("change", function(event) {
        const selectedOption = event.target.value;
        if (selectedOption !== "Choose a Neighbourhood") {
            console.log(selectedOption);
            app.searchDataSet(selectedOption);
        }
    });
}

app.cleanData = function(data) {
    // Convert all data that gets passed into this function into a string:
    const dataString = JSON.stringify(data);
    // Remove quotes from any data that gets passed in
    const removeQuotes = dataString.replace(/['"]+/g, '');
    const removeHyphens = removeQuotes.replace(/-/g, ' ');
    const capitalized = removeHyphens.toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ');
    const cleanedData = capitalized;
    return cleanedData;
}

app.calculatePercentage = function(x, y) {
    const percentage = (parseInt(x.replace(/,/g, "")) / parseInt(y.replace(/,/g, "")) * 100).toFixed(1);
    return percentage;
}

app.displayPopulationData = function(searchQuery, data) {
    console.log(`The population of ${searchQuery} is ${data}`);
    const totalPopulation = document.getElementById("totalPopulation");
    totalPopulation.innerText = data;
}

app.displayIncomeData = function(searchQuery, data) {
    console.log(`The average income of ${searchQuery} is $${data}`);
    const averageIncome = document.getElementById("averageIncome");
    averageIncome.innerText = `$${data}`;
}

app.displayUnaffordableHousingData = function(searchQuery, data) {
    console.log(`The rate of unaffordable rental housing in ${searchQuery} is ${data}%.`);
    const unaffordableHousing = document.getElementById("unaffordableHousing");
    unaffordableHousing.innerText = `${data}%`;
}

app.displayHighriseData = function(searchQuery, totalHighrises, totalPrivateDwellings) {
    const percentageOfHighrises = app.calculatePercentage(totalHighrises, totalPrivateDwellings);
    console.log(`The total percentage of dwellings that are highrises in ${searchQuery} is ${percentageOfHighrises}%`);
}

app.displayPre1960Data = function(searchQuery, totalPre1960, totalPrivateDwellings) {
    const percentageOfPre1960 = app.calculatePercentage(totalPre1960, totalPrivateDwellings);
    console.log(`The percentage of architecture built before 1960 in ${searchQuery} is ${percentageOfPre1960}%.`);
    const pre1960 = document.getElementById("pre1960");
    pre1960.innerText = `${percentageOfPre1960}%`;
}

app.displayCondoData = function(searchQuery, totalCondos, totalPrivateDwellings) {
    const percentageOfCondos = app.calculatePercentage(totalCondos, totalPrivateDwellings);
    console.log(`The total percentage of dwellings that are condos in ${searchQuery} is ${percentageOfCondos}%`);
    const percentageOfCondosText = document.getElementById("percentageOfCondos");
    percentageOfCondosText.innerText = `${percentageOfCondos}%`;
}

app.displayChildrenData = function(searchQuery, numOfChildren, totalPopulation) {
    const percentageOfChildren = app.calculatePercentage(numOfChildren, totalPopulation);
    console.log(`The percentage of children in ${searchQuery} is ${percentageOfChildren}%.`);
}

app.displayYouthData = function(searchQuery, numOfYouth, totalPopulation) {
    const percentageOfYouth = app.calculatePercentage(numOfYouth, totalPopulation);
    console.log(`The percentage of youth in ${searchQuery} is ${percentageOfYouth}%.`);
}

app.displayWorkingAgeData = function(searchQuery, numOfWorkingAge, totalPopulation) {
    const percentageOfWorkingAge = app.calculatePercentage(numOfWorkingAge, totalPopulation);
    console.log(`The percentage of working age in ${searchQuery} is ${percentageOfWorkingAge}%.`);
}

app.displayPreRetirementData = function(searchQuery, numOfPreRetirement, totalPopulation) {
    const percentageOfPreRetirement = app.calculatePercentage(numOfPreRetirement, totalPopulation);
    console.log(`The percentage of pre-retirement age in ${searchQuery} is ${percentageOfPreRetirement}%.`);
}

app.displaySeniorsData = function(searchQuery, numOfSeniors, totalPopulation) {
    const percentageOfSeniors = app.calculatePercentage(numOfSeniors, totalPopulation);
    console.log(`The percentage of seniors in ${searchQuery} is ${percentageOfSeniors}%.`);
}

app.init = function() {
    console.log("init!");
    app.listenForStart();
    app.listenForFormSubmit();
    app.dropDownMenu();
    app.listenForSelectChange();
}

app.init();