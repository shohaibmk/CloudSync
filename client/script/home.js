const domElementImageIconCondition = document.getElementById('iconCondition');
const domElementSpanTemperature = document.getElementById('spanTemperature');
const domElementSpanConditionText = document.getElementById('spanConditionText');
const domElementSpanTemperatureFeelsLike = document.getElementById('spanTemperatureFeelsLike');
const domELementDivForcast = document.getElementById('divForcast');
const domElementSpanPlaceName = document.getElementById('spanPlaceName');
const domElementDivDailyWeather = document.getElementById('divDailyWeather');
const domELementDivWeatherLocationTiles = document.getElementById('divWeatherLocationTiles');
const domElementLoginModal = document.querySelector('#loginModal');
const domElementToast = document.querySelector('#liveToast');
const domElementButtonToastLogin = document.getElementById('buttonToastLogin');
const myModal = new bootstrap.Modal(domElementLoginModal);
const toast = new bootstrap.Toast(domElementToast);
const domeElementModalLoginButton = document.getElementById('login');
var currentURL = window.location.href;

if (currentURL != "http://localhost:3000/") {
    window.location.href = "/";
}

// const domElementDivDailyWeather = document.addEventListener('buttonAdd');
// divDailyWeather
const currentDate = new Date();
// Get the current hour
const currentHour = currentDate.getHours();
// console.log(currentHour);

let userType = "Free";  //variable to set the type or user free or premium
let homeWeatherLocation;
let homeWeatherLocationName;
let tileData;   //object to store loactions added to tiles in storage
let autocomplete;
let temperatureUnit;
let weatherData;

checkAndSetTemperatureUnit();//Check and set the temperature unit
getLocation();//Get users location
loadGoogleMapsScript();// Call the function to load the Google Maps API


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {//Geolocation is not supported by this browser.
    }
}

/**
 * show position after getting location
 */
function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    console.log("Latitude: " + latitude + "\nLongitude: " + longitude);
    getWeatherByLocation(latitude, longitude);
    homeWeatherLocation = {
        lat: latitude,
        lng: longitude
    }
    sessionStorage.setItem("homeWeatherLocation", JSON.stringify(homeWeatherLocation));
    domElementSpanPlaceName.innerText = "My Location";
    homeWeatherLocationName = "My Location";
    sessionStorage.setItem("homeWeatherLocationName", JSON.stringify(homeWeatherLocationName));
}


/**
 * Handle error regarding location
 */
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("location permission denied")
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

/**
 * function to get and set temperature Unit
 */
function checkAndSetTemperatureUnit() {
    temperatureUnit = sessionStorage.getItem('temperatureUnit');
    if (temperatureUnit == null) {
        temperatureUnit = "F";
    }
    console.log("temperatureUnit", temperatureUnit);
}

/**
 * function to get tiles from localstorage or database for premium users and show it on the home page
 */
async function getAndShowTiles() {

    let tileData;
    let locationNames = [];
    let locationCoordinates = [];

    if (userType == "Premium") {//Premium User so get from database
        console.log('tiles of premium user');
        tileData = await getTileDataFromDatabase();
    }
    else {//free user so get from session storage
        console.log('tiles of free user');
        tileData = sessionStorage.getItem('tileData');
    }
    tileData = JSON.parse(tileData);
    console.log("tileData: ", tileData);
    if (tileData != null) {
        showTiles(tileData);
    }
}

/**
 * Function to show tiles on the home page
 */
async function showTiles(tileData) {
    domELementDivWeatherLocationTiles.innerHTML = "";
    locationNames = tileData.locationNames;
    locationCoordinates = tileData.locationCoordinates;
    // console.log("showtiles",locationNames.length);
    // console.log("showtiles",locationCoordinates);
    let name;
    let lng;
    let lat;
    for (var i = 0; i < locationNames.length; i++) {
        name = locationNames[i];
        lat = locationCoordinates[i].lat;
        lng = locationCoordinates[i].lng;
        console.log("\n");
        console.log(name)
        console.log(lat)
        console.log(lng)
        weatherData = await getDailyForcast(lat, lng);

        domELementDivWeatherLocationTiles.appendChild(createTile(name));     //appending the tile to div
    }
}

