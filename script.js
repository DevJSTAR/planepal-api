document.getElementById('fetchData').addEventListener('click', () => {
    fetch('https://DevJSTAR.github.io/PlanePal-API/api/data.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('response').innerText = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            document.getElementById('response').innerText = 'Error: ' + error.message;
        });
});