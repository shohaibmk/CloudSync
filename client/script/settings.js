document.addEventListener('DOMContentLoaded', () => {
    const domeElementSwitchUnit = document.getElementById('switchUnit');
    const domeElementButtonSave = document.getElementById('buttonSave');
    var temperatureUnit = sessionStorage.getItem('temperatureUnit');

    /**
     * if temperature unit not set set dault to farenheit
     */
    if (temperatureUnit == null) {
        sessionStorage.setItem('temperatureUnit', "F");
        temperatureUnit = "F";
    }

    /**
     * if temperature unit is set to celsius show it on the ui
     */
    if (temperatureUnit == "C") {
        domeElementSwitchUnit.checked = true;
        temperatureUnit = "C";
    }

    /**
     * Temperature unit switch change listener
     */
    domeElementSwitchUnit.addEventListener('change', () => {//switch toggle listener
        if (domeElementSwitchUnit.checked) {
            console.log("Degress celsius");
            temperatureUnit = "C";
        }
        else {
            console.log("Degress Farenheit");
            temperatureUnit = "F";
        }
    });

    /**
     * Save button clcik listener
     */
    domeElementButtonSave.addEventListener('click', () => {//button click listener
        sessionStorage.setItem('temperatureUnit',temperatureUnit);
        window.location.href = "/";
    });
});