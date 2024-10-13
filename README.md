## PlanePal API

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
$title[✈ PlanePal's Bot Stats!]
$addField[Member Count;$get[memberCount]]
$addField[Server Count;$get[serverCount]]
$color[Random]

$let[serverCount;$httpRequest[https://raw.githubusercontent.com/DevJSTAR/planepal-api/refs/heads/main/api/data.json;GET;;serverCount;An error occurred while fetching the PlanePal Server Count!]]
$let[memberCount;$httpRequest[https://raw.githubusercontent.com/DevJSTAR/planepal-api/refs/heads/main/api/data.json;GET;;memberCount;An error occurred while fetching the PlanePal Member Count!]]
`
});
```
