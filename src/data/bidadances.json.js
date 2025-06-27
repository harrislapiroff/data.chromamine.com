/**
 * Fetches historical weather data for a specific date and location
 * @param {Date} date - The date to fetch weather for
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object|null>} Weather data object or null if not available
 */
async function fetchWeatherForDate(date, latitude = 42.3736, longitude = -71.1097) {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0]
    
    // Open-Meteo API for historical weather data
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code&timezone=America/New_York`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn(`Weather data not available for ${dateStr}`)
      return null
    }
    
    const weatherData = await response.json()
    
    if (!weatherData.hourly || weatherData.hourly.time.length === 0) {
      return null
    }
    
    // Get weather for 7 PM (typical dance time) or closest available hour
    const targetHour = 19 // 7 PM
    let weatherIndex = weatherData.hourly.time.findIndex(time => {
      const hour = new Date(time).getHours()
      return hour >= targetHour
    })
    
    // If 7 PM not found, use the last available hour
    if (weatherIndex === -1) {
      weatherIndex = weatherData.hourly.time.length - 1
    }
    
    // Weather code descriptions
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    }
    
    const weatherCode = weatherData.hourly.weather_code[weatherIndex]
    const temperature = weatherData.hourly.temperature_2m[weatherIndex]
    const humidity = weatherData.hourly.relative_humidity_2m[weatherIndex]
    const precipitation = weatherData.hourly.precipitation_probability[weatherIndex]
    const windSpeed = weatherData.hourly.wind_speed_10m[weatherIndex]
    const time = weatherData.hourly.time[weatherIndex]
    
    return {
      temperature: temperature,
      humidity: humidity,
      precipitation_probability: precipitation,
      wind_speed: windSpeed,
      weather_code: weatherCode,
      weather_description: weatherCodes[weatherCode] || 'Unknown',
      time: time,
      date: dateStr
    }
    
  } catch (error) {
    console.warn(`Error fetching weather for ${date.toISOString().split('T')[0]}:`, error.message)
    return null
  }
}

/**
 * Fetches dance data from bidadance.org and returns a list of all dances (upcoming and historical)
 * @returns {Promise<Array>} Array of dance objects with normalized data
 */
async function fetchBidaDances() {
  try {
    // Fetch the dances.js file from bidadance.org
    const response = await fetch('https://www.bidadance.org/dances.js')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const jsContent = await response.text()
    
    // Extract the dance data array from the JavaScript file
    // The data is in the format: e = [ { ... }, { ... } ]
    const arrayMatch = jsContent.match(/e\s*=\s*(\[[\s\S]*?\]);/)
    
    if (!arrayMatch) {
      throw new Error('Could not find dance data array in the JavaScript file')
    }
    
    // The JavaScript array contains unquoted property names and other JS syntax
    // We need to evaluate it as JavaScript, but safely
    const arrayString = arrayMatch[1]
    
    // Create a safe evaluation context
    const dancesArray = (() => {
      // Define a safe context with only what we need
      const safeEval = new Function('return ' + arrayString)
      return safeEval()
    })()
    
    // Process and normalize the dance data
    const processedDances = []
    
    for (const dance of dancesArray) {
      // Convert date array [year, month, day] to Date object
      const date = new Date(dance.date[0], dance.date[1] - 1, dance.date[2])
      
      // Determine if this is a past event
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isPast = date < yesterday
      
      // Fetch weather data for past events (historical weather data)
      let weather = null
      if (isPast) {
        weather = await fetchWeatherForDate(date)
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Normalize the data structure
      const processedDance = {
        date: date,
        dateArray: dance.date, // Keep original array format
        title: dance.title || 'Contra Dance',
        link: dance.link || null,
        html: dance.html || null,
        html_includes_timing: dance.html_includes_timing || false,
        caller: dance.caller || null,
        band: dance.band || null,
        time: dance.time || null,
        lesson_start: dance.lesson_start || null,
        dance_start: dance.dance_start || null,
        dance_end: dance.dance_end || null,
        isPast: isPast,
        isCancelled: dance.title && dance.title.toLowerCase().includes('cancelled'),
        isNoDance: dance.title && dance.title.toLowerCase().includes('no dance'),
        // Add computed fields
        year: dance.date[0],
        month: dance.date[1],
        day: dance.date[2],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        formattedDate: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        // Add weather data
        weather: weather
      }
      
      processedDances.push(processedDance)
    }
    
    return processedDances
    
  } catch (error) {
    console.error('Error fetching BIDA dances:', error)
    throw error
  }
}

const data = await fetchBidaDances()

process.stdout.write(JSON.stringify(data))