/**
 * function to get tiles from the database only for premium users
 */
function getTileDataFromDatabase() {
    const requestURl = `http://127.0.0.1:3004/getTileData`;
    return fetch(requestURl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: localStorage.getItem('uid') }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log("in get dailyweather", data);
            //   console.log('response',JSON.parse(data));
            // sessionStorage.setItem('locationNames',JSON.stringify(data.locationNames));
            // sessionStorage.setItem('locationCoordinates',JSON.stringify(data.locationCoordinates));
            // console.log("tiledata",JSON.stringify(data));
            sessionStorage.setItem('tileData', data);
            return data;
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
            throw error; // Optionally rethrow the error for the caller to handle
        });
}

/**
 * function to get users premium status by sending users UID generated by the Firebase
 */
function getPremiumStatus() {
    let isPremiumUser = false;
    if (localStorage.getItem('uid') != null) {//if logged in then check
        const url = 'http://127.0.0.1:3004/isPremiumUser';
        const data = { uid: localStorage.getItem('uid') };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data.result);
                const domElementDropdownUL = document.getElementById('dropdownUL');
                if (data.result) {//is premium user
                    userType = "Premium";
                    getAndShowTiles();                                                              //show tiles on home screen as soon as premium status found
                    isPremiumUser = true;
                    console.log("is premium user:", domElementDropdownUL.innerHTML);
                    html = `<li><span id="dropdownLogout" class="makeButton ps-3">Logout</span>`;
                    domElementDropdownUL.innerHTML = domElementDropdownUL.innerHTML + html;
                    document.getElementById('dropdownLogout').addEventListener('click', () => {//logout button click listener
                        console.log('dropdownLogout clicked');
                        logOut();
                    });
                }
                else {
                    getAndShowTiles();                                                              //show tiles on home screen
                    console.log("not premium user")
                    html = `<li><span id="dropdownGetPremium" class="makeButton ps-3">Get Premium</span></li>`;
                    domElementDropdownUL.innerHTML = domElementDropdownUL.innerHTML + html;
                    html = `<li><span id="dropdownLogout" class="makeButton ps-3">Logout</span>`;
                    domElementDropdownUL.innerHTML = domElementDropdownUL.innerHTML + html;
                    document.getElementById('dropdownGetPremium').addEventListener('click', () => {//Get Premium button click listener
                        console.log('dropdownGetPremium clicked');
                        getPremium();
                    });
                    document.getElementById('dropdownLogout').addEventListener('click', () => {//logout button click listener
                        console.log('dropdownLogout clicked');
                        logOut();
                    });
                }
                document.getElementById('dropdownSetting').addEventListener('click', () => {//settings button clicked listener
                    console.log('dropdownSetting clicked');
                    window.location.href = "/Settings";
                });
                //   window.location.href = "http://localhost:3000/";
                return isPremiumUser;
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

}

/**
 * Function to log user out of its weather app account
 */
function logOut() {
    localStorage.removeItem('uid');
    window.location.reload();
}

/*
Callback to deal autocomplete in the searchbox
*/
function initMap() {
    const input = document.getElementById("searchBox");
    const options = {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "geometry", "icon", "name"],
        strictBounds: false,
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', onPlaceChnaged);
}

/*
Callback to handle place selected in the search box
*/
function onPlaceChnaged() {
    const lat = autocomplete.getPlace().geometry.location.lat();
    const lng = autocomplete.getPlace().geometry.location.lng();

    console.log(lat);
    console.log(lng);

    getWeatherByLocation(lat, lng);

    homeWeatherLocation = {
        lat: lat,
        lng: lng
    }
    sessionStorage.setItem("homeWeatherLocation", JSON.stringify(homeWeatherLocation));

    domElementSpanPlaceName.innerText = autocomplete.getPlace().address_components[0].long_name;     //setting place searched
    homeWeatherLocationName = autocomplete.getPlace().address_components[0].long_name;

    sessionStorage.setItem("homeWeatherLocationName", JSON.stringify(homeWeatherLocationName));

}

