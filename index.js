// run `node index` to run the app
// We can monitor the db in https://docs.datadoghq.com/integrations/couch/ for example

const express = require('express');
const path = require('path'); // a core module
const NodeCouchDb = require('node-couchdb');
const dbCalls = require('./db-calls.js');
const sensitive = require('./sensitive.js');

const couch = new NodeCouchDb({ auth: { user: sensitive.couchDbCreds.user, password: sensitive.couchDbCreds.password } }); // credentials used for couchDb server admin

// show available databases  
/*couch.listDatabases().then(
  function(dbs) { console.log(dbs) }, function(err){ console.log(err) }
);*/

const app = express();

// set is an express method - https://expressjs.com/en/4x/api.html#app.set
// You may store any value that you want, but certain names can be used to configure the behavior of the server - like 'view engine'. 
app.set('view engine','ejs'); // Set the template engine.  
app.set('views',path.join(__dirname, 'views')); // A directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array.

// app.use() Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.
app.use(express.static(path.join(__dirname,"public"))); // set a public static directory 
app.use(express.json()); // replaces body-parser
app.use(express.urlencoded({extended:false}));

const temperatureDb = "temperature"; // couchDB database name

// home
app.get('/', function(req, res){ res.render('index') });

// get the user defined temperature settings
app.get('/settings', async function(req, res){
  //res.render('index'); // test page is working
  //console.log(temperatureSettingRange());
  try {
    const temperatureSettings = await dbCalls.getTemperatureSettings();
    res.render('settings', {
      temperature_settings: temperatureSettings
    });
  } catch (error) { console.log('Error temperatureSettingRange', error) }
});

// add a new record
app.post('/settings', function(req, res){
  // the form data 
  const minTemp = req.body.min_temp;
  const maxTemp = req.body.max_temp;
  const settingName = req.body.setting_name;
  const timestamp = new Date().getTime();
  // console.log(minTemp, maxTemp, settingName);

  // Store settings in Couch DB
  couch.uniqid().then(function (ids) {
    const id = ids[0];
    couch.insert(temperatureDb, {
      _id: id,
      type: "temperature_setting",
      min_temp: minTemp,
      max_temp: maxTemp,
      setting_name: settingName,
      timestamp: timestamp
    }).then(
      function (data, headers, status) { res.redirect('/settings') },
      function (err) { res.send(err) });
  });
});

app.get('/monitor', async function(req, res){ 
  //res.render('monitor');
  try {
    const currentTemperature = await dbCalls.getCurrentTemperature();
    const temperatureSettings = await dbCalls.getTemperatureSettings();
    const temperatureHistory = await dbCalls.getTemperatureHistory();
    res.render('monitor', {
      currentTemperature: currentTemperature,
      temperatureSettingsMin: temperatureSettings.min_temp,
      temperatureSettingsMax: temperatureSettings.max_temp,
      temperatureHistory: temperatureHistory
    });
  } catch (error) { console.log('Error getCurrentTemperature', error) } 
});

app.listen(process.env.port || 3000, function(){ console.log('Server started on port: 3000'); });
