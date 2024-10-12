// Simulate API response with static data
const fs = require('fs');
const path = require('path');

const data = {
    serverCount: 10, // Simulated data
    memberCount: 100, // Simulated data
    totalFlights: 5, // Simulated data
    money: 500 // Simulated data
};

// Write data to a JSON file
fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));