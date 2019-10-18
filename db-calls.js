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
        const currentTemperature = data.data.rows[0].value.temperatureValue;
        resolve(currentTemperature);
      },
      function (err) { 
        console.log('getCurrentTemperature', err); // do something else
      }
    );
  });
}

module.exports = { getTemperatureSettings, getCurrentTemperature }