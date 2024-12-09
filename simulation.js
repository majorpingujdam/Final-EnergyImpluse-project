// Function to calculate the color based on renewable energy percentage
// Purpose: Returns a color code to visually represent the level of renewable energy
function calculateColor(renewablePercentage) {
    if (renewablePercentage >= 50) return "#00ff00"; // Green for high renewable energy (>= 50%)
    if (renewablePercentage >= 30) return "#ffff00"; // Yellow for medium renewable energy (30-49%)
    return "#ff0000"; // Red for low renewable energy (< 30%)
}

// Function to apply the renewable energy and efficiency simulation
// Purpose: Adjusts map circles (boroughs or neighborhoods) based on user input from sliders
function applySimulation() {
    // Retrieve the user inputs from sliders
    const renewableIncrease = parseInt(document.getElementById("renewable-slider").value); // Renewable energy increase
    const efficiencyImprovement = parseInt(document.getElementById("efficiency-slider").value); // Energy efficiency improvement

    // Update the displayed values for sliders
    document.getElementById("renewable-value").innerText = `${renewableIncrease}%`; 
    document.getElementById("efficiency-value").innerText = `${efficiencyImprovement}%`;

    // Calculate the efficiency factor for reducing energy usage
    const efficiencyFactor = 1 - efficiencyImprovement / 200; // Efficiency improvement impacts energy usage (adjustable scaling)

    // Update visual styles and sizes for borough circles
    boroughCircles.forEach((circle, index) => {
        const borough = boroughs[index]; // Get the borough data corresponding to the circle
        const simulatedRenewable = Math.min(borough.renewable + renewableIncrease, 100); // Cap renewable percentage at 100%
        const simulatedUsage = borough.usage * efficiencyFactor; // Adjust energy usage by efficiency factor

        // Update circle styles dynamically based on simulation
        circle.setStyle({
            fillColor: calculateColor(simulatedRenewable), // Update color based on renewable percentage
            color: calculateColor(simulatedRenewable), // Update border color
        });
        circle.setRadius(simulatedUsage / 0.5); // Adjust circle size based on scaled energy usage
    });

    // Update visual styles and sizes for neighborhood circles (only if in neighborhood view)
    if (!isBoroughView) {
        neighborhoodCircles.forEach((circle) => {
            // Find the corresponding neighborhood data
            const neighborhood = boroughs
                .flatMap((b) => b.neighborhoods) // Flatten the array of neighborhoods
                .find((n) => n.name === circle.options.name); // Match by neighborhood name

            // Get the selected year from the year slider
            const year = parseInt(document.getElementById("year-slider").value);

            // Calculate new simulated values for neighborhoods
            const simulatedUsage = neighborhood.yearlyUsage[year] * efficiencyFactor; // Scale usage with efficiency
            const simulatedRenewable = Math.min(neighborhood.renewable + renewableIncrease, 100); // Cap at 100%

            // Update circle styles dynamically based on simulation
            circle.setStyle({
                fillColor: calculateColor(simulatedRenewable), // Update color based on renewable percentage
                color: calculateColor(simulatedRenewable), // Update border color
            });
            circle.setRadius(simulatedUsage / 0.5); // Match borough scaling for smoother transitions
        });
    }
}

// Add event listeners to the sliders to trigger simulation when user input changes
document.getElementById("renewable-slider").addEventListener("input", applySimulation); // For renewable energy slider
document.getElementById("efficiency-slider").addEventListener("input", applySimulation); // For efficiency improvement slider

// Apply the simulation initially to reflect the default slider values
applySimulation();


  