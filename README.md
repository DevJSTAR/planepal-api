# PlanePal API]
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

**Step 1:** Install the `requests` library if you haven't already.
```python
pip install requests
```

**Step 2:** Use the following code to fetch and print PlanePal server and member counts:
```python
import requests
import json
import base64  # Import the base64 module

# API endpoint URL
url = "https://api.github.com/repos/DevJSTAR/planepal-api/contents/api/data.json"

# Function to get the server and member count
def get_plane_pal_data():
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Decoding base64 content using base64.b64decode
        json_content = base64.b64decode(data['content']).decode('utf-8')
        stats = json.loads(json_content)
        print(f"Server Count: {stats['serverCount']}")
        print(f"Member Count: {stats['memberCount']}")
    else:
        print(f"Failed to fetch data: {response.status_code}")

# Fetch and print data
get_plane_pal_data()
```
#### 2. Web Integration (Using Fetch API)

**Step 1:** Create an HTML file (e.g., `index.html`) with the following structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlanePal Stats</title>
</head>
<body>
    <h1>PlanePal Bot Stats</h1>
    <p id="serverCount">Server Count: Loading...</p>
    <p id="memberCount">Member Count: Loading...</p>

    <script>
        // API endpoint URL
        const url = 'https://api.github.com/repos/DevJSTAR/planepal-api/contents/api/data.json';

        // Function to fetch and display data
        async function getPlanePalData() {
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                // Decode base64 content
                const decodedContent = atob(data.content);
                const stats = JSON.parse(decodedContent);

                // Update HTML elements with stats
                document.getElementById('serverCount').innerText = `Server Count: ${stats.serverCount}`;
                document.getElementById('memberCount').innerText = `Member Count: ${stats.memberCount}`;
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('serverCount').innerText = 'Error fetching server count';
                document.getElementById('memberCount').innerText = 'Error fetching member count';
            }
        }

        // Fetch and display data on page load
        getPlanePalData();
    </script>
</body>
</html>
```

**Step 2:** Open the index.html file in a web browser. You should see the server and member counts displayed on the page.

#### 3. Aoi.JS Integration (Using `$httpRequest`)
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
