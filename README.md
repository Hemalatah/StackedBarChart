# StackedBarChart
Create the Stacked Bar Chart and update the chart based on sliding the time and querying the SQLite.

Networking:
  - Tried to deploy on google app engine, but then, larger memory is required for data.db, the deployment was not succeeded.
  - To run the app, Just clone the repo
  - In the terminal, run Python round2.py
  - Go to local host address http://0.0.0.0:5000/ in the browser.

# Tech Stack:
```sh
    Python/Flask
    D3.js
    JavaScript/Jquery
    HTML
    CSS
```
 
 - The Main file here is round2.py
 - When it is on the run mode on the local host http://0.0.0.0:5000/, the time slider is adjusted to query the data between selected timestamps.
 - Once the data is recieved, the default graph displayed is updated with the new data.
 - Thus the responsive chart has been achieved with d3.js and Python(Flask)
