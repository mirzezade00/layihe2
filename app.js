const amountInputs = document.querySelectorAll(".amount-input");
const currencyTabs = document.querySelectorAll(".currency-tabs button");
const conversionRates = document.querySelectorAll(".conversion-rate");

let fromCurrency = "RUB";
let toCurrency = "USD";
let exchangeRates = {};
let activeInput = "left";

let errorMessage = document.createElement("div");

function showOfflineMessage() {
    if (!document.body.contains(errorMessage)) {
        errorMessage.textContent = "İnternet bağlantisi yoxdur";
        errorMessage.style.color = "white";
        errorMessage.style.backgroundColor = "red";
        errorMessage.style.padding = "10px";
        errorMessage.style.textAlign = "center";
        errorMessage.style.position = "fixed";
        errorMessage.style.left = "0";
        errorMessage.style.bottom = "0";
        errorMessage.style.width = "100%";
        document.body.appendChild(errorMessage);
    }
}

function hideOfflineMessage() {
    if (errorMessage.parentElement) {
        errorMessage.parentElement.removeChild(errorMessage);
    }
}

function fetchRates(baseCurrency) {
    if (!navigator.onLine) {
        showOfflineMessage();
        return;
    }

    hideOfflineMessage();

    if (fromCurrency === toCurrency) {
        console.log("Eyni valyuta seçilib.");
        return;
    }

    fetch(`https://v6.exchangerate-api.com/v6/a228e7cea386c6f883108edf/latest/${baseCurrency}`)
        .then(response => response.json())
        .then(data => {
            exchangeRates = data.conversion_rates;
            updateConversion(activeInput);
        })
        .catch(error => {
            console.error("Məlumat alinmadi:", error);
        });
}

function updateConversion(inputSource) {
    if (!navigator.onLine) {
        showOfflineMessage();
        if (fromCurrency !== toCurrency) {
            console.log("Offline rejimdə yalnız eyni valyutalar arasında çevrim mümkündür.");
            return;
        }
    }

    hideOfflineMessage();

    const fromAmount = parseFloat(amountInputs[0].value) || 0;
    const toAmount = parseFloat(amountInputs[1].value) || 0;

    const rate = fromCurrency === toCurrency ? 1 : exchangeRates[toCurrency] || 1;
    const reverseRate = 1 / rate;

    if (inputSource === "left") {
        amountInputs[1].value = parseFloat((fromAmount * rate).toFixed(5));
    } else if (inputSource === "right") {
        amountInputs[0].value = parseFloat((toAmount * reverseRate).toFixed(5));
    }

    conversionRates[0].innerText = `1 ${fromCurrency} = ${parseFloat(rate.toFixed(5))} ${toCurrency}`;
    conversionRates[1].innerText = `1 ${toCurrency} = ${parseFloat(reverseRate.toFixed(5))} ${fromCurrency}`;
}

function inputValidationHandler(event) {
    let value = event.target.value;

    value = value.replace(/[^0-9.,]/g, "");

    value = value.replace(/,/g, ".");

    if (value.split(".").length > 2) {
        value = value.slice(0, -1);
    }

    const parts = value.split(".");
    if (parts.length === 2 && parts[1].length > 5) {
        parts[1] = parts[1].slice(0, 5);
        value = parts.join(".");
    }

    event.target.value = value;
}

amountInputs.forEach(input => {
    input.addEventListener("input", inputValidationHandler);
});

function currencyTabClickHandler() {
    const parentBlock = this.closest(".converter-block");
    const allTabs = parentBlock.querySelectorAll("button");

    allTabs.forEach(tab => tab.classList.remove("active"));
    this.classList.add("active");

    if (parentBlock.querySelector(".block-title").innerText.includes("есть")) {
        fromCurrency = this.innerText;
        fetchRates(fromCurrency);
    } else {
        toCurrency = this.innerText;
        updateConversion(activeInput);
    }
}

function inputChangeHandler(event) {
    activeInput = event.target === amountInputs[0] ? "left" : "right";
    updateConversion(activeInput);
}

currencyTabs.forEach(tab => {
    tab.addEventListener("click", currencyTabClickHandler);
});

amountInputs[0].addEventListener("input", inputChangeHandler);
amountInputs[1].addEventListener("input", inputChangeHandler);

fetchRates(fromCurrency);

window.addEventListener("online", hideOfflineMessage);
window.addEventListener("offline", showOfflineMessage);


const menuIcon = document.querySelector(".menu-icon");
const menu = document.querySelector(".menu");

menuIcon.addEventListener("click", () => {
    menu.classList.toggle("active");
});

document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
        menu.classList.remove("active");
    }
});
