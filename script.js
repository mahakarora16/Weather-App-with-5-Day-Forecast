const apiKey = "fb038f32ddfdc36b33b503f1126f9c8b";
const historyList = document.getElementById("history-list");

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => {
      document.getElementById("city").value = city;
      getWeather();
    };
    historyList.appendChild(li);
  });
}

function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
}

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  document.querySelector(".container").classList.toggle("dark-mode");
});

async function getWeather() {
  const city = document.getElementById("city").value.trim();
  const resultDiv = document.getElementById("result");

  if (city === "") {
    resultDiv.innerHTML = "❗ Please enter a city name.";
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.city) {
      throw new Error("City not found or API error.");
    }

    let forecastHTML = `<h2>${data.city.name}, ${data.city.country}</h2>`;
    forecastHTML += `<div class="weather-grid">`;

    data.list.forEach((item, i) => {
      if (i % 8 === 0) {
        const icon = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        forecastHTML += `
          <div class="weather-day">
            <h4>${new Date(item.dt * 1000).toLocaleDateString()}</h4>
            <img src="${icon}" alt="Weather Icon">
            <p>${item.weather[0].main}</p>
            <p>${item.main.temp}°C</p>
          </div>
        `;
      }
    });

    forecastHTML += `</div>`;
    resultDiv.innerHTML = forecastHTML;

    const condition = data.list[0].weather[0].main.toLowerCase(); // e.g., clear, clouds, rain
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 6;

    // Update background dynamically based on weather condition
    document.body.className = `${isNight ? 'night' : 'day'} weather-${condition.toLowerCase()}`;

    saveToHistory(city);
    loadHistory();
  } catch (err) {
    resultDiv.innerHTML = `❌ Error: ${err.message}`;
  }
}

loadHistory();