function loadGoogleMapsScript() {
    var script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_KEY}`;
    script.async = true;
    document.head.appendChild(script);
}


/**
 * DOMContentLoaded event listener
 */
document.addEventListener('DOMContentLoaded', () => {

    const domElementButtonAdd = document.getElementById('buttonAdd');
    const domeElementButtonMyLocation = document.getElementById('buttonMyLocation');

    sessionStorage.setItem('buyPremium', 0);

    if (localStorage.getItem('uid') == null) {//User not Logged in
        const domElementDropdownUL = document.getElementById('dropdownUL');
        const html = `
        <li><span id="dropdownLogin" class="makeButton ps-3">Login</span></li>
        <li><span id="dropdownSetting" class="makeButton ps-3">Settings</span>
        <li><span id="dropdownGetPremium" class="makeButton ps-3">Get Premium</span></li>
        `;
        domElementDropdownUL.innerHTML = html;
        document.getElementById('dropdownLogin').addEventListener('click', () => {//login button click listener
            console.log('dropdownLogin clicked');
            window.location.href = "/Login";
        });
        document.getElementById('dropdownSetting').addEventListener('click', () => {//setting button click listener
            console.log('dropdownSetting clicked');
            window.location.href = "/Settings";
        });
        document.getElementById('dropdownGetPremium').addEventListener('click', () => {//Get Premium button click listener
            console.log('dropdownGetPremium clicked');
            getPremium();
        });
        getAndShowTiles();
    }
    else {//user Logged in
        document.getElementById('dropdownText').innerHTML = "Logged In";
        const domElementDropdownUL = document.getElementById('dropdownUL');
        var html = `
        <li><span id="dropdownSetting" class="makeButton ps-3">Settings</span>
        `;
        domElementDropdownUL.innerHTML = html;
        getPremiumStatus();//get user status free/premium   
    }


    // var conditionIcon = "";//image of current weather
    // getDailyWeather();

    domElementDivDailyWeather.addEventListener('mouseout', () => {// add button goes invisible if mouse outside div
        domElementButtonAdd.style.display = "none";
    });
    domElementDivDailyWeather.addEventListener('mouseover', () => {//add button visible if mouse in the div
        if (JSON.parse(sessionStorage.getItem('homeWeatherLocationName')) != "My Location") {
            domElementButtonAdd.style.display = "block";
        }
    });

    domElementButtonAdd.addEventListener('click', () => {//if add button clicked add the location to tiles below
        // console.log('clicked');
        addLocationsToTile();
        //         let homeWeatherLocation;
        // let homeWeatherLocationName;


    });

    domElementButtonToastLogin.addEventListener('click', () => {   //get premium button on toast click listener
        getPremium();
    });

    domeElementModalLoginButton.addEventListener('click', () => {//Login button on modal click listener
        window.location.href = "/Login";
    });

    domeElementButtonMyLocation.addEventListener('click',()=>{//click listener for my location button next to search box
        document.getElementById('searchBox').value = "";
        getLocation();
    });
});

/**
 * function to check users interest in buying premium
 */
function getPremium() {
    sessionStorage.setItem('buyPremium', 1);
    if (localStorage.getItem('uid') == null) {
        toast.hide();
        myModal.show();
    } else {
        window.location.href = "/checkout";
    }
}

/**
 * Funtion to add given location to tile below
 */
function addLocationsToTile() {
    // console.log('adding to tile');
    // console.log(homeWeatherLocationName);

    // console.log(homeWeatherLocation);

    let tileData = sessionStorage.getItem('tileData');
    let locationNames = [];
    let locationCoordinates = [];
    let exists = false;

    if (tileData == null) {
        tileData = {}
        console.log('first tile');
    }
    else {
        // console.log('locations found');

        tileData = JSON.parse(tileData);
        locationNames = tileData.locationNames;
        locationCoordinates = tileData.locationCoordinates;

        console.log('not first tile');

        locationCoordinates.forEach(coordinates => {
            if (coordinates.lat == homeWeatherLocation.lat && coordinates.lng == homeWeatherLocation.lng) {
                console.log("already exists")
                exists = true;
            }
        });
    }
    if (!exists) {//does not exist in tile
        locationNames.push(homeWeatherLocationName);
        locationCoordinates.push(homeWeatherLocation);

        tileData['locationNames'] = locationNames;
        tileData['locationCoordinates'] = locationCoordinates;

        console.log("length",)

        if (userType == "Free" && locationNames.length > 2) {//Allowing to only add 2 tiles for free users
            //Show aleart
            console.log("free user cannot add more tiles");
            toast.show();
        }
        else {//add to tile for premium user | Data stored in mongodb
            sessionStorage.setItem('tileData', JSON.stringify(tileData));
            console.log("written to sessionstorage");
            console.log("tile data", JSON.stringify(tileData));
            if (userType == "Premium") {
                console.log('sending data to database');
                const data = {
                    uid: localStorage.getItem('uid'),
                    tileData: JSON.stringify(tileData)
                }
                const url = "http://localhost:3004/tiledata";
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(data => {
                        console.log('POST request successful:', data);
                        // Handle the response data here
                    })
                    .catch(error => {
                        console.error('There was a problem with the POST request:', error);
                    });
            }

            // domELementDivWeatherLocationTiles.appendChild(divTile);


            domELementDivWeatherLocationTiles.appendChild(createTile(homeWeatherLocationName));     //appending the tile to div
        }

        // console.log(tileData)



    }
    else {//exists in tile

    }
}

/**
 * Function to create a tile and return the div (i.e tile) created
 */
function createTile(homeWeatherLocationName) {
    let divTile = document.createElement('div');

    const tileWeatherIcon = "http:" + weatherData.current.condition.icon;
    const tileWeatherCondition = weatherData.current.condition.text;//icon url

    let tileTemperature;

    if (temperatureUnit === "F") {
        tileTemperature = `${convertToWholeNumber(weatherData.current.temp_f)}℉`;
        console.log("tileTemperature", tileTemperature);
    }
    else {
        tileTemperature = `${convertToWholeNumber(weatherData.current.temp_c)}℃`;
    }

    const spanTileTemperatureNode = document.createTextNode(tileTemperature);//temperature node
    const spanTileConditionTextNode = document.createTextNode(tileWeatherCondition);//weather condition node
    const spanTileLocationNameTextNode = document.createTextNode(homeWeatherLocationName);//location name node

    var divLocationName = document.createElement('div');
    var divRow = document.createElement('div');
    var divCol1 = document.createElement('div');
    var divCol2 = document.createElement('div');
    var divcol2row1 = document.createElement('div');
    var divcol2row2 = document.createElement('div');

    var imageTileNode = document.createElement('img');//image node

    divLocationName.classList = "pt-2";
    divLocationName.style = "text-align:center";
    divLocationName.style.width = "max-parent";

    divRow.classList = "d-flex justify-content-around";

    imageTileNode.src = tileWeatherIcon;
    imageTileNode.alt = 'image';
    imageTileNode.style.width = "65px";
    imageTileNode.style.height = "65px";
    imageTileNode.classList = "ms-2";

    divCol2.classList = "d-flex flex-column col";
    divCol2.style = "text-align:center";

    divTile.style.width = "200px";
    divTile.style.height = "max-parent";

    divcol2row1.appendChild(spanTileTemperatureNode);
    divcol2row2.appendChild(spanTileConditionTextNode);

    divLocationName.appendChild(spanTileLocationNameTextNode);

    divCol1.appendChild(imageTileNode);
    divCol2.appendChild(divcol2row1);
    divCol2.appendChild(divcol2row2);

    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);

    divTile.appendChild(divLocationName);
    divTile.appendChild(divRow);

    divTile.classList = "d-flex justify-content-center border border-info rounded flex-column mt-3";

    return divTile;
}

/**
 * Function to get daily forcast
 */
async function getWeatherByLocation(lat, lng) {
    weatherData = await getDailyForcast(lat, lng);
    // console.log(weatherData);
    updateHomeWeather(weatherData);
}

/**
 * Function to get daily forcast based on IP address
 */
async function getWeatherByIp() {
    const weatherData = await getDailyForcastByIp();
    console.log(weatherData);
    updateHomeWeather(weatherData);

}

/*
Function to update the weather on home screen
*/
async function updateHomeWeather(weatherData) {


    const todayWeatherDataHour = weatherData.forecast.forecastday[0].hour;
    const todayWeatherDataDay = weatherData.forecast.forecastday[0].day

    console.log(weatherData);

    let dataHours;

    var conditionIcon = weatherData.current.condition.icon.toString();
    const temperatureFarenheit = weatherData.current.temp_f;
    const temperatureCelsuis = weatherData.current.temp_c;
    const temperatureFarenheitFeelsLike = weatherData.current.feelslike_f;
    const temperatureCelsuisFeelsLike = weatherData.current.feelslike_c;


    const conditionText = weatherData.current.condition.text;
    domElementDivDailyWeather.style = "margin-right: 20%;margin-left: 20%;display: none;background-color:#74B9FF73";
    document.getElementById('divDailyWeatherFake').style.display = "none";
    domElementDivDailyWeather.classList = "border border-info d-flex justify-content-center flex-column p-3 mt-3 rounded";

    /*
        Displaying CUrrent Weather
    */
    conditionIcon = conditionIcon.substring(2,);
    conditionIcon = "http://" + conditionIcon;

    domElementImageIconCondition.classList = "img-thumbnail"
    domElementImageIconCondition.src = conditionIcon;
    if (temperatureUnit === "F") {
        domElementSpanTemperature.innerText = `${convertToWholeNumber(temperatureFarenheit)}℉`;
        domElementSpanTemperatureFeelsLike.innerText = `Feels Like ${convertToWholeNumber(temperatureFarenheitFeelsLike)}℉`;
    }
    else {
        domElementSpanTemperature.innerText = `${convertToWholeNumber(temperatureCelsuis)}℃`;
        temperatureCelsuisFeelsLike.innerText = `${convertToWholeNumber(temperatureCelsuisFeelsLike)}℃`;
    }
    domElementSpanConditionText.innerText = conditionText;

    /*
    Displaying Weather Foracast for the next 12 hours
    */

    domELementDivForcast.style.display = "flex";

    var countHours = 0;

    todayWeatherDataHour.forEach(hour => {
        dataHours = parseInt(hour.time.substring(11, 13));

        if (dataHours > currentHour) {//checking time after current time

            countHours++;

            const domElementSpanForcastTime = document.getElementById(`forcastTime${countHours}`);
            const domElementImageForcastIcon = document.getElementById(`iconForcast${countHours}`);
            const domElementSpanForcastTemperature = document.getElementById(`temperaturForcast${countHours}`);
            const temperatureFarenheit = hour.temp_f;
            const temperatureCelsuis = hour.temp_c;

            const forcastText = hour.condition.text;
            var forcastIcon = hour.condition.icon.toString();

            forcastIcon = forcastIcon.substring(2,);
            forcastIcon = "http://" + forcastIcon;

            domElementSpanForcastTime.innerText = getTimeInFormat(dataHours);
            domElementSpanForcastTime.style = "font-size: smaller;font-variant: unicase;";

            domElementImageForcastIcon.classList = "img-thumbnail borderBlue";
            domElementImageForcastIcon.src = forcastIcon;
            domElementImageForcastIcon.style = "width: 40px;"

            domElementSpanForcastTemperature.style = "font-size: small;font-variant: unicase;";

            if (temperatureUnit === "F") {
                domElementSpanForcastTemperature.innerText = `${convertToWholeNumber(temperatureFarenheit)}℉`;
            }
            else {
                domElementSpanForcastTemperature.innerText = `${convertToWholeNumber(temperatureCelsuis)}℃`;
            }

        }

    });
    if (countHours < 12) {//check if less than 12 hours remaining today
        const tomorrowWeatherDataHour = weatherData.forecast.forecastday[1].hour;
        tomorrowWeatherDataHour.forEach(hour => {
            if (countHours < 12) {

                countHours++;

                dataHours = parseInt(hour.time.substring(11, 13))
                const domElementSpanForcastTime = document.getElementById(`forcastTime${countHours}`);
                const domElementImageForcastIcon = document.getElementById(`iconForcast${countHours}`);
                const domElementSpanForcastTemperature = document.getElementById(`temperaturForcast${countHours}`);
                const temperatureFarenheit = hour.temp_f;
                const temperatureCelsuis = hour.temp_c;

                const forcastText = hour.condition.text;
                var forcastIcon = hour.condition.icon.toString();

                forcastIcon = forcastIcon.substring(2,);
                forcastIcon = "http://" + forcastIcon;

                domElementSpanForcastTime.innerText = getTimeInFormat(dataHours);
                domElementSpanForcastTime.style = "font-size: smaller;font-variant: unicase;";

                domElementImageForcastIcon.classList = "img-thumbnail borderBlue";
                domElementImageForcastIcon.src = forcastIcon;
                domElementImageForcastIcon.style = "width: 40px;"

                domElementSpanForcastTemperature.style = "font-size: small;font-variant: unicase;";
                if (temperatureUnit === "F") {
                    domElementSpanForcastTemperature.innerText = `${convertToWholeNumber(temperatureFarenheit)}℉`;
                }
                else {
                    domElementSpanForcastTemperature.innerText = `${convertToWholeNumber(temperatureCelsuis)}℃`;
                }
            }
        });
    }

}


/*
Function to get daily Forcast by IP address and return a JSON object 
*/
function getDailyForcastByIp() {
    const requestURl = `http://127.0.0.1:3002/getDailyForcastByIp`;
    return fetch(requestURl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
        });
}

