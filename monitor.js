/**
 * Monitor checks the temperatue range and sends notifications if needed. 
 * You would probably want to call this with something like cron-node. 
 * To Do:
 * Add timer check. Only send notification if last one was more than 3600 secs ago. Make another db doc for this. 
 */

const fetch = require('node-fetch');
const sensitive = require('./sensitive.js');
const dbCalls = require('./db-calls.js'); // calls to the database
/** Contents of sensitive.js
const IFTTT = {
    key: 'your_secret_key',
}
...other sensitive credentials
module.exports = IFTTT;
 */

const key = sensitive.IFTTT.key;

function sendIFTTTNotification(currentTemperature) {
  const body = { value1: currentTemperature };
      
  fetch('https://maker.ifttt.com/trigger/temp_reading/with/key/' + key, {
    method: 'post',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(function (res) {
    //res.json()
    res.text();
    //console.log(res);
  })
  .then(function (text) {
    console.log(text)
  })
  .catch(function (err) {
    console.log('node-fetch error: ', err)
  });
}

async function checkTemperatureRange() {
  try {
    const temperatureSettings = await dbCalls.getTemperatureSettings();
    const currentTemperature = await dbCalls.getCurrentTemperature();

    if (currentTemperature.temperatureValue < temperatureSettings.min_temp || currentTemperature.temperatureValue > temperatureSettings.max_temp) {
      console.log('Temp NOT in range!');
      sendIFTTTNotification(currentTemperature.temperatureValue);
    }
    else {
      console.log('Temp in range :)')
    }
  } catch(error) {
    console.error('try-catch threw: ', error)
  } 
}

// initiate 
checkTemperatureRange();