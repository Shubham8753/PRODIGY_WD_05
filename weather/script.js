// API Configuration
// IMPORTANT: You can either set your OpenWeatherMap API key here or enter it at runtime via the page.
// Get a free key at: https://openweathermap.org/api
let API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Units
let currentUnit = 'metric'; // metric for Celsius, imperial for Fahrenheit

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const recentSearches = document.getElementById('recentSearches');
const recentList = document.getElementById('recentList');

// Recent searches from localStorage
let recentSearchesList = JSON.parse(localStorage.getItem('weatherSearches')) || [];

// Demo data (sample OpenWeatherMap-like response) for offline/demo use
const DEMO_DATA = {
    name: 'Sample City',
    sys: { country: 'SC', sunrise: (Date.now()/1000) - 3600, sunset: (Date.now()/1000) + 3600 },
    main: {
        temp: 22.5,
        feels_like: 21.0,
        temp_min: 18.3,
        temp_max: 24.0,
        humidity: 56,
        pressure: 1013
    },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    wind: { speed: 3.5 },
    clouds: { all: 0 },
    visibility: 10000,
    dt: Math.floor(Date.now()/1000),
    rain: { '1h': 0 }
};

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
locationBtn.addEventListener('click', useGeolocation);
celsiusBtn.addEventListener('click', () => changeUnit('metric'));
fahrenheitBtn.addEventListener('click', () => changeUnit('imperial'));

// Search Weather by City Name
function searchWeather() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    fetchWeatherByCity(city);
    searchInput.value = '';
}

// Fetch Weather by City
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        hideError();
        
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please update the API_KEY in script.js');
            } else {
                throw new Error('Unable to fetch weather data');
            }
        }
        
        const data = await response.json();
        addToRecentSearches(data.name);
        displayWeather(data);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

// Fetch Weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        hideError();
        
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data');
        }
        
        const data = await response.json();
        addToRecentSearches(data.name);
        displayWeather(data);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

// Use Geolocation
function useGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            hideLoading();
            showError('Unable to access your location: ' + error.message);
        }
    );
}

// Display Weather Data
function displayWeather(data) {
    try {
        // Current weather info
        const { name, sys, main, weather, wind, clouds, visibility, dt } = data;
        
        // Update location and date
        document.getElementById('locationName').textContent = `${name}, ${sys.country}`;
        document.getElementById('currentDate').textContent = formatDate(dt * 1000);
        
        // Update temperature and description
        document.getElementById('temperature').textContent = Math.round(main.temp) + '°';
        document.getElementById('weatherDescription').textContent = weather[0].main;
        
        // Update weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
        document.getElementById('weatherIcon').src = iconUrl;
        
        // Update weather details
        document.getElementById('humidity').textContent = main.humidity + '%';
        document.getElementById('windSpeed').textContent = wind.speed + ' m/s';
        document.getElementById('visibility').textContent = (visibility / 1000).toFixed(2) + ' km';
        document.getElementById('pressure').textContent = main.pressure + ' hPa';
        document.getElementById('feelsLike').textContent = Math.round(main.feels_like) + '°';
        document.getElementById('precipitation').textContent = (data.rain?.['1h'] || 0) + ' mm';
        document.getElementById('maxTemp').textContent = Math.round(main.temp_max) + '°';
        document.getElementById('minTemp').textContent = Math.round(main.temp_min) + '°';
        
        // Update sunrise and sunset
        document.getElementById('sunrise').textContent = formatTime(sys.sunrise * 1000);
        document.getElementById('sunset').textContent = formatTime(sys.sunset * 1000);
        
        // Update UV Index (estimated based on weather)
        updateUVIndex(weather[0].main, dt);
        
        // Show weather display
        weatherDisplay.style.display = 'block';
        hideLoading();
    } catch (error) {
        showError('Error displaying weather data: ' + error.message);
        hideLoading();
    }
}

