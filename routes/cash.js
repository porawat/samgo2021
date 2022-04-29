
const express = require("express");
const router = express.Router();
const sql = require("mssql");
var cors = require("cors");
var bodyParser = require('body-parser')
const app = express();
var whitelist = [
  'http://119.110.245.78:5000',
  'http://localhost:8100',
  'http://localhost',
  'http://localhost:5000',
  'http://127.0.0.1',
  'http://localhost:8080',
  '*.*']
  /*
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
*/
var corsOptions = {}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router.get('/', (req, res) => {
    res.send('Cash Ok')
  });
  let cashquery = new sql.Request();
router.get('/cars', (req, res) => {
  const result = cashquery.query(`SELECT * FROM  cash.dbo.Cars`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
    // res.send(recordset);
  });
 // console.log(result)
});
//router.post('/userlogin', cors(corsOptions), (req, res) => {
router.post('/userlogin', cors(corsOptions), (req, res) => {
   
  var username = req.body.User_ID;
  var password = req.body.Pass_ID;
 // console.log(password);
  let strsql = `SELECT Id, UsernameA, PasswordA, Name
 FROM            cash.dbo.Userpassword
 WHERE        (UsernameA = '${username}') AND (PasswordA = '${password}')`

 cashquery.query(strsql, (err, results) => {
//console.log(results.recordset.length)
    if (results.recordset.length === 0) {
      //console.log('email empty')
      res.json({ datarow:results.length,detail: 'empty'})
    } else {
      res.json({ datarow:results.recordset[0],detail: 'success' })
    }

  })

});

module.exports = router;      