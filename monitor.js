/**
 * You would probably want to call this with something like cron-node. 
 * To Do:
 * Add timer check. Only send notification if last one was more than 3600 secs ago. Make another db doc for this. 
 */
const IFTTT = require('./sensitive.js');
/** Contents of sensitive.js
const IFTTT = {
    key: 'your_secret_key',
    ...other sensitive credentials
}
module.exports = IFTTT;
 */
const key = IFTTT.key;

const NodeCouchDb = require('node-couchdb');
const fetch = require('node-fetch');

// couchDB database names
const temperatureDb = "temperature";

const couch = new NodeCouchDb({
  // credentials used for couchDb server admin 
  auth: {
    user: 'admin',
    password: 'password'
  }
});

function getTemperatureSetting() {
    return new Promise(function(resolve, reject) {
      couch.get(temperatureDb, "/_design/settings/_view/range?descending=true&limit=1").then(
        function (data, headers, status) {
          const temperatureSettings = data.data.rows[0].value;
          resolve(temperatureSettings);
        },
        function (err) { 
          console.log('getTemperatureSetting', err); // do something else
        }
      );
    });
  }

  function getCurrentTemperature() {
    return new Promise(function(resolve, reject) {
      couch.get(temperatureDb, "/_design/temperature/_view/get-temperature?descending=true&limit=1").then(
        function (data, headers, status) {
          const currentTemperature = data.data.rows[0].value.temperatureValue;
          resolve(currentTemperature);
        },
        function (err) { 
          console.log('getCurrentTemperature', err); // do something else
        }
      );
    });
  }

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
      //console.log(res)
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
      const temperatureSettings = await getTemperatureSetting();
      const currentTemperature = await getCurrentTemperature();

      if (currentTemperature < temperatureSettings.min_temp || currentTemperature > temperatureSettings.max_temp) {
        console.log('Temp NOT in range!');
        sendIFTTTNotification(currentTemperature);
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