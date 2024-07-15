document.addEventListener('DOMContentLoaded', () => {
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalDateInput = document.getElementById('historical-date');
    const historicalRatesBtn = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs');

    const apiKey = 'fca_live_nyut5PHLXdOk7D6ivH9DFBc7WXOsmMquOhLmyEHh';
    const currenciesUrl = `https://api.freecurrencyapi.com/v1/currencies?apikey=${apiKey}`;
    const latestUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`;
    const historicalUrl = `https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}`;

    let myHeaders = new Headers();
    myHeaders.append("apikey", apiKey);

    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: myHeaders
    };

    async function fetchCurrencies() {
        const response = await fetch(currenciesUrl, requestOptions);
        const data = await response.json();
        const currencies = Object.keys(data.data);
        currencies.forEach(currency => {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            option1.value = option2.value = currency;
            option1.text = option2.text = currency;
            baseCurrencySelect.add(option1);
            targetCurrencySelect.add(option2);
        });
    }

    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = amountInput.value;

        const response = await fetch(`${latestUrl}&base_currency=${baseCurrency}`, requestOptions);
        const data = await response.json();
        const rate = data.data[targetCurrency];
        const convertedAmount = (amount * rate).toFixed(2);
        convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;
    }

    async function fetchHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = historicalDateInput.value;
        if (!date) {
            historicalRatesContainer.textContent = 'Please enter a valid date.';
            return;
        }

        const historicalApiUrl = `${historicalUrl}&date=${date}&base_currency=${baseCurrency}&currencies=${targetCurrency}`;

        try {
            console.log(`Fetching historical rates from: ${historicalApiUrl}`); // Debugging log
            const response = await fetch(historicalApiUrl, requestOptions);
            const data = await response.json();
            console.log(data); // Debugging log to check the API response

            if (data && data.data && data.data[date] && data.data[date][targetCurrency]) {
                const rate = data.data[date][targetCurrency];
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
            } else {
                historicalRatesContainer.textContent = 'No historical data available for the selected date and currency pair.';
            }
        } catch (error) {
            historicalRatesContainer.textContent = 'Error fetching historical rates.';
            console.error(error); // Debugging log to check errors
        }
    }

    async function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        try {
            const response = await fetch('/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await response.json();
            updateFavoritePairs();
        } catch (error) {
            console.error('Error saving favorite pair:', error);
        }
    }

    async function deleteFavoritePair(baseCurrency, targetCurrency) {
        try {
            const response = await fetch('/favorites', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await response.json();
            updateFavoritePairs();
        } catch (error) {
            console.error('Error deleting favorite pair:', error);
        }
    }

    async function updateFavoritePairs() {
        try {
            const response = await fetch('/favorites');
            const favoritePairs = await response.json();
            favoriteCurrencyPairsDiv.innerHTML = '';
            favoritePairs.forEach(pair => {
                const pairContainer = document.createElement('div');
                pairContainer.classList.add('pair-container');

                const button = document.createElement('button');
                button.textContent = `${pair.baseCurrency}/${pair.targetCurrency}`;
                button.addEventListener('click', () => {
                    baseCurrencySelect.value = pair.baseCurrency;
                    targetCurrencySelect.value = pair.targetCurrency;
                    convertCurrency();
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    deleteFavoritePair(pair.baseCurrency, pair.targetCurrency);
                });

                pairContainer.appendChild(button);
                pairContainer.appendChild(deleteButton);
                favoriteCurrencyPairsDiv.appendChild(pairContainer);
            });
        } catch (error) {
            console.error('Error fetching favorite pairs:', error);
        }
    }

    baseCurrencySelect.addEventListener('change', convertCurrency);
    targetCurrencySelect.addEventListener('change', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);
    historicalRatesBtn.addEventListener('click', fetchHistoricalRates);
    saveFavoriteBtn.addEventListener('click', saveFavoritePair);

    fetchCurrencies().then(convertCurrency);
    updateFavoritePairs();
});
