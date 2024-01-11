"use strict";
// Event listener
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-btn");
  searchButton.addEventListener("click", handleSearchClick);
});

function handleSearchClick() {
  //Using DOM API to query and retrieve the value
  const cityName = document.getElementById("city-input").value.trim();

  if (!cityName) {
    alert("Please enter a city name.");
    return;
  }

  // Fetch data for each card.
  fetchDataForWeather(cityName, "weather-card");
  fetchDataForCard(
    cityName,
    "news-card",
    "https://api.coindesk.com/v1/bpi/currentprice.json"
  );
  fetchDataForCard(cityName, "restaurants-card", "https://catfact.ninja/fact");
  fetchEventsFromEventbrite(cityName, "event-card");
  fetchWikipediaData(cityName, "history-card");
}

// Using Fetch API to get data from a third-party API
async function fetchDataForWeather(cityName, cardId) {
  try {
    // const response = await fetch(
    //   `http://localhost:3000/openweather/${encodeURIComponent(cityName)}`
    // );

    const response = await fetch(
      `https://api-proxy-server-y132.onrender.com/openweather/${encodeURIComponent(
        cityName
      )}`
    );

    const data = await response.json();
    displayWeatherData(cityName, cardId, data);
  } catch (error) {
    console.error(`Could not get weather data:`, error);
    document.getElementById(
      cardId
    ).innerHTML = `<h2>${cityName}'s Error</h2><p>Error fetching weather data.</p>`;
  }
}

function displayWeatherData(cityName, cardId, data) {
  const card = document.getElementById(cardId);
  const temp = Math.round(data.main.temp - 273.15);
  const capitalizedCityName = capitalize(cityName);

  // Clear existing content
  card.textContent = "";

  // Creating and appending elements using DOM API
  const titleElement = document.createElement("h2");
  titleElement.textContent = `${capitalizedCityName}'s Weather`;
  card.appendChild(titleElement);

  const tempParagraph = document.createElement("p");
  tempParagraph.textContent = `Temperature: ${temp}°C`;
  card.appendChild(tempParagraph);
}

// Function to save Wikipedia data to localStorage
function saveWikipediaDataToLocalStorage(cityName, data) {
  localStorage.setItem(`wikipediaData_${cityName}`, JSON.stringify(data));
}

// Function to check if Wikipedia data for a city is cached
function isWikipediaDataCached(cityName) {
  return localStorage.getItem(`wikipediaData_${cityName}`) !== null;
}

// Function to get cached Wikipedia data
function getCachedWikipediaData(cityName) {
  const data = localStorage.getItem(`wikipediaData_${cityName}`);
  return JSON.parse(data);
}

async function fetchWikipediaData(cityName, cardId) {
  if (isWikipediaDataCached(cityName)) {
    const cachedData = getCachedWikipediaData(cityName);
    displayWikipediaData(cityName, cardId, cachedData);
    return;
  }

  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch=${encodeURIComponent(
      cityName
    )}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayWikipediaData(cityName, cardId, data);
    saveWikipediaDataToLocalStorage(cityName, data);
  } catch (error) {
    console.error(`Could not get data from Wikipedia:`, error);
    document.getElementById(
      cardId
    ).innerHTML = `<h2>${cityName}'s Wikipedia Error</h2><p>Error fetching data.</p>`;
  }
}

function displayWikipediaData(cityName, cardId, data) {
  const card = document.getElementById(cardId);
  const capitalizedCityName = capitalize(cityName);
  card.textContent = "";
  const titleElement = document.createElement("h2");
  titleElement.textContent = `${capitalizedCityName}'s Wikipedia Results`;
  card.appendChild(titleElement);

  if (data.query && data.query.pages) {
    Object.values(data.query.pages).forEach((page) => {
      const para = document.createElement("p");
      const link = document.createElement("a");
      link.href = `https://en.wikipedia.org/?curid=${page.pageid}`;
      link.textContent = page.title;
      link.target = "_blank";
      para.appendChild(link);
      card.appendChild(para);
    });
  } else {
    const noResults = document.createElement("p");
    noResults.textContent = "No results found.";
    card.appendChild(noResults);
  }
}

async function fetchEventsFromEventbrite(cityName, cardId) {
  const token = "ZM3DUDZUECKNJQXARI4M"; // Your API token

  // const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(
  //   cityName
  // )}&token=${token}`;

  // const apiUrl = `https://www.eventbriteapi.com/v3/users/me?token=${token}`;

  // const apiUrl = "http://localhost:3000/eventbrite";
  const apiUrl = "https://api-proxy-server-y132.onrender.com/eventbrite";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayEventbriteData(cityName, cardId, data);
  } catch (error) {
    console.error(`Could not get Eventbrite data:`, error);
    document.getElementById(
      cardId
    ).innerHTML = `<h2>${cityName}'s Eventbrite Error</h2><p>Error fetching event data.</p>`;
  }
}

function displayEventbriteData(cityName, cardId, data) {
  const card = document.getElementById(cardId);
  const capitalizedCityName = capitalize(cityName);
  card.textContent = "";

  const titleElement = document.createElement("h2");
  titleElement.textContent = `${capitalizedCityName}'s Event`;
  card.appendChild(titleElement);

  if (data.events && data.events.length > 0) {
    data.events.forEach((event) => {
      const eventParagraph = document.createElement("p");
      eventParagraph.textContent = `Event: ${event.name.text}`;
      card.appendChild(eventParagraph);
    });
  } else {
    const noResults = document.createElement("p");
    noResults.textContent = "No events found.";
    card.appendChild(noResults);
  }
}

function fetchDataForCard(cityName, cardId, apiUrl) {
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      displayData(cityName, cardId, data);
    })
    .catch((error) => {
      console.error(`Could not get data from ${apiUrl}:`, error);
      document.getElementById(
        cardId
      ).innerHTML = `<h2>${cityName}'s Error</h2><p>Error fetching data.</p>`;
    });
}

function displayData(cityName, cardId, data) {
  const card = document.getElementById(cardId);
  const capitalizedCityName = capitalize(cityName);

  let content = `<h2>${capitalizedCityName}'s ${capitalize(
    getCategory(cardId)
  )}</h2>`;
  switch (cardId) {
    case "news-card":
      content += `<p>Current Bitcoin price in USD: ${data.bpi.USD.rate}</p>`;
      break;
    case "restaurants-card":
      content += `<p>${data.fact}</p>`;
      break;
    case "event-card":
      content += `<p>Estimated age for the name 'Meelad': ${data.age}</p>`;
      break;
    case "history-card":
      content += `<p>Gender prediction for the name 'Luc': ${data.gender}</p>`;
      break;
    case "services-card":
      content += `<p>Nationality prediction for the name 'Nathaniel': ${
        data.country && data.country.length > 0
          ? data.country[0].country_id
          : "Unknown"
      }</p>`;
      break;
  }
  card.innerHTML = content;
}

function getCategory(cardId) {
  switch (cardId) {
    case "weather-card":
      return "Weather";
    case "news-card":
      return "Bitcoin Price";
    case "restaurants-card":
      return "Cat Fact";
    case "event-card":
      return "Age Prediction";
    case "history-card":
      return "Gender Prediction";
    case "services-card":
      return "Nationality Prediction";
    default:
      return "Info";
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