/*
Function to get daily Forcast by location and return a JSON object 
*/
function getDailyForcast(lat, lng) {
    const requestURl = `http://127.0.0.1:3002/getDailyForcast?loc=${lat},${lng}`;
    return fetch(requestURl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error making API call:', error.message);
        });
}

/*
function to convert 24 hour time to 12 hour time
*/
function getTimeInFormat(time) {
    switch (time) {
        case 0: return "12 AM";
        case 1: return "1 AM";
        case 2: return "2 AM";
        case 3: return "3 AM";
        case 4: return "4 AM";
        case 5: return "5 AM";
        case 6: return "6 AM";
        case 7: return "7 AM";
        case 8: return "8 AM";
        case 9: return "9 AM";
        case 10: return "10 AM";
        case 11: return "11 AM";
        case 12: return "12 PM";
        case 13: return "1 PM";
        case 14: return "2 PM";
        case 15: return "3 PM";
        case 16: return "4 PM";
        case 17: return "5 PM";
        case 18: return "6 PM";
        case 19: return "7 PM";
        case 20: return "8 PM";
        case 21: return "9 PM";
        case 22: return "10 PM";
        case 23: return "11 PM";
    }
}

/**
 * function to convert numbers to whole numbers
 */
function convertToWholeNumber(fractionalNumber) {
    if (fractionalNumber >= 0.5) {
        return Math.ceil(fractionalNumber);// If the number is 0.5 or above, round up using Math.ceil()
    } else {
        return Math.floor(fractionalNumber);// If the number is below 0.5, round down using Math.floor()
    }
}