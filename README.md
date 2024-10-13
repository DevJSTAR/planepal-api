## PlanePal API
[![GitHub stars](https://img.shields.io/github/stars/devjstar/planepal-api.svg?style=social&label=Stars&style=flat)](https://github.com/devjstar/planepal-api/stargazers)
[![GitHub license](https://img.shields.io/github/license/devjstar/planepal-api.svg)](https://github.com/devjstar/planepal-api/blob/master/LICENSE)
[![Patreon](https://img.shields.io/badge/Donate-Patreon-orange.svg)](https://www.patreon.com/jstarsdev)
<br>
[![DevServer](https://discord.com/api/guilds/1153672454426861598/widget.png?style=shield)](https://discord.gg/GbvXQXHY6Q)

**PlanePal API** is a lightweight, RESTful API designed to deliver up-to-date information on PlanePal's server and member statistics. This API allows people to seamlessly integrate real-time data about PlanePal's user base into their applications or services.

### Features:
- **Live Server Count**: Get the current number of Discord servers using PlanePal.
- **Live Member Count**: Retrieve the total number of PlanePal members across all servers.
- **Automated Updates**: The API is triggered to update data dynamically whenever a member joins or leaves a server, or whenever the bot itself joins or leaves a server, ensuring real-time accuracy.
- **GitHub Integration**: PlanePal API utilizes GitHub for storing and updating data, providing transparency and easy access to the data files in the repository.

### Use Cases:
- **Bot Dashboard**: Integrate the PlanePal API with a dashboard to provide users or admins a visual overview of server and member stats.
- **Bot Analytics**: Use the API to track PlanePal’s growth and analyze usage trends over time.
- **Server Management**: Admins can monitor server changes and member activity with real-time updates.

---

### How to Integrate PlanePal API

#### 1. **Python Integration** (Using `requests` library)
```python
import requests

# API endpoint URL
url = "https://api.github.com/repos/DevJSTAR/planepal-api/contents/api/data.json"

# Function to get the server and member count
def get_plane_pal_data():
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Decoding base64 content
        json_content = requests.utils.b64decode(data['content']).decode('utf-8')
        stats = json.loads(json_content)
        print(f"Server Count: {stats['serverCount']}")
        print(f"Member Count: {stats['memberCount']}")
    else:
        print(f"Failed to fetch data: {response.status_code}")

# Fetch and print data
get_plane_pal_data()
```
#### 2. JavaScript Integration (Using `fetch` API in Node.js or browser)
```javascript
const fetch = require('node-fetch');  // In Node.js, install using `npm install node-fetch`

const url = 'https://api.github.com/repos/DevJSTAR/planepal-api/contents/api/data.json';

// Function to fetch data from PlanePal API
async function getPlanePalData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Decode base64 content
        const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
        const stats = JSON.parse(decodedContent);

        console.log(`Server Count: ${stats.serverCount}`);
        console.log(`Member Count: ${stats.memberCount}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch and log data
getPlanePalData();
```
#### 4. Aoi.JS Integration (Using `$httpRequest`)
```javascript
<client>.command({
name: "stats",
code: `
$title[:airplane: PlanePal's Bot Stats!]
$addField[Member Count;$get[members]]
$addField[Server Count;$get[servers]]
$color[Random]

$let[servers;$httpRequest[$get[url];GET;;serverCount;An error occurred while fetching the PlanePal Server Count!]]
$let[members;$httpRequest[$get[url];GET;;memberCount;An error occurred while fetching the PlanePal Member Count!]]
$let[url;https://raw.githubusercontent.com/DevJSTAR/planepal-api/refs/heads/main/api/data.json]
`
});
```
