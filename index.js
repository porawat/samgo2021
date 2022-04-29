const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const http = require('http');
const app = express();
var datetime = require('node-datetime');
const bodyParser = require('body-parser');
var jsonxml = require('jsontoxml');
//const bcrypt = require('bcrypt');
var fs = require('fs');
var async = require('async');
//var iconv = require('iconv-lite');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
// var mysql = require('mysql');
// var mysqlDb = mysql.createConnection({
//   host: '192.168.1.10',
//   user: 'remote',
//   password: 'samco@admin',
//   database: 'hrgl'
// });
// mysqlDb.connect();
const whitelist = [
  'http://192.168.2.37',
  'http://192.168.2.39',
  'http://192.168.2.39:5000',
  'http://119.110.245.78',
  'http://119.110.245.78:5000',
  'http://localhost:5000',
  'http://localhost:4200',
  'http://localhost:8100',
  'http://119.110.245.68:*',
]
var data = [];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
module.exports.conn = sql.connect({
  user: 'sa',
  password: 'P@ssw0rd',
  server: '192.168.1.10',
}, function (err) {
  if (err) console.log(err);
  // create Request object
});
let msqury = new sql.Request();
app.get('/', (req, res) => {
  res.send('ok')
});
var site = require('./routes/siteget');
app.use('/site', site);
var cash = require('./routes/cash');
app.use('/cash', cash);
var payslip = require('./routes/payslip');
app.use('/pays', payslip);

var store = require('./routes/store');
app.use('/store', store);
var scm = require('./routes/scm');
app.use('/scm', scm);

app.get('/employ', (req, res) => {
  // query to the database and get the records
  const result = msqury.query(`SELECT TOP(10) * FROM  SAMCOSTORE.dbo.employcenter`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
    // res.send(recordset);
  });
  // console.log(result)
});
app.get('/monthlyreport', (req, res) => {
  // query to the database and get the records
  const result = msqury.query(`SELECT  id, Name, hrm,deptname,temperature,Day, Month, Year, datatimestamp AS DateStamp ,datestamp AS DateTime
  FROM            SAMCOSTORE.dbo.V_by_employee
  ORDER BY Year, Month, Day `, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
    // res.send(recordset);
  });
  // console.log(result)
});
app.get('/monthlyreport2xlm', (req, res) => {

  // query to the database and get the records
  const result = msqury.query(`SELECT  id, Day, Month, Year, temperature, Name, deptname, hrm
  FROM            SAMCOSTORE.dbo.V_by_employee
  ORDER BY Year, Month, Day `, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      var xml = jsonxml(recordset.recordset);
    fs.writeFile("/meeting/xml/x.xml", xml, function (err) {
      if (err) {
        return console.log(err);
      }
      //console.log("The file was saved!");
    });
    res.json(xml)
    // res.send(recordset);
  });
  // console.log(result)
});
app.get('/femploy/:id', cors(corsOptions), (req, res) => {

  var id = req.params.id;
  // query to the database and get the records
  const result = msqury.query(`SELECT * FROM  SAMCOSTORE.dbo.employcenter where empid = ${id}`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `cannot fine ${id}` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
  // console.log(result)
});
app.post('/findempid', cors(corsOptions), (req, res) => {
  var empid = req.body.empid;
  // console.log(empid);
  // res.json({ datarow:'ok',detail: 'success' })

  let strsql = `SELECT * FROM  SAMCOSTORE.dbo.employcenter
 WHERE        (empid = '${empid}')`

  msqury.query(strsql, (err, results) => {
    // console.log(results.recordset.length)
    if (results.recordset.length === 0) {
      //console.log('email empty')
      res.json({ datarow: 0, detail: 'empty' })
    } else {
      res.json({ datarow: results.recordset[0], detail: 'success' })
      //  console.log(results.recordset)
    }
  })
});
app.post('/savejob', cors(corsOptions), (req, res) => {
  var dt = datetime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  var datein = dt.format('Y-m-d');
  var empid = req.body.empid;

  var temperature = req.body.temperature;
  // console.log(empid);
  // console.log(temperature);
  // res.json({ datarow:'ok',detail: 'success' })

  (async () => {
    try {
      const result = await msqury.query(`INSERT INTO SAMCOSTORE.dbo.employtimestamp (empid,temperature,datestamp,datatimestamp)VALUES ('${empid}','${temperature}','${formatted}','${formatted}')`);
      if (result.rowsAffected.length == 1) {
        res.json({ datarow: 'success' })
      }
    } catch (err) {
      console.log(err);
    }
  })();
});
/*
app.post('/getmyData', cors(corsOptions), (req, res) => {
  (async () => {
    try {
        const result = await mysqlDb.query(`SELECT DISTINCT
        sgl.LoadDate
        FROM
        sgl`,function (error, results, fields){
         // console.log(fields)
          if (error) throw error;
          if(results){
         let loadDate = results[0]['LoadDate'];
             mysqlDb.query(`SELECT OrgCode,EmpCode,MoneyDesc,TransAmt,ABS(TransAmt) AS TransNum,LoadDate FROM sgl`,function (error, result, fields){
            
            let numrow=result.length;
            res.json({datarow:result,resut:'success',numrow:numrow,i2_date:loadDate})
        })
          }    
        });
        
    } catch (err) {
      console.log(err);
    }
  })();
});
*/
/*
app.post('/insertmysql', cors(corsOptions), (req, res) => {
  var mon = req.body.month
  var year = req.body.year
  var dt = datetime.create(`${year}-${mon}-1`);
  var formatted = dt.format('Y-m-d H:M:S');
  var datein = dt.format('Y-m-d');
  var datalist = req.body.datalist;
  var numlist = datalist.length;
  let rr = 0;
  (async () => {
    try {
        mysqlDb.query(`DELETE From sgl`, function (error, results, fields) {
        if (error) throw error;
        let promises = [];
        var sql = "INSERT INTO sgl (OrgCode,EmpCode,TransAmt,MoneyDesc,LoadDate)  VALUES ?";
for(i=0;i<datalist.length;i++){
  promises.push([datalist[i]['OrgCode'],datalist[i]['EmpCode'],datalist[i]['TransAmt'],datalist[i]['MoneyDesc'],datein])
}      
         mysqlDb.query(sql, [promises], function(err, result) {
          
          res.json({ 'results': 'success', 'row': result.rowsAffected })
      });     
      })
    } catch (err) {
      console.log(err);
    }
  })();
});
*/
app.listen(5000, () => {
  console.log('server is running port 5000 ...');
});    
