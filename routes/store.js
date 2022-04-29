
const express = require("express");
const router = express.Router();
const msql = require("mssql");
var mysql = require("mysql");
var cors = require("cors");
var bodyParser = require('body-parser');
const app = express();
var moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const whitelist = [
  'http://192.168.2.39',
  'http://119.110.245.68:5000',
  'http://119.110.245.68:*',
  'http://localhost:4200',
  '*.*'
]
const config = {
  user: 'sa',
  password: 'schimasam',
  server: '192.168.1.18', // You can use 'localhost\\instance' to connect to named instance
  database: 'SAMCO_MASTER',
}
var connection = mysql.createConnection({
  host: "192.168.2.39",
  user: "root",
  password: "samco@admin",
  database: "store_collections"
});
connection.connect();
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.get('/', (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send('store Ok')

});
router.post('/adminlogin', (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var user = req.body.user;
  var password = req.body.password;
  var sql =`SELECT * FROM store_users where (emp_id = '${user}') and (password ='${password}')`;
  //console.log(sql)
  connection.query(sql, function (error, results, fields) {
    if (error) {
      throw error;
    } else {
      //console.log(results)
      if (!results[0]) {
        res.json({ datarow: 0, detail: 'empty' })
      } else {
        res.json({ datarow: results, detail: 'success' })
      }

    }
  })
});
router.post('/newcollection', async (req, res) => {
  var myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  res.setHeader("Content-Type", "application/json");
  var item = req.body.item;
  var operate = req.body.operate;
  var name = operate['emp_name'] + ' ' + operate['emp_lastname']
  var sql = `INSERT INTO  store_collection  (barcode,nodoc,topic,remark,item,dept_send,dept_recive,status,date_create,oper_send,oper_name) values 
  ('${item['barcode']}','${item['nodoc']}','${item['topic']}','${item['remark']}','${item['item']}','${operate['dept_id']}','2','Open','${myDate}','${operate['emp_id']}','${name}')`;
  var ck = await checkdata(item['barcode'])
  //console.log(ck)
  if (ck.length === 0) {
    connection.query(sql, function (error, results) {
      if (error) {
        //console.log(error)
        throw error;
      } else {
        if (results.affectedRows === 1) {
          res.json({ status: 'success' })
        } else {
          res.json({ status: 'error' })
        }
      }
    })
  } else {
    res.json({ status: 'used' })
  }
 
})
router.post('/collectionlist', (req, res) => {
  var operate = req.body.operate;
  var sql = `SELECT * FROM store_collection WHERE store_collection.dept_send = '${operate['dept_id']}' and status ='Open'`
  connection.query(sql, function (error, results, fields) {
    if (error) {
      throw error;
    } else {
      if (results.length === 0) {
        res.json({ status: 'error' });
      } else {
        res.json({ status: 'success', datarow: results });
      }
    }
  })
})
router.post('/deletecollection', (req, res) => {
  var barcode = req.body.barcode;
  var sql = `DELETE  FROM store_collection WHERE store_collection.barcode = '${barcode}' and status ='Open'`
  connection.query(sql, function (error, results, fields) {
    if (error) {
      throw error;
    } else {
     
      if (results.affectedRows === 1) {
        res.json({ status: 'success'});     
      } else {
        res.json({ status: 'error' });
      }
    }
  })
})
router.post('/getcollection', (req, res) => {
  var barcode = req.body.barcode;
  new msql.ConnectionPool(config).connect().then(pool => {
    var xsql = `SELECT  * FROM  SAMCO_MASTER.dbo.VSAMCO_Header WHERE  (DocNo = N'${barcode}')`
    return pool.request().query(xsql)
    }).then(result => {
      let rows = result.recordset
     // console.log(rows)
     res.setHeader('Access-Control-Allow-Origin', '*')
     res.status(200).json({message:"success",datarows:rows});
   // msql.close();
    }).catch(err => {
     res.status(500).send({ message: `${err}`})
    //  msql.close();
    });
})
router.get('/getjobcollectionlist', async (req, res) => {
  var sql = `SELECT * FROM store_collection WHERE  status ='Open'`;
  connection.query(sql, function (error, results, fields) {
    if (error) {
      throw error;
    } else {
      if (results.length === 0) {
        res.json({ status: 'error' });
      } else {
        res.json({ status: 'success', datarow: results });
      }
    }
  })
})
router.get('/reportcollectionlist', async (req, res) => {
  var myDate = moment(new Date()).format("YYYY-MM-DD");
  var sql = `SELECT
  *
  FROM
  store_collection
  WHERE
  date_create BETWEEN '${myDate} 00:00:00' AND '${myDate} 23:59:59' LIMIT 100`;
  connection.query(sql, function (error, results, fields) {
    if (error) {
      throw error;
    } else {
      if (results.length === 0) {
        res.json({ status: 'error' });
      } else {
        res.json({ status: 'success', datarow: results });
      }
    }
  })
})
router.post('/clearcollection', (req, res) => {
  var myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  var operate = req.body.operate;
  var item = req.body.item;
  var barcode = item['barcode'];
  var sql = `UPDATE store_collection SET status='Closed', oper_recive='${operate['emp_id']}', date_recive='${myDate}' 
  WHERE (barcode='${barcode}')  AND (ISNULL(oper_recive)) AND (ISNULL(date_recive)) LIMIT 1`;
  connection.query(sql, function (error, results,fields) {
    if (error) {
      res.status(500).json({ message: `${error}`})
    } else {
     if(results.affectedRows === 1){
      res.status(200).json({status:"success",message:results.message});
     }else{
      res.status(200).json({message:"error",message:results.message});
     }
    }
  })
})
router.post('/rangcollectionlist', (req, res) => {
  var start = req.body.start;
  var stop = req.body.stop;
  var sql = `SELECT * FROM store_collection WHERE DATE(date_create) BETWEEN '${start}' AND '${stop}'`;
  connection.query(sql, function (error, results,fields) {
    if (error) {
      res.status(500).json({ message: `${error}`})
    } else {
      if (results.length === 0) {
        res.json({ status: 'error' });
      } else {
        res.json({ status: 'success', datarow: results });
      }
    }
  })
})
function checkdata(x) {
  var sql = `SELECT * FROM store_collection WHERE barcode = '${x}' or nodoc ='${x}'`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
}
function generate(n) {
  var add = 1,
    max = 12 - add;

  if (n > max) {
    return generate(max) + generate(n - max);
  }
  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically 
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}

module.exports = router;