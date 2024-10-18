const forecastTable = document.getElementById('forecastTable');
const paginationContainer = document.getElementById('pagination');
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const loader = document.getElementById('loader'); 

const WEATHER_API_KEY = '7ab03c8a20dd9a63ecf269393d4b0adc'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'; 

let currentPage = 1;
let rowsPerPage = 10;
let forecastData = []; 

async function fetchWeatherForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
    try {
        loader.style.display = 'block'; 

        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 200) {
            forecastData = data.list; 
            document.getElementById('cityName').innerText = city; 
            return forecastData; 
        } else {
            alert(`City not found: ${data.message}`);
            document.getElementById('cityName').innerText = ''; 
            return [];
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please check your API key or city name.");
        document.getElementById('cityName').innerText = ''; 
        return [];
    } finally {
        loader.style.display = 'none'; 
    }
}

function displayTableData(data, page) {
    forecastTable.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Temperature (°C)</th>
            <th>Weather</th>
        </tr>
    `;

    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedData = data.slice(start, end);

    if (paginatedData.length === 0) {
        forecastTable.innerHTML += `<tr><td colspan="3">No data available for this city.</td></tr>`;
        return;
    }

    paginatedData.forEach(forecast => {
        const row = `
            <tr>
                <td>${forecast.dt_txt}</td>
                <td>${forecast.main.temp}°C</td>
                <td>${forecast.weather[0].description}</td>
            </tr>
        `;
        forecastTable.innerHTML += row;
    });
}

function setupPagination(data) {
    paginationContainer.innerHTML = '';
    let pageCount = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('pagination-btn');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            displayTableData(data, currentPage);
            setupPagination(data);
        });
        paginationContainer.appendChild(button);
    }
}

function filterAndSortData(filterType) {
    let filteredData;

    switch (filterType) {
        case 'ascending':
            filteredData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
            break;
        case 'rainy':
            filteredData = forecastData.filter(forecast => forecast.weather[0].description.includes('rain'));
            break;
        case 'highest':
            filteredData = [forecastData.reduce((max, forecast) => forecast.main.temp > max.main.temp ? forecast : max)];
            break;
        case 'descending':
            filteredData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
            break;
        default:
            filteredData = forecastData; 
    }

    displayTableData(filteredData, currentPage);
}

async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                if (response.status === 200) {
                    const cityName = data.name; 
                    document.getElementById('cityName').innerText = cityName; 
                    const forecast = await fetchWeatherForecast(cityName); 
                    if (forecast.length > 0) {
                        displayTableData(forecast, currentPage); 
                        setupPagination(forecast); 
                    }
                } else {
                    alert(`Unable to retrieve weather data: ${data.message}`);
                }
            } catch (error) {
                console.error("Error fetching location weather data:", error);
                alert("Error fetching weather data based on your location.");
                document.getElementById('cityName').innerText = ''; 
            }
        }, (error) => {
            alert("Geolocation is not enabled or permission denied.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim(); 
    if (city) {
        currentPage = 1; 
        const data = await fetchWeatherForecast(city);
        if (data.length > 0) {
            displayTableData(data, currentPage);
            setupPagination(data);
        }
    } else {
        alert("Please enter a city name.");
    }
});

document.getElementById('filterAscending').addEventListener('click', () => filterAndSortData('ascending'));
document.getElementById('filterRainy').addEventListener('click', () => filterAndSortData('rainy'));
document.getElementById('filterHighest').addEventListener('click', () => filterAndSortData('highest'));
document.getElementById('filterDescending').addEventListener('click', () => filterAndSortData('descending'));

window.addEventListener('load', getUserLocation);
