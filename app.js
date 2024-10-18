document.addEventListener('DOMContentLoaded', function () {
    const cityInput = document.getElementById('cityInput');
    const getWeatherBtn = document.getElementById('getWeatherBtn');
    const weatherDetails = document.getElementById('weatherDetails');

    const defaultCity = 'Islamabad'; 

    getWeather(defaultCity);

    getWeatherBtn.addEventListener('click', function () {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    function getWeather(city) {
        const apiKey = '7ab03c8a20dd9a63ecf269393d4b0adc'; 
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === '200') {
                    updateWeatherData(data);
                    createCharts(data);
                } else {
                    alert('City not found');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Error fetching data. Please try again.');
            });
    }

    function updateWeatherData(data) {
        const city = data.city.name;
        const currentWeather = data.list[0];
        
        const tempC = currentWeather.main.temp; 
        const tempF = (tempC * 9/5) + 32; 
    
        const weatherDetailsText = `
            <strong>City:</strong> ${city}<br>
            <strong>Temperature:</strong> <span id="tempValue">${tempC.toFixed(2)}</span> °C<br>
            <strong>Humidity:</strong> ${currentWeather.main.humidity}%<br>
            <strong>Wind Speed:</strong> ${currentWeather.wind.speed} m/s<br>
            <strong>Weather:</strong> ${currentWeather.weather[0].description.charAt(0).toUpperCase() + currentWeather.weather[0].description.slice(1)}
        `;
        weatherDetails.innerHTML = weatherDetailsText;
    
        const weatherIcon = document.getElementById('weatherIcon');
        weatherIcon.src = `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`; 
    
        setBackground(currentWeather.weather[0].main);
    
        const tempUnitSelect = document.getElementById('tempUnit');
        tempUnitSelect.addEventListener('change', function() {
            if (this.value === 'F') {
                document.getElementById('tempValue').innerText = tempF.toFixed(2); 
                weatherDetails.innerHTML = weatherDetails.innerHTML.replace('°C', '°F');
            } else {
                document.getElementById('tempValue').innerText = tempC.toFixed(2); 
                weatherDetails.innerHTML = weatherDetails.innerHTML.replace('°F', '°C');
            }
        });
    }
    

    function setBackground(weatherCondition) {
        const body = document.body; 
        body.style.transition = "background-image 0.5s ease-in-out"; 

        switch (weatherCondition.toLowerCase()) {
            case 'clear':
                body.style.backgroundImage = "url('images/sunny.jpg')"; 
                break;
            case 'rain':
                body.style.backgroundImage = "url('images/rainy.jpg')"; 
                break;
            case 'clouds':
                body.style.backgroundImage = "url('images/cloudy.jpg')"; 
                break;
            case 'snow':
                body.style.backgroundImage = "url('images/snowy.jpg')"; 
                break;
            default:
                body.style.backgroundImage = "url('images/default.jpg')"; 
                break;
        }

        body.style.backgroundSize = "cover"; 
        body.style.backgroundPosition = "center"; 
    }

    let verticalBarChart, doughnutChart, lineChart;

    function createCharts(data) {
        const temps = data.list.map(item => item.main.temp);
        const dates = data.list.map(item => new Date(item.dt_txt).toLocaleDateString());

        clearCharts();

        const barCtx = document.getElementById('verticalBarChart').getContext('2d');
        verticalBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                animation: {
                    delay: (context) => context.index * 200, 
                    duration: 1000,
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
        const weatherCounts = {};

        data.list.forEach(item => {
            const weatherCondition = item.weather[0].description;
            weatherCounts[weatherCondition] = (weatherCounts[weatherCondition] || 0) + 1;
        });

        const labels = Object.keys(weatherCounts);
        const dataCounts = Object.values(weatherCounts);

        doughnutChart = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weather Conditions',
                    data: dataCounts,
                    backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
                    hoverOffset: 4
                }]
            },
            options: {
                animation: {
                    delay: (context) => context.index * 200, 
                    duration: 1000,
                }
            }
        });

        const lineCtx = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.1
                }]
            },
            options: {
                animation: {
                    onComplete: () => {
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function clearCharts() {
        if (verticalBarChart) verticalBarChart.destroy();
        if (doughnutChart) doughnutChart.destroy();
        if (lineChart) lineChart.destroy();
    }
});
