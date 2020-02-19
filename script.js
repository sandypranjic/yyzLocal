const app = {};

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

app.searchDataSet = function(searchQuery) {
    fetch('./neighbourhood-profiles-2016-csv.json')
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.json().then(function(data) {
            data.forEach(function(item) {
            const population = "Population, 2016";
            const totalIncome = "Total income: Average amount ($)";
            // Unaffordable housing is the percentage of private households spending more than 30 percent of their total household income on shelter costs.
            const unaffordableHousing = "Rate of unaffordable housing"
            const highriseBuilding = "Apartment in a building that has five or more storeys";
            const privateDwellings = "Occupied private dwellings";
            const condo = "Condominium";
            const cleanedSearchQuery = app.cleanData(searchQuery);
            // Age Characteristics:
            const children = "Children (0-14 years)";
            const youth = "Youth (15-24 years)";
            const workingAge = "Working Age (25-54 years)";
            const preRetirement = "Pre-retirement (55-64 years)";
            const seniors = "Seniors (65+ years)";
            if (item.Characteristic === "Neighbourhood Number") {
                for (prop in item) {
                    const cleanedPropData = app.cleanData(prop);
                    if (cleanedPropData === "Weston" && cleanedSearchQuery.includes("Pelham Park") === false && cleanedSearchQuery === "Weston") {
                        console.log(`${prop} exists in this list`);
                    } else if (cleanedPropData.includes(cleanedSearchQuery) && cleanedSearchQuery !== "Weston" || cleanedPropData === cleanedSearchQuery && cleanedSearchQuery !== "Weston") {
                        console.log(`${prop} exists in this list`);
                        data.forEach(function(item) {
                            if (item.Characteristic === population) {
                                app.displayPopulationData(prop, item[prop]);
                                const totalPopulation = item[prop];
                                // Age characteristics:
                                data.forEach(function(item) {
                                    if (item.Characteristic === children) {
                                        app.displayChildrenData(prop, item[prop], totalPopulation);
                                    }
                                    if (item.Characteristic === youth) {
                                        app.displayYouthData(prop, item[prop], totalPopulation);
                                    }
                                    if (item.Characteristic === workingAge) {
                                        app.displayWorkingAgeData(prop, item[prop], totalPopulation);
                                    }
                                    if (item.Characteristic === preRetirement) {
                                        app.displayPreRetirementData(prop, item[prop], totalPopulation);
                                    }
                                    if (item.Characteristic === seniors) {
                                        app.displaySeniorsData(prop, item[prop], totalPopulation);
                                    }
                                })
                            }
                            // Average Income Data
                            if (item.Characteristic === totalIncome) {
                                app.displayIncomeData(prop, item[prop]);
                            }
                            // Rate of Unaffordable Housing Data (Rental)
                            if (item.Characteristic === unaffordableHousing) {
                                app.displayUnaffordableHousingData(prop, item[prop]);
                            }
                            // Data Relating to Dwellings
                            if (item.Characteristic === privateDwellings) {
                                const numberOfPrivateDwellings = item[prop];
                                data.forEach(function(item) {
                                    // Number of Highrise Buildings
                                    if (item.Characteristic.trim() === highriseBuilding) {
                                        app.displayHighriseData(prop, item[prop], numberOfPrivateDwellings);
                                    }
                                    // Number of Condos
                                    if (item.Characteristic.trim() === condo) {
                                        app.displayCondoData(prop, item[prop], numberOfPrivateDwellings);
                                    }
                                })
                            }
                        })
                    }
                }
            }
        });
    });
    }).catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
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
        console.log(selectedOption);
        app.searchDataSet(selectedOption);
    })
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
}

app.displayIncomeData = function(searchQuery, data) {
    console.log(`The average income of ${searchQuery} is $${data}`);
}

app.displayUnaffordableHousingData = function(searchQuery, data) {
    console.log(`The rate of unaffordable rental housing in ${searchQuery} is ${data}%.`);
}

app.displayHighriseData = function(searchQuery, totalHighrises, totalPrivateDwellings) {
    const percentageOfHighrises = app.calculatePercentage(totalHighrises, totalPrivateDwellings);
    console.log(`The total percentage of dwellings that are highrises in ${searchQuery} is ${percentageOfHighrises}%`);
}

app.displayCondoData = function(searchQuery, totalCondos, totalPrivateDwellings) {
    const percentageOfCondos = app.calculatePercentage(totalCondos, totalPrivateDwellings);
    console.log(`The total percentage of dwellings that are condos in ${searchQuery} is ${percentageOfCondos}%`);
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
    app.listenForFormSubmit();
    app.dropDownMenu();
    app.listenForSelectChange();
}

app.init();