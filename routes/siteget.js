
const express = require("express");
const router = express.Router();
const sql = require("mssql");
var cors = require("cors");
var bodyParser = require('body-parser');
const { json } = require("body-parser");
const app = express();
var moment = require('moment-timezone');
const whitelist = [
  'http://192.168.2.39',
  'http://119.110.245.68:5000',
  'http://localhost',
  'http://localhost:5000',
  'http://localhost:4200',
  'http://localhost:51367',
  '*.4200',
  '*.*'
]
var corsOptions = {
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
router.get('/', (req, res) => {
  res.send('Site Ok')
});
let date_ob = new Date();
let cashquery = new sql.Request();
router.get('/items', (req, res) => {
  const result = cashquery.query(`SELECT Dept_ID, Item_No, Status, ItemDescription, IBU, Item_Category_Code, Sitestock, Type, Budget, Range, LastModify
FROM  SAMCOS.dbo.ItemsUse WHERE  (Dept_ID = '61830-1-04989')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
    // res.send(recordset);
  });
  // console.log(result)
});
router.post('/items', (req, res) => {
  var deptid = req.body.deptid;
  const result = cashquery.query(`SELECT Dept_ID, Item_No, Status, ItemDescription, IBU, Item_Category_Code, Sitestock, Type, Budget, Range, LastModify
FROM  SAMCOS.dbo.ItemsUse WHERE  (Dept_ID = N'${deptid}')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length == 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
    // res.send(recordset);
  });
  // console.log(result)
});
router.post('/userlogin', (req, res) => {
  var user = req.body.user;
  var password = req.body.password;
  let strsql = `SELECT        Emp_ID, Emp_Name, Pass, Dept_ID, Dept_Name, Emp_Type, Emp_Status, user_type
    FROM            SAMCOS.dbo.Users
    WHERE        (Emp_ID = N'${user}') AND (Pass = N'${password}')`

  cashquery.query(strsql, (err, results) => {
   // console.log(results.recordset.length)
    if (results.recordset.length === 0) {
      //console.log('email empty')
      res.json({ datarow: 0, detail: 'empty' })
    } else {
      res.json({ datarow: results.recordset, detail: 'success' })
      //  console.log(results.recordset)
    }
  })
});
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
router.post('/postitems', (req, res) => {
  var deptid = req.body.deptid;
  var items = req.body.items;
  var user = req.body.user;
  var name = req.body.name;
  var Request_No = generate(4)
  var Refid = req.body.month + "-" + req.body.year;
  let date_ob = new Date();
  var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
  var tim = t.split("+", 2)
  var id = deptid + '-' + date_ob.getFullYear() + '' + ("0" + (date_ob.getMonth() + 1)).slice(-2) + '' + ("0" + date_ob.getDate()).slice(-2) + '' + Request_No;
  //console.log(id)
  var objuse = JSON.parse(items)
  var comit = 0;
  cashquery.query(`insert into SAMCOS.dbo.Requests (Request_No,Refid,Department_No,Date_Log,UserRequest,Status,Doc_Type,LastUpdate,LotNumber,UserRequestName) 
    values ('${id}','${Refid}','${deptid}','${tim[0]}','${user}','1','1','${tim[0]}','${Request_No}',N'${name}')`, (err, result) => {
    if (result.rowsAffected == 1) {

      for (var i = 0; i < objuse.length; i++) {
        var stingtime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        var it = objuse[i].item;
        var qty = objuse[i].Qty;
        const res = cashquery.query(`insert into SAMCOS.dbo.Requestsdetails (Request_No,Department_No,Item_No,Date_Log,Quatity,refid,Doc_Type,Status) 
          values ('${id}','${deptid}','${it}','${stingtime}','${qty}','${Refid}','1','R')`, (err, result) => {
          if (result.rowsAffected == 1) {
            comit++
          }
        })
      }

      res.json({ 'results': `success`, 'requestNo': `${id}` })
    } else {
      res.json({ 'results': `error` })
    }
  })
});
router.post('/posted', (req, res) => {
  var userid = req.body.userid;
  cashquery.query(`SELECT        Request_No, Refid, Department_No, Date_Log, UserRequest, Status, Doc_Type, LastUpdate, Department_name, Job
 FROM            SAMCOS.dbo.V_requestmonthly
 WHERE        (Status <> N'5') AND (UserRequest = N'${userid}')
order by LastUpdate desc `, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});

router.post('/requestDetail', (req, res) => {
  var requestNo = req.body.requestNo;
  cashquery.query(`SELECT  Request_No, Item_No, Quatity_send_Site, Quatity, ItemDescription, 
 Item_Unit_Cost, Item_Group, Department_No, Budget, Doc_Type,Item_Base_Unit as baseunit
 FROM            SAMCOS.dbo.V_Requestsdetails
 WHERE        (Request_No = '${requestNo}')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/monthlyrequestDetails', (req, res) => {
  var Refid = req.body.Request_No;
  cashquery.query(`SELECT Request_No, Item_No, Quatity_send_Site, Quatity, ItemDescription, Item_Unit_Cost, Item_Group, Department_No, Budget, Doc_Type, Item_Base_Unit, Department_name, Job
 FROM   SAMCOS.dbo.V_Requestsdetails
 WHERE (Request_No IN(SELECT Request_No FROM  SAMCOS.dbo.Requests WHERE (Status = '1') AND (Request_No = '${Refid}')))`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/monthlyrequest', (req, res) => {
  var Refid = req.body.Refid;
  cashquery.query(`SELECT     Request_No, Refid, Department_No, Date_Log, UserRequest, Status, Doc_Type, LastUpdate, operate, LotNumber, Department_name, Job, customer_type, UserRequestName
 FROM            SAMCOS.dbo.V_monthlyRequest
 WHERE        (Status = '1') `, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ datarow: recordset.recordset, results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.get('/status2', (req, res) => {

  cashquery.query(`SELECT  Request_No, Refid, Department_No, Date_Log, UserRequest, Status, Doc_Type, LastUpdate, operate, LotNumber, Department_name, Job, customer_type, UserRequestName
 FROM            SAMCOS.dbo.V_monthlyRequest
 WHERE        (Status = '2') `, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/mydepartment', (req, res) => {
  var userid = req.body.userid;
  cashquery.query(`SELECT        Emp_ID, Dept_ID, Dept_Name, Active_Status, Department_name, Job, customer_type
 FROM            SAMCOS.dbo.V_line_department
 WHERE        (Emp_ID = '${userid}')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/checklanding', (req, res) => {
  var userid = req.body.userid;
  cashquery.query(`SELECT        COUNT(Dept_ID) AS cdept
 FROM           SAMCOS.dbo.UserDeptmanage
 WHERE        (Emp_ID = '${userid}')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/setstatus2', async (req, res) => {
  var rqno = req.body.rqno;
  var operate = req.body.operate;
  var status = req.body.status;
  //console.log(rqno)
  var arr = await generatearray(rqno);
  var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
  var tim = t.split("+", 2)
  cashquery.query(`update SAMCOS.dbo.Requests set Status = '${status}',LastUpdate='${tim[0]}',operate='${operate}' where Request_No in(${arr}) `).then(result => {
    if (result.rowsAffected[0] > 0) {
      res.json({ datarow: result.rowsAffected[0], results: 'success' })
    } else {
      res.json({ results: `error` })
    }
  })

});

router.post('/setstatus3', async (req, res) => {
  var rqno = req.body.rqno;
  var operate = req.body.operate;
  var status = req.body.status;
  //console.log(rqno)
  var arr = await generatearray(rqno);
  var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
  var tim = t.split("+", 2)
  cashquery.query(`update SAMCOS.dbo.Requests set Status = '${status}',LastUpdate='${tim[0]}',operate='${operate}' where Request_No in(${arr}) `).then(result => {
    if (result.rowsAffected[0] > 0) {
      cashquery.query(`SELECT Request_No, Item_No, ItemDescription,Quatity, Item_Base_Unit, Item_Group, Department_No,Department_name,Job
      FROM            SAMCOS.dbo.V_Requestsdetails 
      WHERE        (Request_No IN (${arr})) order by Request_No`, (err, recordset) => {
        res.json({ datarow: recordset.recordset, results: 'success' })
      })
    } else {
      res.json({ results: `error` })
    }
  })

});
router.post('/itemsinmonth', async (req, res) => {
  var date = req.body.date;
  // var arr = await generatearray(rqno);
  cashquery.query(`SELECT  Item_No, Item_Description, Qty, Item_Base_Unit
 FROM   SAMCOS.dbo.V_itemInMonth
 WHERE   (refid = '${date}')`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});

router.post('/monthlyrequestexcel', async (req, res) => {
  var rqno = req.body.rqno;
  var arr = await generatearray(rqno);
  cashquery.query(`SELECT Request_No AS Request, Department_No AS [Department No], Department_name AS Department, Job, UserRequest AS Operate,UserRequestName AS [Operation Name], Date_Log AS Date
 FROM            SAMCOS.dbo.V_requestmonthly
 WHERE        (Request_No IN (${arr}))`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});

router.post('/itemssearch', async (req, res) => {
  // var date = req.body.date;
 // console.log('itemssearch')
  cashquery.query(`SELECT Item_No, Item_Description, Item_Base_Unit, Item_Group, Item_Category_Code
 FROM  SAMCOS.dbo.Items`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.get('/itemssearch', async (req, res) => {
  // var date = req.body.date;
 // console.log('itemssearch')
  cashquery.query(`SELECT Item_No, Item_Description, Item_Base_Unit, Item_Group, Item_Category_Code
  FROM  SAMCOS.dbo.Items`, (err, recordset) => {
    if (err) console.log(err)
    if (recordset.recordset.length === 0)
      res.json({ results: `error` })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/postoutofbudget', (req, res) => {
  var deptid = req.body.deptid;
  var items = req.body.items;
  var user = req.body.user;
  var name = req.body.name;
  var Request_No = generate(4)
  var Refid = req.body.month + "-" + req.body.year;
  let date_ob = new Date();
  var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
  var tim = t.split("+", 2)
  var id = deptid + '-' + date_ob.getFullYear() + '' + ("0" + (date_ob.getMonth() + 1)).slice(-2) + '' + ("0" + date_ob.getDate()).slice(-2) + '' + Request_No;
  //console.log(id)
  var objuse = JSON.parse(items)
  var comit = 0;
  cashquery.query(`insert into SAMCOS.dbo.Requests (Request_No,Refid,Department_No,Date_Log,UserRequest,Status,Doc_Type,LastUpdate,LotNumber,UserRequestName) 
    values ('${id}','${Refid}','${deptid}','${tim[0]}','${user}','1','2','${tim[0]}','${Request_No}',N'${name}')`, (err, result) => {
    if (result.rowsAffected == 1) {

      for (var i = 0; i < objuse.length; i++) {
        var stingtime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        var it = objuse[i].item;
        var qty = objuse[i].Qty;
        const res = cashquery.query(`insert into SAMCOS.dbo.Requestsdetails (Request_No,Department_No,Item_No,Date_Log,Quatity,refid,Doc_Type,Status) 
          values ('${id}','${deptid}','${it}','${stingtime}','${qty}','${Refid}','2','R')`, (err, result) => {
          if (result.rowsAffected == 1) {
            comit++
          }
        })
      }

      res.json({ 'results': `success`, 'requestNo': `${id}` })
    } else {
      res.json({ 'results': `error` })
    }
  })
});
async function generatearray(array) {
  var add = '';// = [];
  for (let index = 0; index < array.length; index++) {
    if (index == array.length - 1) {
      add = add + "'" + array[index].Request_No + "'";
    } else {
      add = add + "'" + array[index].Request_No + "',";
    }

  }

  return add;
}
module.exports = router;      