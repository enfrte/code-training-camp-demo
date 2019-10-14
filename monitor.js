const IFTTT = require('./sensitive.js');
const key = IFTTT.key;

const NodeCouchDb = require('node-couchdb');
const fetch = require('node-fetch');

// couchDB database names
const temperatureDb = "temperature";
const temperatureSettingsDb = "temperature_settings";

const couch = new NodeCouchDb({
  // credentials used for couchDb server admin 
  auth: {
    user: 'admin',
    password: 'password'
  }
});

function getTemperatureSetting() {
    let temperatureSettings;
    return new Promise(function(resolve, reject) {
      couch.get(temperatureSettingsDb, "/_all_docs?descending=true&limit=1&include_docs=true").then(
        function (data, headers, status) {
          temperatureSettings = data.data.rows[0].doc;
          resolve(temperatureSettings);
        },
        function (err) { 
          console.log(err); // do something else
        }
      );
    });
  }

  function getCurrentTemperature() {
    let currentTemperature;
    return new Promise(function(resolve, reject) {
      couch.get(temperatureDb, "/_all_docs?descending=true&limit=1&include_docs=true").then(
        function (data, headers, status) {
          currentTemperature = data.data.rows[0].doc.temperatureValue;
          resolve(currentTemperature);
        },
        function (err) { 
          console.log(err); // do something else
        }
      );
    });
  }

  async function checkTemperatureRange() {
    try {
      const temperatureSettings = await getTemperatureSetting();
      const currentTemperature = await getCurrentTemperature();

      if (currentTemperature < temperatureSettings.min_temp || currentTemperature > temperatureSettings.max_temp) {
        console.log('Temp NOT in range!');
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
      else {
        console.log('Temp in range :)')
      }
    } catch(error) {
      console.error('try-catch threw: ', error)
    } 
  }

  // initiate 
  checkTemperatureRange();