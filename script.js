// Initialize the map and set its view
// Using Leaflet.js to create an interactive map centered on New York City
const map = L.map("map").setView([40.7128, -74.006], 11); //locate!!!!!! :d
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  }
).addTo(map);

// Fetch data from the data.json file
// Calls the showBoroughs function to display the initial map view
async function loadData() {
    const response = await fetch("data.json");
    const data = await response.json();
    boroughs = data.boroughs;
    showBoroughs();
  }

  
// Define global state variables 
// These variables store information about boroughs, neighborhoods, and their respective visual representations
let boroughs = [];
let isBoroughView = true;
const boroughCircles = [];
const neighborhoodCircles = [];

// Accessing DOM elements to display energy usage details in the sidebar
const regionName = document.getElementById("region-name");
const regionUsage = document.getElementById("region-usage");
const regionRenewable = document.getElementById("region-renewable");
const yearSlider = document.getElementById("year-slider");
const selectedYearLabel = document.getElementById("selected-year");

// Maintain the state of the last hovered region
// Used to reset details displayed in the sidebar
let lastRegion = {
  name: "--",
  usage: "--",
  renewable: "--",
};

// Add a glowing effect to the map circle
// This visually highlights the circle when the user hovers over it
function addGlowEffect(circle) {
  const layerElement = circle._path; // Access the SVG path of the circle
  if (layerElement) {
    layerElement.classList.add("glowing-circle");
  }
}

// Remove the glowing effect from the map circle
// This is called when the user moves the cursor away from the circle
function removeGlowEffect(circle) {
  const layerElement = circle._path;
  if (layerElement) {
    layerElement.classList.remove("glowing-circle");
  }
}

// Update the sidebar details with the region's information
// This displays the name, energy usage, and renewable percentage of the region
function updateRegionDetails(name, usage, renewable) {
  regionName.querySelector("span").textContent = name || lastRegion.name;
  regionUsage.querySelector("span").textContent =
    usage !== undefined ? usage : lastRegion.usage;
  regionRenewable.querySelector("span").textContent =
    renewable !== undefined ? `${renewable}%` : `${lastRegion.renewable}%`;

  lastRegion = { name, usage, renewable };
}

// Reset the sidebar details to the last hovered region
// This ensures consistent information when no region is currently hovered
function resetRegionDetails() {
  regionName.querySelector("span").textContent = lastRegion.name;
  regionUsage.querySelector("span").textContent = lastRegion.usage;
  regionRenewable.querySelector("span").textContent = `${lastRegion.renewable}%`;
}

// Display boroughs as circles on the map
// Adds interactivity for hovering, clicking, and showing popups
function showBoroughs() {
  boroughs.forEach((borough) => {
    const circle = L.circle(borough.coords, {
      color: "#ff8000",
      fillColor: "#ff8000",
      fillOpacity: 0.6,
      radius: 7000,
    }).addTo(map);

    // Bind a popup to display borough details
    circle.bindPopup(`
      <strong>${borough.name}</strong><br>
      Usage: ${borough.usage} kWh<br>
      Renewable: ${borough.renewable}%
    `);

    // Transition to neighborhoods view when a borough is clicked
    circle.on("click", () => {
      isBoroughView = false;
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) map.removeLayer(layer);
      });
      showNeighborhoods(borough.neighborhoods);
    });

    // Highlight the borough and update sidebar details on hover
    circle.on("mouseover", () => {
      updateRegionDetails(borough.name, borough.usage, borough.renewable);
      addGlowEffect(circle);
    });

    // Remove highlights and reset sidebar details on hover out
    circle.on("mouseout", () => {
      resetRegionDetails();
      removeGlowEffect(circle);
    });

    boroughCircles.push(circle);
  });
}

// Display neighborhoods within a borough as smaller circles on the map
// Adds interactivity similar to boroughs
function showNeighborhoods(neighborhoods) {
  neighborhoods.forEach((neighborhood) => {
    const circle = L.circle(neighborhood.coords, {
      color: "#ff0000",
      fillColor: "#ff0000",
      fillOpacity: 0.6,
      radius: 2000,
    }).addTo(map);

    circle.options.name = neighborhood.name;

    // Bind a popup to display neighborhood details
    circle.bindPopup(`
      <strong>${neighborhood.name}</strong><br>
      Usage: ${neighborhood.yearlyUsage[2023]} kWh<br>
      Renewable: ${neighborhood.renewable}%
    `);

    // Highlight the neighborhood and update sidebar details on hover
    circle.on("mouseover", () => {
      const year = parseInt(yearSlider.value);
      const usage = neighborhood.yearlyUsage[year] || "Data unavailable";
      updateRegionDetails(neighborhood.name, usage, neighborhood.renewable);
      addGlowEffect(circle);
    });

    // Remove highlights and reset sidebar details on hover out
    circle.on("mouseout", () => {
      resetRegionDetails();
      removeGlowEffect(circle);
    });

    neighborhoodCircles.push(circle);
  });

  // Add a back button to return to the borough view
  if (!document.getElementById("back-button")) {
    const backButton = L.control({ position: "topright" });
    backButton.onAdd = () => {
      const div = L.DomUtil.create("div", "back-button");
      div.innerHTML = '<button id="back-button">Back to Borough View</button>';
      div.firstChild.onclick = () => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Circle) map.removeLayer(layer);
        });
        neighborhoodCircles.length = 0;
        showBoroughs();
        map.removeControl(backButton);
      };
      return div;
    };
    backButton.addTo(map);
  }
}

// Update the displayed year when the year slider is adjusted
yearSlider.addEventListener("input", () => {
  const selectedYear = parseInt(yearSlider.value);
  selectedYearLabel.textContent = selectedYear;
});

// Load the data and initialize the map once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadData);
