# Weather App

This is a simple weather web application that fetches current weather data using the OpenWeatherMap API.

## Features

- Search by city name
- Use browser geolocation to fetch weather for your current location
- Toggle units between Celsius and Fahrenheit
- Displays temperature, humidity, wind, visibility, pressure, sunrise/sunset, and a weather icon
- Recent searches are saved in localStorage

## Setup

1. Sign up for a free API key at OpenWeatherMap: https://openweathermap.org/api
2. Open `weather/script.js` and set the `API_KEY` constant to your API key:

```javascript
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

3. Open `weather/index.html` in your browser. You can simply double-click the file or serve the folder using a local server.

### Run with a simple local server (recommended)

Using Python 3 (if installed):

```bash
cd "c:\Users\Shubham11\OneDrive\Desktop\project1\weather"
python -m http.server 5500
```

Then open http://localhost:5500 in your browser.

Or using Node.js `http-server`:

```bash
npx http-server . -p 5500
```

## Notes

- If the API key is missing or invalid, the app will show a visible notice and disable the search/geolocation buttons until you set a valid key.
 - If the API key is missing or invalid, the app will show a visible notice and disable the search/geolocation buttons until you set a valid key.
 - You can now enter and save your API key directly in the web page using the banner that appears at the top. The key will be stored in your browser's localStorage under `OWM_API_KEY`.
- The app uses the OpenWeatherMap Current Weather API. You can extend it to include forecast data using the One Call API.

## Troubleshooting

- 401 Unauthorized: Your API key is invalid — double-check it on OpenWeatherMap and paste the full key.
- 404 City not found: Check your city name spelling.
- CORS: When opening `index.html` directly in some browsers, fetch requests may be blocked; use a simple local server as shown above.

Enjoy!