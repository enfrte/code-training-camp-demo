// Functions shared by different files

const sensitive = require('./sensitive.js');
const NodeCouchDb = require('node-couchdb');

// couchDB database names
const temperatureDb = "temperature";

const couch = new NodeCouchDb({
  // credentials used for couchDb server admin 
  auth: {
    user: sensitive.couchDbCreds.user,
    password: sensitive.couchDbCreds.password
  }
});

function getTemperatureSettings() {
  return new Promise(function(resolve, reject) {
    couch.get(temperatureDb, "/_design/settings/_view/range?descending=true&limit=1").then(
      function (data, headers, status) {
        const temperatureSettings = data.data.rows[0].value;
        resolve(temperatureSettings);
      },
      function (err) { 
        console.log('getTemperatureSettings', err); // do something else
      }
    );
  });
}

function getCurrentTemperature() {
  return new Promise(function(resolve, reject) {
    couch.get(temperatureDb, "/_design/temperature/_view/get-temperature?descending=true&limit=1").then(
      function (data, headers, status) {
        const currentTemperature = data.data.rows[0].value;
        resolve(currentTemperature);
      },
      function (err) { 
        console.log('getCurrentTemperature', err); // do something else
      }
    );
  });
}

function getTemperatureHistory() {
  return new Promise(function (resolve, reject) {
    couch.get(temperatureDb, "/_design/temperature/_view/get-temperature?descending=false&limit=20").then(
      function (data, headers, status) {
        const rawData = data.data.rows;

        // chartjs requires labels and data arrays 
        let timestamp = [];
        let temperature = [];

        for(let i = 0, l = rawData.length; i < l; i++) {
          let d = new Date(rawData[i].key);
          let formattedTime = d.getFullYear() +'-'+ d.getMonth() +'-'+ d.getDate() +' '+ d.getHours() +':'+ d.getMinutes() +':'+ d.getSeconds();
          timestamp.push(formattedTime.toString());
          temperature.push(rawData[i].value.temperatureValue);
        }

        const chartJsTemperatureData = {
          labels: timestamp,
          data: temperature
        };
        resolve(chartJsTemperatureData);
      },
      function (err) { 
        console.log('getTemperatureHistory', err); // do something else
      }
    );
  });
}

module.exports = { getTemperatureSettings, getCurrentTemperature, getTemperatureHistory }