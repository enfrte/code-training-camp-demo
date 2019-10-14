const NodeCouchDb = require('node-couchdb');

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
        console.log('Temp NOT in range!!!');
  
      }
      else {
        console.log('Temp in range :)');
  
      }
    } catch(error) {
      console.error(error);
    } 
  }

  // initiate 
  checkTemperatureRange();