// Update UV Index (Estimated)
function updateUVIndex(weatherMain, timestamp) {
    let uvIndex = 5; // Default moderate
    let description = 'Moderate';
    
    // Estimate UV index based on weather condition
    if (weatherMain.includes('Clear')) {
        uvIndex = 8;
        description = 'Very High';
    } else if (weatherMain.includes('Cloud')) {
        uvIndex = 3;
        description = 'Low';
    } else if (weatherMain.includes('Rain') || weatherMain.includes('Storm')) {
        uvIndex = 1;
        description = 'Low';
    }
    
    document.getElementById('uvIndex').textContent = uvIndex;
    document.getElementById('uvDescription').textContent = description;
}

// Change Unit (Celsius/Fahrenheit)
function changeUnit(unit) {
    currentUnit = unit;
    
    // Update button states
    if (unit === 'metric') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
    }
    
    // Re-fetch weather with new unit
    const city = document.getElementById('locationName').textContent.split(',')[0];
    if (city && city !== '--') {
        fetchWeatherByCity(city);
    }
}

// Add to Recent Searches
function addToRecentSearches(city) {
    // Remove if already exists
    recentSearchesList = recentSearchesList.filter(c => c !== city);
    
    // Add to beginning
    recentSearchesList.unshift(city);
    
    // Keep only last 5
    if (recentSearchesList.length > 5) {
        recentSearchesList.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('weatherSearches', JSON.stringify(recentSearchesList));
    
    // Update UI
    updateRecentSearchesUI();
}

// Update Recent Searches UI
function updateRecentSearchesUI() {
    if (recentSearchesList.length === 0) {
        recentSearches.classList.remove('show');
        return;
    }
    
    recentList.innerHTML = '';
    recentSearchesList.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'recent-item';
        btn.textContent = city;
        btn.addEventListener('click', () => fetchWeatherByCity(city));
        recentList.appendChild(btn);
    });
    
    recentSearches.classList.add('show');
}

// Format Date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
}

// Show Loading
function showLoading() {
    loading.style.display = 'block';
}

// Hide Loading
function hideLoading() {
    loading.style.display = 'none';
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherDisplay.style.display = 'none';
}

