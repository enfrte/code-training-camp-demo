// run `node index` to run the app
// We can monitor the db in https://docs.datadoghq.com/integrations/couch/ for example

const express = require('express');
const path = require('path'); // a core module
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
  // credentials used for couchDb server admin 
  auth: {
    user: 'admin',
    password: 'password'
  }
});

// This just shows you what databases you can access. Outputs to the Node terminal 
/*couch.listDatabases().then(
  function(dbs) {
    console.log(dbs);
  }, 
  function(err){ 
    console.log(err)
  }
);*/

const app = express();

// set is an express method - https://expressjs.com/en/4x/api.html#app.set
// You may store any value that you want, but certain names can be used to configure the behavior of the server - like 'view engine'. 
app.set('view engine','ejs'); // Set the template engine.  
app.set('views',path.join(__dirname, 'views')); // A directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array.

// app.use() Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.
app.use(express.static(path.join(__dirname,"public"))); // set a public static directory 
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// couchDB database names
const temperatureDb = "temperature";
const temperatureSettingsDb = "temperature_settings";

// app index
app.get('/settings', function(req, res){
  //res.render('index'); // test page is working
  /** CouchDB range view
    function(doc) {
      if(doc.timestamp) {
          emit(doc.timestamp, doc);
      }
    }
   */
  couch.get(temperatureSettingsDb, "/_design/settings/_view/range?descending=true&limit=1").then(
    function (data, headers, status) {
      //console.log(data.data.rows); // if you want to see the output in the node console
      // send a data object called temperature_settings to view/index.ejs  
      res.render('settings', {
        temperature_settings: data.data.rows[0].value
      });
    },
    function (err) { 
      console.log(err); // do something else
    }
  );
});

// add a new record
app.post('/settings/update', function(req, res){
  // the form data 
  const minTemp = req.body.min_temp;
  const maxTemp = req.body.max_temp;
  const settingName = req.body.setting_name;
  const timestamp = new Date().getTime();
  // console.log(minTemp, maxTemp, settingName);

  // Store settings in Couch DB
  couch.uniqid().then(function (ids) {
    const id = ids[0];
    couch.insert(temperatureSettingsDb, {
      _id: id,
      min_temp: minTemp,
      max_temp: maxTemp,
      setting_name: settingName,
      timestamp: timestamp
    }).then(
      function (data, headers, status) {
        res.redirect('/settings'); 
      },
      function (err) {
        res.send(err);
      });
  });
});

app.listen(3000, function(){ console.log('Server started on port: 3000'); });