// Hide Error
function hideError() {
    errorMessage.classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateRecentSearchesUI();
    // Start disabled until we confirm a valid API key
    enableControls(false);
    if (typeof setApiStatus === 'function') setApiStatus('Checking for stored API key...', 'info');
    
    // API key UI handling: allow entering key at runtime and persist to localStorage
    const apiNotice = document.getElementById('apiKeyNotice');
    const apiInput = document.getElementById('apiKeyInput');
    const apiStatus = document.getElementById('apiKeyStatus');
    const saveBtn = document.getElementById('saveApiKeyBtn');
    const clearBtn = document.getElementById('clearApiKeyBtn');

    function setApiStatus(message, type) {
        if (!apiStatus) return;
        apiStatus.textContent = message || '';
        apiStatus.classList.remove('success', 'info');
        if (type === 'success') apiStatus.classList.add('success');
        if (type === 'info') apiStatus.classList.add('info');
    }

    function enableControls(enabled) {
        if (searchBtn) searchBtn.disabled = !enabled;
        if (locationBtn) locationBtn.disabled = !enabled;
        if (celsiusBtn) celsiusBtn.disabled = !enabled;
        if (fahrenheitBtn) fahrenheitBtn.disabled = !enabled;
        if (searchInput) searchInput.disabled = !enabled;
    }

    // Validate an API key by making a lightweight request
    async function validateApiKey(key) {
        try {
            const testUrl = `${BASE_URL}/weather?q=London&appid=${encodeURIComponent(key)}`;
            const resp = await fetch(testUrl);
            if (resp.ok) return true;
            if (resp.status === 401) return false;
            return false;
        } catch (e) {
            console.warn('API key validation error:', e);
            return false;
        }
    }

    function loadStoredKey() {
        try {
            const stored = localStorage.getItem('OWM_API_KEY');
            if (stored && stored.length > 10) {
                // validate stored key before enabling
                return validateApiKey(stored).then(valid => {
                    if (valid) {
                        API_KEY = stored;
                        if (apiNotice) apiNotice.style.display = 'none';
                        if (apiInput) apiInput.value = stored;
                        setApiStatus('', '');
                        enableControls(true);
                        return true;
                    } else {
                        localStorage.removeItem('OWM_API_KEY');
                        if (apiNotice) apiNotice.style.display = 'block';
                        enableControls(false);
                        if (apiInput) { apiInput.value = ''; apiInput.disabled = false; try { apiInput.focus(); } catch(e){} }
                        setApiStatus('Stored API key was invalid and removed.', '');
                        return false;
                    }
                }).catch(err => {
                    console.warn('Error validating stored API key', err);
                        if (apiNotice) apiNotice.style.display = 'block';
                        enableControls(false);
                        if (apiInput) { apiInput.value = ''; apiInput.disabled = false; try { apiInput.focus(); } catch(e){} }
                        setApiStatus('Error validating stored API key.', '');
                    return false;
                });
            }
        } catch (e) {
            console.warn('Could not access localStorage:', e);
        }
        if (apiNotice) apiNotice.style.display = 'block';
        enableControls(false);
        if (apiInput) { apiInput.value = ''; apiInput.disabled = false; try { apiInput.focus(); } catch(e){} }
        setApiStatus('No API key found. Paste your OpenWeatherMap key and click Save.', '');
        return Promise.resolve(false);
    }

    async function saveApiKey() {
        const val = apiInput ? apiInput.value.trim() : '';
        if (!val) {
            setApiStatus('Please enter a valid API key.', '');
            return;
        }
        // Validate key before saving
        try {
            const saveBtnText = saveBtn ? saveBtn.textContent : null;
            if (saveBtn) { saveBtn.textContent = 'Validating...'; saveBtn.disabled = true; }
            const valid = await validateApiKey(val);
            if (!valid) {
                setApiStatus('API key appears invalid. Please check and try again.', '');
                if (saveBtn) { saveBtn.textContent = saveBtnText; saveBtn.disabled = false; }
                return;
            }
            localStorage.setItem('OWM_API_KEY', val);
            API_KEY = val;
            if (apiNotice) apiNotice.style.display = 'none';
            enableControls(true);
            if (saveBtn) { saveBtn.textContent = saveBtnText; saveBtn.disabled = false; }
            setApiStatus('API key saved and validated. You can now search for weather data.', 'success');
            setTimeout(() => setApiStatus('', ''), 4000);
        } catch (e) {
            console.warn('Could not save API key to localStorage:', e);
            if (saveBtn) { saveBtn.disabled = false; }
            setApiStatus('Failed to save API key to localStorage. You can add it directly to script.js.', '');
        }
    }

    function clearApiKey() {
        if (!confirm('Clear stored API key from localStorage?')) return;
        try {
            localStorage.removeItem('OWM_API_KEY');
            API_KEY = 'YOUR_API_KEY_HERE';
            if (apiNotice) apiNotice.style.display = 'block';
            enableControls(false);
            if (apiInput) apiInput.value = '';
            setApiStatus('Stored API key cleared.', 'info');
            setTimeout(() => setApiStatus('', ''), 3000);
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
            setApiStatus('Failed to clear stored API key. You may need to clear it manually.', '');
        }
    }

    // Wire buttons
    if (saveBtn) saveBtn.addEventListener('click', saveApiKey);
    if (clearBtn) clearBtn.addEventListener('click', clearApiKey);
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) demoBtn.addEventListener('click', useDemoData);

    // Load stored key and set initial UI (wait for async validation)
    loadStoredKey().then(valid => {
        if (valid) {
            if (typeof setApiStatus === 'function') setApiStatus('Stored API key is valid.', 'success');
            setTimeout(() => { if (typeof setApiStatus === 'function') setApiStatus('', ''); }, 2500);
        } else {
            if (typeof setApiStatus === 'function') setApiStatus('No valid API key found. Paste your key and click Save.', '');
        }
    });

    // Demo handler
    function useDemoData() {
        try {
            // Show demo data in the UI
            setApiStatus('Loading demo data...', 'info');
            displayWeather(DEMO_DATA);
            // Mark controls as enabled so user can toggle units (keeps demo local)
            enableControls(true);
            setApiStatus('Demo data loaded (no API key required).', 'success');
            setTimeout(() => setApiStatus('', ''), 3000);
        } catch (e) {
            console.warn('Failed to load demo data', e);
            setApiStatus('Failed to load demo data.', '');
        }
    }
});
// End API key UI handling
