const express = require("express");
const router = express.Router();
const sql = require("mssql");
var cors = require("cors");
var bodyParser = require('body-parser');
const { json } = require("body-parser");
const app = express();
var moment = require('moment-timezone');
const bcrypt = require('bcrypt');
var datetime = require('node-datetime');
var dt = datetime.create();
const whitelist = [
  'http://192.168.2.39:5000',
  'http://119.110.245.78',
  'http://119.110.245.78:5000',
  'http://192.168.1.10',
  'http://localhost',
  'http://localhost:5000',
  'http://localhost:8100',
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
var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let scm = new sql.Request();
router.get('/', (req, res) => {
  res.send('scm Ok')
});
router.get('/getbanklist', (req, res) => {
  var $sql = "SELECT TOP (100) PERCENT Id AS ID, Codebank, Namebank, Mark FROM cash.dbo.BankList ORDER BY Id";
  scm.query($sql, (err, rs) => {
    //console.dir(rs)
    var rows = rs.rowsAffected[0];
    if (rows > 0) {
      res.json({ datarow: rs.recordset, results: 'success', numrow: `${rows}` })
    } else {
      res.json({ results: 'error', numrow: `${rows}` })
    }
  })
})
router.post('/getbanksakalist', (req, res) => {
  var Codebank = req.body.Codebank;
  var $Namebank = req.body.Namebank;
  var $ID = req.body.ID;
  var $sql = `SELECT Id, Codebank, Namebank, Codesaka, Namesaka, Mark, Userrec, Saka FROM cash.dbo.Banksaka WHERE  (Codebank = '${Codebank}') AND (Mark = 'on') `;
  scm.query($sql, (err, rs) => {
    // res.send(rs.recordset)
    var rows = rs.recordset.length;
    if (rows > 0) {
      res.json({ datarow: rs.recordset, results: 'success', numrow: `${rows}` })
    } else {
      var $a = { "Id": $ID, "Codebank": Codebank, "Codesaka": $ID, "Namesaka": $Namebank };
      var $arr = [];
      $arr.push($a)
      res.json({ "results": "error", "numrow": `${rows}`, "datarow": $arr });
    }
  })
})
router.post('/changepassword', (req, res) => {
  var $userID = req.body.user;
  var $oldpassword = req.body.oldpassword;
  var $password = req.body.password;
  var $sql = `SELECT Id, UsernameA From cash.dbo.Userpassword  WHERE (UsernameA = '${$userID}') AND (PasswordA = '${$oldpassword}')`;
  scm.query($sql, (err, rs) => {
    var row = rs.recordset[0];
    // console.log(row['Id'])
    // res.send($up)
    if (rs.rowsAffected[0] > 0) {
      var $up = `UPDATE cash.dbo.Userpassword SET PasswordA = '${$password}' WHERE Id = ${row['Id']}  AND  UsernameA = '${row['UsernameA']}'`;
      scm.query($up, (err, rec) => {
        //console.log(rec.rowsAffected)
        if (rec.rowsAffected[0] != 0) {
          res.json({ "results": "success", "detail": "เปลี่ยน Password เรียบร้อย" });
        } else {
          res.json({ "results": "error", "detail": "Password ไม่ถูกต้อง" });
        }

      })
    } else {
      res.json({ "results": "error", "detail": "Password ไม่ถูกต้อง" });
    }
  })
})
router.post('/checkka', (req, res) => {
  var $Ka = req.body.Ka;
  var $Idsaka = req.body.Idsaka;
  var $sql = `SELECT TOP (1) PERCENT Ka, Stclose FROM   cash.dbo.Moneyt_Munkong WHERE (Type = 3) AND (Status = 0) AND (Codesaka = '${$Idsaka}') ORDER BY Id`;
  scm.query($sql, (err, rs) => {
    //console.log(rs.recordset.length)
    if (rs.recordset.length === 1) {
      res.json({ "results": "success", "Ka": `${rs.recordset[0]['Ka']}` });
    } else {
      res.json({ "results": "error_login" })
    }
  })
})
router.post('/addHero', async (req, res) => {
  var Codebank = req.body.Codebank;
  var datalist = req.body.dataobj;
  var CenterCode = req.body.CenterCode;
  var $Xuser = req.body.Xuser;
  var Ka = $Xuser.Ka;
  var userid = $Xuser.user;
  var date = dt.format("Y-m-d H:M:S.000");
  var dateCash = dt.format('Ymd');
  var range = generate(5);
  var ref_id = `REF${range}`;
  var short_id2 = `CLS${CenterCode}${dateCash}${range}`;
  // console.dir(req.body)
  const table = new sql.Table('cash.dbo.Moneys_temp2');
  table.create = false;
  // table.columns.add('Id', sql.Int, { nullable: false  ,primary: true,identity:true});
  table.columns.add('Idjob', sql.NVarChar(150), { nullable: true });
  table.columns.add('Idjobd', sql.NVarChar(50), { nullable: true });
  table.columns.add('Datejob', sql.NVarChar(100), { nullable: true });
  table.columns.add('Codebank', sql.NVarChar(50), { nullable: false });
  table.columns.add('Namebank', sql.NVarChar(150), { nullable: false });
  table.columns.add('Codesaka', sql.NVarChar(128), { nullable: true });
  table.columns.add('Jb1000', sql.Numeric(18), { nullable: true });
  table.columns.add('Jb500', sql.Numeric(18), { nullable: true });
  table.columns.add('Jb100', sql.Numeric(18), { nullable: true });
  table.columns.add('Jb50', sql.Numeric(18), { nullable: true });
  table.columns.add('Jb20', sql.Numeric(18), { nullable: true });
  table.columns.add('Jb10', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc10', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc5', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc2', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc1', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc050', sql.Numeric(18), { nullable: true });
  table.columns.add('Jc025', sql.Numeric(18), { nullable: true });
  table.columns.add('Rb', sql.Numeric(18), { nullable: true });
  table.columns.add('Rjb', sql.Numeric(18), { nullable: true });
  table.columns.add('Rc', sql.Numeric(18), { nullable: true });
  table.columns.add('Rjc', sql.Numeric(18), { nullable: true });
  table.columns.add('Rall', sql.Numeric(18), { nullable: true });
  table.columns.add('Mark', sql.NVarChar(255), { nullable: true });
  table.columns.add('Type', sql.Numeric(18), { nullable: true });
  table.columns.add('Status', sql.Numeric(18), { nullable: true });
  table.columns.add('Userrec', sql.NVarChar(128), { nullable: true });
  table.columns.add('Joblink', sql.NVarChar(128), { nullable: true });
  table.columns.add('Iduser', sql.NVarChar(128), { nullable: true });
  table.columns.add('Userdel', sql.NVarChar(128), { nullable: true });
  table.columns.add('Cbsaka', sql.NVarChar(128), { nullable: true });
  table.columns.add('Nbsaka', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial1', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial2', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial3', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial4', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial5', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial6', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial7', sql.NVarChar(128), { nullable: true });
  table.columns.add('Serial8', sql.NVarChar(128), { nullable: true });
  table.columns.add('Useradj', sql.NVarChar(128), { nullable: true });
  table.columns.add('Dateadj', sql.NVarChar(128), { nullable: true });
  table.columns.add('Receiver', sql.NVarChar(128), { nullable: true });
  table.columns.add('ReceiverDate', sql.NVarChar(128), { nullable: true });
  for (let j = 0; j < datalist.length; j += 1) {

    var short_id = `IM${CenterCode}${dateCash}${range}${zeroPad(j, 4)}`;
    var B1000; if (datalist[j]['B1000'] != null) { B1000 = datalist[j]['B1000'] } else { B1000 = 0 };
    var B500; if (datalist[j]['B500'] != null) { B500 = datalist[j]['B500'] } else { B500 = 0 };
    var B100; if (datalist[j]['B100'] != null) { B100 = datalist[j]['B100'] } else { B100 = 0 };
    var B50; if (datalist[j]['B50'] != null) { B50 = datalist[j]['B50'] } else { B50 = 0 };
    var B20; if (datalist[j]['B20'] != null) { B20 = datalist[j]['B20'] } else { B20 = 0 };
    var B10; if (datalist[j]['B10'] != null) { B10 = datalist[j]['B10'] } else { B10 = 0 };
    var C10; if (datalist[j]['C10'] != null) { C10 = datalist[j]['C10'] } else { C10 = 0 };
    var C5; if (datalist[j]['C5'] != null) { C5 = datalist[j]['C5'] } else { C5 = 0 };
    var C2; if (datalist[j]['C2'] != null) { C2 = datalist[j]['C2'] } else { C2 = 0 };
    var C1; if (datalist[j]['C1'] != null) { C1 = datalist[j]['C1'] } else { C1 = 0 };
    var C05; if (datalist[j]['C05'] != null) { C05 = datalist[j]['C05'] } else { C05 = 0 };
    var C025; if (datalist[j]['C025'] != null) { C025 = datalist[j]['C025'] } else { C025 = 0 };
    var Rjb = B1000 + B500 + B100 + B50 + B20 + B10;
    var Rjc = C10 + C5 + C2 + C1 + C05 + C025;
    table.rows.add(short_id, ref_id, date, datalist[j]['Codebank'], datalist[j]['Namebank'],
      datalist[j]['codeSaka'], datalist[j]['B1000'], datalist[j]['B500'], datalist[j]['B100'], datalist[j]['B50'], datalist[j]['B20'], datalist[j]['B10'],
      datalist[j]['C10'], datalist[j]['C5'], datalist[j]['C2'], datalist[j]['C1'], datalist[j]['C05'], datalist[j]['C025'],
      '', Rjb, '', Rjc, datalist[j]['Total'],
      datalist[j]['remake'], 2, 1, datalist[j]['Userrec'], datalist[j]['line'],
      userid, '', datalist[j]['No'], datalist[j]['saka'],
      datalist[j]['Serial1'], datalist[j]['Serial2'], datalist[j]['Serial3'], datalist[j]['Serial4']
      , datalist[j]['Serial5'], datalist[j]['Serial5'], datalist[j]['Serial7'], datalist[j]['Serial8'], '', '', '', ''
    );
  }
  const request = new sql.Request();
  return await request.bulk(table)
    .then(data => {
      // console.log(data)
      if (data.rowsAffected === datalist.length) {
        var nsql = `SELECT Idjobd, Datejob, Codebank, Namebank, Codesaka, Cbsaka,
       SUM(Rall) AS MTotal, SUM(Rjb) AS Banknote, SUM(Rjc) AS Coin, SUM(Jb1000) 
       AS Jb1000, SUM(Jb500) AS Jb500, SUM(Jb100) AS Jb100, SUM(Jb50) AS Jb50, 
       SUM(Jb20) AS Jb20, SUM(Jb10) AS Jb10, SUM(Jc10) AS Jc10, SUM(Jc5) AS Jc5, 
       SUM(Jc2) AS Jc2, SUM(Jc1) AS Jc1, SUM(Jc050) AS Jc050, SUM(Jc025) AS Jc025 
       FROM  cash.dbo.Moneys_temp2 WHERE (Idjobd = '${ref_id}') GROUP BY Idjobd, Datejob, Codebank, Namebank, Codesaka,Cbsaka`;
        //console.log(nsql)
        scm.query(nsql, async (err, rec) => {
          const table = new sql.Table('cash.dbo.Moneyt_Munkong');
          table.create = false;
          table.columns.add('Idjob', sql.NVarChar(20), { nullable: true, });
          table.columns.add('Idjobd', sql.NVarChar(20), { nullable: true });
          table.columns.add('Datejob', sql.NVarChar(50), { nullable: true });
          table.columns.add('Codebank', sql.NVarChar(150), { nullable: true });
          table.columns.add('Namebank', sql.NVarChar(50), { nullable: true });
          table.columns.add('Codesaka', sql.NVarChar(150), { nullable: true });
          table.columns.add('Jb1000', sql.Numeric(18), { nullable: true });
          table.columns.add('Jb500', sql.Numeric(18), { nullable: true });
          table.columns.add('Jb100', sql.Numeric(18), { nullable: true });
          table.columns.add('Jb20', sql.Numeric(18), { nullable: true });
          table.columns.add('Jb10', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc10', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc5', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc2', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc1', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc050', sql.Numeric(18), { nullable: true });
          table.columns.add('Jc025', sql.Numeric(18), { nullable: true });
          table.columns.add('Rjb', sql.Numeric(18), { nullable: true });
          table.columns.add('Rjc', sql.Numeric(18), { nullable: true });
          table.columns.add('Rall', sql.Numeric(18), { nullable: true });
          table.columns.add('Mark', sql.NVarChar(150), { nullable: true });
          table.columns.add('Type', sql.NVarChar(150), { nullable: true });
          table.columns.add('Status', sql.NVarChar(150), { nullable: true });
          table.columns.add('Userrec', sql.NVarChar(150), { nullable: true });
          table.columns.add('Ka', sql.NVarChar(1), { nullable: true });


          var ro = rec.rowsAffected[0]
          for (let i = 0; i < ro; i += 1) {
            var row = rec.recordset[i];
            // console.log(row['Codebank']) 
            // console.log(row['Namebank']) 
            // console.log(row['Cbsaka']) 

            table.rows.add(
              short_id2, ref_id, '',
              row['Codebank'],
              row['Namebank'],
              row['Cbsaka'],
              row['Jb1000'], row['Jb500'], row['Jb100'], row['Jb50'], row['Jb10'],
              row['Jc10'], row['Jc5'], row['Jc2'], row['Jc1'], row['Jc050'], row['Jc025'],
              row['Banknote'], row['Coin'], row['MTotal'], 'import data file', '2', '0', userid, Ka
            )
            const request = new sql.Request();
            return await request.bulk(table)
              .then(data2 => {
                console.dir(data2)
                res.json({ 'results': `successful`, 'numrow': data2.rowsAffected, "CASH": short_id2, "refid": ref_id })
              })
              .catch(err => {
                console.log(err)
                res.json({ 'results': `error` })
              });

          }

        })
      } else {
        res.json({ 'results': `error`, 'detail': `เกิดข้อผิดพลาด` })
      }


    })
    .catch(err => {
      // console.log(err)
      res.json({ 'results': `error` })
    });

})
router.post('/HeroLogin', (req, res) => {
  var $var_username = req.body.User_ID;
  var $var_password = req.body.Pass_ID;
  //console.dir(req.body)
  var $sql = `SELECT Id, UsernameA, PasswordA, DepartA, Idsaka, LevelA, Mark, Name, Ka, Online, Userrec FROM cash.dbo.Userpassword WHERE (UsernameA = '${$var_username}') AND (PasswordA = '${$var_password}')`;
  scm.query($sql, (err, rs) => {

    var rows = rs.rowsAffected[0];

    if (rows != 0) {
      var datarows = rs.recordset[0];
      var $Emp_ID = datarows['UsernameA'];
      var $Emp_Name = datarows['Name'];
      var $Cash_center_Name = datarows['DepartA'];
      var $LevelA = datarows['LevelA'];
      var $Mark = datarows['Mark'];
      var $Ka = datarows['Ka'];
      var $UsernameA = datarows['UsernameA'];
      var Idsaka = datarows['Idsaka'];
      var $a = { "DepartA": $Cash_center_Name, "Idsaka": Idsaka, "Level": $LevelA, "Mark": $Mark, "syska": $Ka, "Ka": $Ka, "user": $UsernameA, "Name": $Emp_Name };
      var $arr = [];
      $arr.push($a)
      // console.log($arr)
      var $s = `SELECT TOP (1) PERCENT Ka, Stclose FROM cash.dbo.Moneyt_Munkong WHERE  (Type = 3) AND (Status = 0) AND (Codesaka = '${Idsaka}') ORDER BY Id`;
      // console.log($s)
      scm.query($s, (err, rec) => {
        //  console.dir(rec)
        var rows = rec.recordset[0];
        var $cka = rows['Ka'];
        var $StatusKa = rows['Status'];
        res.json({ "results": "success", "user": `${$Emp_ID}`, "Name": `${$Emp_Name}`, "operate": JSON.stringify($arr[0]), "Idsaka": `${Idsaka}`, "Ka": `${$Ka}`, "syska": `${$cka}` })

      })
    } else {
      res.json({ "results": "error_login", "user": `${$var_username}` })
    }

  })
})
router.post('/closeworkingtime', (req, res) => {
  var Idsaka = req.body.Idsaka
  var Ka = req.body.Ka;
  var user = req.body.user;
  var newKa
  if (Ka == '1') {
    newKa = '2';
  } else {
    newKa = '1';
  }
  var date = dt.format("Y-m-d H:M:S.000");
  var dateCash = dt.format('Ymd');

  var $sql = `SELECT Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, 
  Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall, Closs, Mark, Type, 
  Status, Userrec, Joblink, Fak, Ton, Kl, Ym, YFak, YTon, Idclose, Ka, Stclose 
 FROM cash.dbo.Moneyt_Munkong WHERE   (Type = 3) AND (Status = 0) AND (Codesaka = '${Idsaka}')`;
  var opernum = 0;
  scm.query($sql, (err, rs) => {
    var numrows = rs.rowsAffected[0];
    if (numrows !== 0) {
      var range = generate(5);
      var short_id = `BCF${Idsaka}${dateCash}${range}`;
      for (let i = 0; i < numrows; i++) {
        opernum++;
        var data = rs.recordset[i];
        var IDF = data['Id'];
        var Idjobs = data['Idjob'];
        var Codebanks = data['Codebank'];
        var Namebanks = data['Namebank'];
        var Codesakas = data['Codesaka'];
        var J1000 = data['Jb1000'];
        var J500 = data['Jb500'];
        var J100 = data['Jb100'];
        var J50 = data['Jb50'];
        var J20 = data['Jb20'];
        var J10 = data['Jb10'];
        var JC10 = data['Jc10'];
        var JC5 = data['Jc5'];
        var JC2 = data['Jc2'];
        var JC1 = data['Jc1'];
        var JC050 = data['Jc050'];
        var JC025 = data['Jc025'];
        var RJBT = J1000 + J500 + J100 + J50 + J20 + J10;
        var RJCT = JC10 + JC5 + JC2 + JC1 + JC050 + JC025;
        var ALL = RJBT + RJCT;
        var sqlup = `UPDATE cash.dbo.Moneyt_Munkong SET Ym = '1' ,Stclose = '${user}' WHERE (Codebank = '${Codebanks}') AND (Codesaka = '${Codesakas}') AND (Ym = '0')`;
        scm.query(sqlup, (err, rss) => {
          if (rss.rowsAffected[0] !== 0) {
            var sqlin = `INSERT INTO cash.dbo.Moneyt_Munkong (Idjob, Idjobd ,Datejob, Codebank, Namebank, Codesaka,Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050,Jc025,
   Rjb, Rjc, Rall,Mark,Type, Status, Userrec,Ym,Ka) VALUES 
('${short_id}','${Idjobs}','${date}','${Codebanks}','${Namebanks}','${Codesakas}',${J1000},${J500},${J100},
${J50},${J20},${J10},${JC10},${JC5},${JC2},${JC1},${JC050},${JC025},${RJBT},${RJCT},${ALL},
'NEW KA Closed by ${user}','3','0','$user','0','${newKa}') `;
            scm.query(sqlin, (err, ok) => {
              if (ok.rowsAffected[0] !== 0) {
                scm.query(`UPDATE cash.dbo.Moneyt_Munkong SET Status = '1' ,Stclose ='${user}' WHERE Id = ${IDF}`);
                scm.query(`UPDATE cash.dbo.Moneyt_Munkong SET  Stclose ='${user}' WHERE  (Stclose IS NULL) AND (Codebank = '${Codebanks}')`);
              }
            })
          }
        })
      }
      if (opernum === numrows) {
        res.json({ "results": "success" })
      }
    }
  })
  var str = generate(10)
  //res.json({code:str,sql:$nsql})
})
router.post('/branchdepositlist', (req, res) => {
  var operate = JSON.parse(req.body.operate);
  var $Idsaka = req.body.Idsaka;
  var $sql;
  var $lavel = operate.Level;
  if ($lavel === "2") {
    $sql = `SELECT * FROM  cash.dbo.Moneyt_Munkong WHERE  (Type = 1) AND (Codesaka = '${$Idsaka}') AND (Status = 0)`;
  } else {
    $sql = `SELECT  Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, 
    Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall, Mark, Type, Status, Userrec, Joblink, Iduser, Userdel, Cbsaka,Nbsaka, Serial1, Serial2, Serial3, Serial4,
     Serial5, Serial6, Serial7, Serial8, Useradj, Dateadj, Receiver, ReceiverDate
FROM  cash.dbo.Moneys_temp WHERE (Type = 1) AND (Codesaka = '${$Idsaka}') AND (Status <> 4)`;
  }
  //console.log($sql)
  scm.query($sql, (err, rs) => {
    // console.dir(rs)
    var rows = rs.rowsAffected[0];
    if (rows != 0) {
      /*
     var $arr = [];
    
     for (let i = 0; i < rows; i++) {
       var data = rs.recordset[i];
       var $a = {
         "ID": data['Id'],
         "Codebank": data['Codebank'],
         "Namebank": data['Namebank'],
         "Nbsaka": data['Nbsaka'],
         "Cbsaka": data['Cbsaka'],
         "Name": data['Name'],
         "Rall": data['Rall'],
         "Jb1000": data['Jb1000'],
         "Jb500": data['Jb500'],
         "Jb100": data['Jb100'],
         "Jb50": data['Jb50'],
         "Jb20": data['Jb20'],
         "Jb10": data['Jb10'],
         "Jc10": data['Jc10'],
         "Jc5": data['Jc5'],
         "Jc2": data['Jc2'],
         "Jc1": data['Jc1'],
         "Jc050": data['Jc050'],
         "Jc025": data['c025'],
         "Rjb": data['Rjb'],
         "Rjc": data['Rjc'],
         "Car_license": data['Car_license'],
         "Idjob": data['Idjob'],
         "Status": data['Status']
       };
       $arr.push($a)
     }
     */
      // console.dir($arr)
      res.json({ "results": "success", "numrow": `${rows}`, "datarow": rs.recordset })
    } else {
      res.json({ "results": "error", "numrow": `${rows}`, "saka": `'${$Idsaka}'` })
    }
  })
})
router.post('/mandeposit', (req, res) => {
  var $User = req.body.User;
  var $datalist = req.body.money;
  var $bank = $datalist.bank;
  var B1000 = $datalist.b1000;
  var B500 = $datalist.b500;
  var B100 = $datalist.b100;
  var B50 = $datalist.b50;
  var B20 = $datalist.b20;
  var B10 = $datalist.b10;
  var C10 = $datalist.c10;
  var C5 = $datalist.c5;
  var C2 = $datalist.c2;
  var C1 = $datalist.c1;
  var C05 = $datalist.c050;
  var C025 = $datalist.c025;
  var moneytotlal = req.body.moneytotlal;
  var remake = $datalist.remark;
  var Userrec = $User.user;
  var Idsaka = $User.Idsaka;
  var Ka = $User.Ka;
  var Namebank = $bank.Namebank;
  var Codebank = $bank.Codebank;
  var Rjb = B1000 + B500 + B100 + B50 + B20 + B10;
  var Rjc = C10 + C5 + C2 + C1 + C05 + C025;
  var date = dt.format("Y-m-d H:M:S.000");
  var dateCash = dt.format('Ymd');
  var range = generate(5);
  var short_id = `DEP${Idsaka}${dateCash}${range}`;
  var title = 'ฝากโดย ';
  var ref_id = `DEP${Idsaka}${dateCash}${range}`;
  var $sq = `INSERT INTO cash.dbo.Moneyt_Munkong  (Idjob,Idjobd,Datejob,Codebank,Namebank,Codesaka,Jb1000,Jb500,
    Jb100,Jb50,Jb20,Jb10,Jc10,Jc5,Jc2,Jc1,Jc050,Jc025,Rjb,Rjc,Rall,Mark,Type,Status,Userrec,Ka) 
    VALUES ('${short_id}','${ref_id}','${date}','${Codebank}',N'${Namebank}','${Idsaka}',${B1000},${B500},${B100},${B50},${B20},${B10},${C10},${C5},${C2},${C1},${C05},${C025},${Rjb},${Rjc},${moneytotlal},N'${title} ${Userrec} :${remake}','1','2','${Userrec}','${Ka}')`;
  scm.query($sq, (err, rec) => {
    if (rec.rowsAffected[0] == 1) {
      res.json({ results: "successful", "CASH": `${short_id}`, "refid": `${ref_id}` })
    } else {
      res.json({ results: "error" })
    }
  })
})
router.post('/callsaka', (req, res) => {
  var $codesaka = req.body.codesaka;
  var $sql = `SELECT Id, Codesaka, Namesaka FROM  cash.dbo.Saka WHERE   (Codesaka = N'${$codesaka}')`;
  scm.query($sql, (err, rs) => {
    if (rs.rowsAffected[0] === 1) {
      res.json({ results: "success", datarow: rs.recordset[0] })
    } else {
      res.json({ results: "error" })
    }
    // console.log(rs)
  })
})
router.post('/withdrawmunkong', (req, res) => {
  var $User = req.body.user;
  var $datalist = req.body.val;
  var moneytotlal = req.body.balance;
  var userid = $User.Userid;
  var Ka = $User.Ka;
  var Idsaka = $User.Idsaka;
  var $bank = $datalist.bank;
  var Namebank = $bank.Namebank;
  var Codebank = $bank.Codebank;
  var B10 = $datalist.b10;
  var B20 = $datalist.b20;
  var B50 = $datalist.b50;
  var B100 = $datalist.b100;
  var B500 = $datalist.b500;
  var B1000 = $datalist.b1000;
  var Rjb = B10 + B20 + B50 + B100 + B500 + B1000;
  var C1 = $datalist.c1;
  var C2 = $datalist.c2;
  var C5 = $datalist.c5;
  var C10 = $datalist.c10;
  var C025 = $datalist.c025;
  var C050 = $datalist.c050;
  var Rjc = C1 + C2 + C5 + C10 + C025 + C050;
  var Mark = $datalist.remark;
  var myDate = $datalist.myDate;
  var pastDateTime = datetime.create(myDate);
  var date = pastDateTime.format("Y-m-d");
  var dateCash = dt.format('Ymd');
  var range = generate(5);
  var short_id = `WID${Idsaka}${dateCash}${range}`;
  var ref_id = `WID${Idsaka}${dateCash}${range}`;
  var $sq = `INSERT INTO cash.dbo.Moneyt_Munkong  (Idjob,Idjobd,Datejob,Codebank,Namebank,Codesaka,Jb1000,Jb500,Jb100,Jb50,
    Jb20,Jb10,Jc10,Jc5,Jc2,Jc1,Jc050,Jc025,Rjb,Rjc,Rall,Mark,Type,Status,Userrec,Ka) 
    VALUES ('${short_id}','${ref_id}','${date}','${Codebank}',N'${Namebank}','${Idsaka}',${B1000},${B500},${B100},${B50},${B20},${B10},${C10},${C5},${C2},${C1},${C050},${C025},${Rjb},${Rjc},${moneytotlal},N'${Mark}','2','0','${userid}','${Ka}')`;
  scm.query($sq, (err, rec) => {
    if (rec.rowsAffected[0] == 1) {
      res.json({ results: "successful", "CASH": `${short_id}`, "refid": `${ref_id}` })
    } else {
      res.json({ results: "error" })
    }
  })
})
router.post('/mandepositlist', (req, res) => {
  var Idsaka = req.body.Idsaka;
  var $sql = `SELECT  Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, 
Jc5, Jc2, Jc1, Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall, Closs, Mark, Type, Status, Userrec, Joblink, Fak, Ton, Kl, Ym, YFak, 
                         YTon, Idclose, Ka, Stclose
FROM            cash.dbo.Moneyt_Munkong
WHERE        (Type = 1) AND (Status = 2)  AND (Codesaka = '${Idsaka}')`;
  scm.query($sql, (err, data) => {
    //console.dir(data)
    if (data.rowsAffected[0] != 0) {
      res.json({ "results": "success", "numrow": `${data.rowsAffected[0]}`, "datarow": data.recordset })
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/wail4Approve', (req, res) => {
  var Idsaka = req.body.CenterCode;
  var $sql = `SELECT        Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka,  Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025,Rjb,Rjc,Rall, Mark, Type, Ka, Status
FROM            cash.dbo.Moneyt_Munkong
WHERE        (Type != 3) AND (Status = 0) AND (Codesaka = '${Idsaka}') ORDER BY Codebank`;
  //console.log($sql)
  scm.query($sql, (err, data) => {
    if (data.rowsAffected[0] != 0) {
      res.json({ "results": "success", "numrow": `${data.rowsAffected[0]}`, "datarow": data.recordset })
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/wail4approvegroup', (req, res) => {
  var Idsaka = req.body.CenterCode;
  var arrdata = req.body.arrdata;
  var type = arrdata.Type;
  var $sql;
  if (type == 1) {
    $sql = `SELECT        Idjobd, Datejob, Codebank, Namebank, Codesaka,SUM(Rall) AS MTotal, SUM(Rjb) AS Banknote, SUM(Rjc) AS Coin
    FROM  cash.dbo.Moneys_temp
    WHERE        (Status = 2) AND (Type = ${type})
    GROUP BY Idjobd, Datejob, Codebank, Namebank, Codesaka
    HAVING        (Codesaka = N'${Idsaka}')`;
  } else if (type == 2) {
    $sql = `SELECT Idjobd, Datejob, Codebank, Namebank, Codesaka,SUM(Rall) AS MTotal, SUM(Rjb) AS Banknote, SUM(Rjc) AS Coin
    FROM           cash.dbo.Moneys_temp
    WHERE        (Status = 1) AND (Type = ${type})
    GROUP BY Idjobd, Datejob, Codebank, Namebank, Codesaka
    HAVING        (Codesaka = '${Idsaka}')`;
  }
  // console.log($sql)
  scm.query($sql, (err, data) => {

    if (data.rowsAffected[0] != 0) {
      res.json({ "results": "success", "numrow": `${data.rowsAffected[0]}`, "datarow": data.recordset })
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/deletedeposit', (req, res) => {
  var ID;
  if (req.body.Id) {
    ID = req.body.Id
  } else {
    ID = req.body.ID
  }
  var $sql = `DELETE FROM cash.dbo.Moneyt_Munkong  WHERE Id=${ID}`;
  scm.query($sql, (err, data) => {
    if (data.rowsAffected[0] != 0) {
      res.json({ "results": "success" })
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/setstatusdeposit4', (req, res) => {
  var Idjob = req.body.Idjob;
  var $sql = `SELECT TOP (100) PERCENT Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, 
Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall, Mark, Type, Status, Userrec, Joblink, Iduser, 
Userdel, Cbsaka, Nbsaka, Serial1, Serial2, Serial3, Serial4, Serial5, Serial6, Serial7, Serial8, Useradj, Dateadj
FROM            dbo.Moneys_temp
WHERE        (Idjob = '${Idjob}')`;
  scm.query($sql, (err, data) => {
    if (data.rowsAffected[0] != 0) {
      var sql = `UPDATE dbo.Moneys_temp SET Status = 4 WHERE Idjob = '${Idjob}'`;
      scm.query(sql, (err, rs) => {
        if (rs.rowsAffected[0] != 0) {
          res.json({ "results": "success", "numrow": `${rs.rowsAffected[0]}` });
        } else {
          res.json({ "results": "error", "detail": "sql error" });
        }
      })
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/getmoneymunkong', (req, res) => {
  //var Formpost = req.body;
  var Idsaka = req.body.Idsaka
  var $sql = `SELECT        Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rall, Mark, Type, Ka, Status
FROM            cash.dbo.Moneyt_Munkong
WHERE        (Type = 3) AND (Status = 0) AND Codesaka='${Idsaka}' ORDER BY Codebank`;
  scm.query($sql, (err, data) => {
    // console.dir(data)
    var rows = data.rowsAffected[0];
    if (rows != 0) {
      var $arr = [];
      for (let i = 0; i < rows; i++) {
        var row = data.recordset[i];
        var $a = {
          ID: row['Id'],
          Codebank: row['Codebank'],
          Namebank: row['Namebank'],
          Nbsaka: row['Nbsaka'],
          Cbsaka: row['Cbsaka'],
          Name: row['Name'],
          Jb1000: row['Jb1000'], Jb500: row['Jb500'], Jb100: row['Jb100'], Jb50: row['Jb50'], Jb20: row['Jb20'], Jb10: row['Jb10'],
          Jc10: row['Jc10'], Jc5: row['Jc5'], Jc2: row['Jc2'], Jc1: row['Jc1'], Jc050: row['Id'], ID: row['Jc050'], Jc025: row['Jc025'],
          Rall: row['Rall'],
          JBTotal: row['Jb1000'] + row['Jb500'] + row['Jb100'] + row['Jb50'] + row['Jb20'] + row['Jb10'],
          JCTotal: row['Jc10'] + row['Jc5'] + row['Jc2'] + row['Jc1'] + row['Id'] + row['Jc050'] + row['Jc025'],
          Ka: row['Ka'], Mark: row['Mark']
        }
        $arr.push($a)
      }
      res.json({ "results": "success", "numrow": `${rows}`, "datarow": `${JSON.stringify($arr)}`, "Idsaka": `${Idsaka}` });
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.get('/getmoneycutoffmunkong', (req, res) => {
  var $sql = `SELECT Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rall, Mark, Type, Ka, Status
  FROM cash.dbo.Moneyt_Munkong WHERE (Type = 2) AND (Status = 0) ORDER BY Codebank`;
  scm.query($sql, (err, data) => {
    // console.dir(data)
    var rows = data.rowsAffected[0];
    if (rows != 0) {
      var $arr = [];
      for (let i = 0; i < rows; i++) {
        var row = data.recordset[i];
        var $a = {
          ID: row['Id'],
          Codebank: row['Codebank'],
          Namebank: row['Namebank'],
          Nbsaka: row['Nbsaka'],
          Cbsaka: row['Cbsaka'],
          Name: row['Name'],
          Jb1000: row['Jb1000'], Jb500: row['Jb500'], Jb100: row['Jb100'], Jb50: row['Jb50'], Jb20: row['Jb20'], Jb10: row['Jb10'],
          Jc10: row['Jc10'], Jc5: row['Jc5'], Jc2: row['Jc2'], Jc1: row['Jc1'], Jc050: row['Id'], ID: row['Jc050'], Jc025: row['Jc025'],
          Rall: row['Rall'],
          JBTotal: row['Jb1000'] + row['Jb500'] + row['Jb100'] + row['Jb50'] + row['Jb20'] + row['Jb10'],
          JCTotal: row['Jc10'] + row['Jc5'] + row['Jc2'] + row['Jc1'] + row['Id'] + row['Jc050'] + row['Jc025'],
          Ka: row['Ka'], Mark: row['Mark']
        }
        $arr.push($a)
      }
      res.json({ "results": "success", "numrow": `${rows}`, "datarow": `${JSON.stringify($arr)}` });
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/moneydefault', (req, res) => {
  var Formpost = req.body;
  var val = Formpost.val;
  var balance = Formpost.balance;
  var b10 = val.b10;
  var b20 = val.b20;
  var b50 = val.b50;
  var b100 = val.b100;
  var b500 = val.b500;
  var b1000 = val.b1000;
  var c1 = val.c1;
  var c2 = val.c2;
  var c5 = val.c5;
  var c10 = val.c10;
  var c025 = val.c025;
  var c050 = val.c050;
  var bank = val.bank;
  var Codebank = bank.Codebank;
  var Namebank = bank.Namebank;
  var user = Formpost.user;
  var userid = user.Userid;
  var Ka = user.Ka;
  var Idsaka = user.Idsaka;
  var myDate = val.myDate;
  var Mark = val.Mark;
  var Rjb = b1000 + b500 + b100 + b50 + b20 + b10;
  var Rjc = c10 + c5 + c2 + c1 + c050 + c025;
  var pastDateTime = datetime.create(myDate);
  var date = pastDateTime.format("Y-m-d H:M:S.000");
  var timestamp = dt.format("Y-m-d H:M:S.000");
  var dateCash = dt.format('Ymd');
  var range = generate(5);
  var short_id = `MUN${Idsaka}${dateCash}${range}`;
  var ref_id = `DEF${Idsaka}${dateCash}${range}`;
  var $sqlup = `UPDATE cash.Moneyt_Munkong SET Status = '1' , Idclose = '${userid}' WHERE Codesaka = '${Idsaka}' AND Codebank = '${Codebank}'`
  console.dir(val)
  scm.query($sqlup, (err, rec) => {
    if (rec.rowsAffected[0] != 0) {
      var $sql = `INSERT INTO cash.Moneyt_Munkong 
    (Idjob,Idjobd,Datejob,Codebank,Namebank,Codesaka,Jb1000,Jb500,Jb100,Jb50,Jb20,Jb10,Jc10,Jc5,
      Jc2,Jc1,Jc050,Jc025,Rjb,Rjc,Rall,Mark,Type,Status,Userrec,Ka) 
    VALUES 
    ('${short_id}','${ref_id}','${date}','${Codebank}','${Namebank}','${Idsaka}',${b1000},${b500},${b100},${b50},${b20},
    ${b10},${c10},${c5},${c2},${c1},${c050},${c025},${Rjb},${Rjc},${balance},'${Mark}','3','0','${userid}','${Ka}')`;
      scm.query($sql, (err, rc) => {
        if (rc.rowsAffected[0] != 0) {
          res.json({ results: "success", myDate: `${timestamp}` })
        } else {
          res.json({ results: "error" })
        }
      })
    } else {
      res.json({ results: "error" })
    }
  })
})
router.post('/katransation', (req, res) => {
  var Formpost = req.body;

  var Idsaka = Formpost.Idsaka;
  var Ka = Formpost.Ka;
  var user = Formpost.user;
  var $sql = `SELECT Namebank,SUM(Rall) AS ALLs , SUM(Jb1000)AS Jb1000 , SUM(Jb500) AS Jb500, SUM(Jb100) AS Jb100, 
SUM(Jb50) AS Jb50, SUM(Jb20) AS Jb20, SUM(Jb10) AS Jb10,SUM(Jc10) AS Jc10,SUM(Jc5) AS Jc5,SUM(Jc2) AS Jc2,SUM(Jc1) AS Jc1,SUM(Jc050) AS Jc050,SUM(Jc025) AS Jc025
FROM            cash.dbo.Moneyt_Munkong
WHERE        (Ka = ${Ka}) AND (Type = 3) AND Status = 0 AND (Codesaka = '${Idsaka}')
GROUP BY 
grouping sets( Namebank,()) `;
  //console.log($sql)
  scm.query($sql, (err, data) => {
    // console.dir(data)
    if (data.rowsAffected[0] !== 0) {
      res.json({ "results": "success", "numrow": `${data.rowsAffected[0]}`, "datarow": `${JSON.stringify(data.recordset)}` });
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/banktransitioninka', (req, res) => {
  //console.log('banktransitioninka')
  var Formpost = req.body;
  var Codebank = Formpost.Codebank;
  var user = Formpost.User;
  var Idsaka = user.Idsaka;
  var $sql = `WITH a AS (SELECT        TOP (1) Id, Idjobd, Rjb, Rjc, Rall, Type, Ym, Idclose, Status
                         FROM            cash.dbo.Moneyt_Munkong
                         WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '3') AND (Ym = '0')
                         UNION
                         SELECT        Id, Idjobd, Rjb, Rjc, Rall, Type, Ym, Idclose, Status
                         FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_7
                         WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '1') AND (Status = '3') AND (Id BETWEEN
                                                      (SELECT        TOP (1) Id
                                                        FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_6
                                                        WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '3') AND (Ym = '0')) AND
                                                      (SELECT        TOP (1) Id
                                                        FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_5
                                                        ORDER BY Id DESC))
                         UNION
                         SELECT        Id, Idjobd, Rjb, Rjc, Rall, Type, Ym, Idclose, Status
                         FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_4
                         WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '2') AND (Status = '1') AND (Id BETWEEN
                                                      (SELECT        TOP (1) Id
                                                        FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_3
                                                        WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '3') AND (Ym = '0')) AND
                                                      (SELECT        TOP (1) Id
                                                        FROM           cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_2
                                                        ORDER BY Id DESC))
                         UNION
                         SELECT        TOP (1) Id, Idjobd, Rjb, Rjc, Rall, Type, Ym, Idclose, Status
                         FROM            cash.dbo.Moneyt_Munkong AS Moneyt_Munkong_1
                         WHERE        (Codebank = '${Codebank}') AND (Codesaka = '${Idsaka}') AND (Type = '3') AND (Status = '0'))
    SELECT        Id, Idjobd, Rjb, Rjc, Rall, Type, Ym, Idclose, Status
     FROM    a AS a_1 ORDER BY Id`;
  var $arr = [];
  var sumtype1 = 0;
  var sumtype2 = 0;
  var Gyok = 0;
  var GFok = 0;
  var n = 0;
  var $a;
  scm.query($sql, (err, data) => {
    var numrow = data.rowsAffected[0];
    if (numrow !== 0) {
      for (let j = 0; j < numrow; j += 1) {
        var row = data.recordset[j];
        n++;
        var t = row['Type'];
        var idjobd = row['Idjobd'];
        var Idclose = row['Idclose'];
        var money = row['Rall'];
        var Rjc = row['Rjc'];
        var Rjb = row['Rjb'];
        var Ym = row['Ym'];
        var Type = row['Type'];
        var Status = row['Status'];
        if (Type == '1') {
          sumtype1 = sumtype1 + money;
          $a = {
            "No": n,
            "Idjobd": idjobd,
            "deposit": money,
            "yok": 0,
            "Fok": 0,
            "withdraw": 0,
            "RJb": Rjb,
            "RJc": Rjc,
            "Type": Type,
            "Ym": Ym,
            "Idclose": Idclose,
            "Status": Status
          }
        } else if (Type == '2') {
          sumtype2 = sumtype2 + money;
          $a = {
            "No": n,
            "Idjobd": idjobd,
            "deposit": 0,
            "yok": 0,
            "Fok": 0,
            "withdraw": money,
            "RJb": Rjb,
            "RJc": Rjc,
            "Type": Type,
            "Ym": Ym,
            "Idclose": Idclose,
            "Status": Status
          }
        } else if (Type == '3' && Ym == '0') {
          Gyok = Gyok + money;
          $a = {
            "No": n,
            "Idjobd": idjobd,
            "deposit": 0,
            "yok": money,
            "Fok": 0,
            "withdraw": 0,
            "RJb": Rjb,
            "RJc": Rjc,
            "Type": Type,
            "Ym": Ym,
            "Idclose": Idclose,
            "Status": Status
          }
        } else if (Type == '3' && Status == '0') {
          GFok = GFok + money;
          $a = {
            "No": n,
            "Idjobd": idjobd,
            "deposit": 0,
            "yok": 0,
            "Fok": money,
            "withdraw": 0,
            "RJb": Rjb,
            "RJc": Rjc,
            "Type": Type,
            "Ym": Ym,
            "Idclose": Idclose,
            "Status": Status
          }
        }
        $arr.push($a);

      }
      $arr.push({
        "No": '',
        "Idjobd": 'รวม',
        "deposit": sumtype1,
        "yok": Gyok,
        "Fok": GFok,
        "withdraw": sumtype2,
        "RJb": 0,
        "RJc": 0,
      })
      res.json({ "results": "success", "numrow": numrow, "datarow": $arr, "type1": sumtype1, "type2": sumtype2 });
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/bankname', (req, res) => {
  var Formpost = req.body;
  var Name = Formpost.Namebank;
  var $sql = `SELECT top(1) Codebank, Namebank FROM cash.dbo.BankList  WHERE (Namebank = N'${Name}')`;
  scm.query($sql, (err, data) => {
    console.dir(data)
    if (data.rowsAffected[0] !== 0) {
      res.json({ "results": "success", "numrow": `${data.rowsAffected[0]}`, "Codebank": `${data.recordset[0]['Codebank']}` });
    } else {
      res.json({ "results": "error" });
    }
  })
})
router.post('/syncka', (req, res) => {
  var Formpost = req.body;
  var Idsaka = Formpost.Idsaka;
  var $sql = `SELECT TOP (1) DATEPART(year, Datejob) AS year, DATEPART(month, Datejob) AS month, DATEPART(day, Datejob) AS day, Ka
  FROM            cash.dbo.Moneyt_Munkong
  WHERE        (Type = 3) AND (Status = 0) AND (Codesaka = '${Idsaka}')`;
  scm.query($sql, (err, data) => {
    var rows = data.rowsAffected[0];
    if (rows === 1) {
      var row = data.recordset[0];
      var Ka = row['Ka']
      var day = row['year'] + '/' + row['month'] + '/' + row['day'];
      res.json({ results: "success", Ka: `${Ka}`, "Day": `${day}` });
    } else {
      res.json({ results: "error_login", user: `${Idsaka}` });
    }
  })
})
router.post('/munkongapprove', (req, res) => {
  var Formpost = req.body;
  //console.dir(Formpost)
  var $datalist = Formpost.datalist;
  var numlist = $datalist.length;
  var $xuser = Formpost.xuser;
  var Idsaka = $xuser.Idsaka;
  var Ka = $xuser.Ka;
  var uName = $xuser.Name;
  var user = $xuser.user;
  var $arr = [];
  var $num = 0;
  for (let i = 0; i < numlist; i += 1) {
    var ID = $datalist[i]['ID'];
    var IdjobRF = $datalist[i]['Idjob'];
    var Codebank = $datalist[i]['Codebank'];
    var Name = $datalist[i]['Name'];
    var Namebank2 = $datalist[i]['Namebank'];
    var NamebankCB = $datalist[i]['Namebank'];
    var NbsakaCB = $datalist[i]['Nbsaka'];
    var Jb10 = $datalist[i]['Jb10'];
    var Jb20 = $datalist[i]['Jb20'];
    var Jb50 = $datalist[i]['Jb50'];
    var Jb100 = $datalist[i]['Jb100'];
    var Jb500 = $datalist[i]['Jb500'];
    var Jb1000 = $datalist[i]['Jb1000'];
    var Jc1 = $datalist[i]['Jc1'];
    var Jc2 = $datalist[i]['Jc2'];
    var Jc5 = $datalist[i]['Jc5'];
    var Jc10 = $datalist[i]['Jc10'];
    var Jc025 = $datalist[i]['Jc025'];
    var Jc050 = $datalist[i]['Jc050'];
    var Rall = $datalist[i]['Rall'];
    var Rjb = $datalist[i]['Rjb'];
    var Rjc = $datalist[i]['Rjc'];

    var date = dt.format("Y-m-d H:M:S.000");
    var dateCash = dt.format('Ymd');
    var range = generate(5);
    var short_id = `MUN${Idsaka}${dateCash}${range}${i}`;
    var sql = `SELECT Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, 
  Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall
  FROM    cash.dbo.Moneyt_Munkong
  WHERE        (Codesaka = '${Idsaka}') AND (Type = '3') AND (Status = '0') AND (Codebank = '${Codebank}')`;
    scm.query(sql, (err, data) => {
      var rows = data.rowsAffected[0];
      if (rows !== 0) {
        var datarow = data.recordset[0];
        var $Ids = datarow['Id'];
        var Codebank = datarow['Codebank'];
        var Idjob = datarow['Idjob'];
        var Jb1000_All = datarow['Jb1000'] + Jb1000;
        var Jb500_All = Jb500 + datarow['Jb500'];
        var Jb100_All = Jb100 + datarow['Jb100'];
        var Jb50_All = Jb50 + datarow['Jb50'];
        var Jb20_All = Jb20 + datarow['Jb20'];
        var Jb10_All = Jb10 + datarow['b10'];
        var Jc10_All = Jc10 + datarow['Jc10'];
        var Jc5_All = Jc5 + datarow['Jc5'];
        var Jc2_All = Jc2 + datarow['Jc2'];
        var Jc1_All = Jc1 + datarow['Jc1'];
        var Jc050_All = Jc050 + datarow['Jc050'];
        var Jc025_All = Jc025 + datarow['Jc025'];
        var Rjb_ALL = Jb1000_All + Jb500_All + Jb100_All + Jb50_All + Jb20_All + Jb10_All;
        var Rjc_ALL = Jc10_All + Jc5_All + Jc2_All + Jc1_All + Jc050_All + Jc025_All;
        var All = Rall + datarow['Rall'];

        var sqlinsert = `INSERT INTO cash.Moneyt_Munkong 
       (Idjob,Idjobd,Datejob,Codebank,Namebank,Codesaka,Jb1000,Jb500,Jb100, Jb50, Jb20, Jb10,Jc10, Jc5, Jc2, Jc1, Jc050, Jc025,Rjb, Rjc, Rall,Mark,Type,Status,Userrec,Ka) 
       VALUES 
       ('${short_id}','${Idjob}','${date}','${Codebank}','${Namebank2}','${Idsaka}',${Jb1000_All},${Jb500_All},${Jb100_All},${Jb50_All},${Jb20_All},
       ${Jb10_All},${Jc10_All}, ${Jc5_All}, ${Jc2_All}, ${Jc1_All}, ${Jc050_All}, ${Jc025_All},${Rjb_ALL}, ${Rjc_ALL}, ${All},
       'add by $user ${uName}','3','0','${user}','${Ka}')`;
        scm.query(sqlinsert, (err, ok) => {
          if (ok.rowsAffected[0] !== 0) {
            $num++
            scm.query(`Update cash.Moneyt_Munkong set Status =  '1',Idclose = '${user}',Ton = '${date}' WHERE (Id = ${ID})`);
            scm.query(`Update cash.Moneys_temp set Status =  '3',Iduser = '${user}',Dateadj = '${date}' WHERE Idjobd = '${IdjobRF}'`)
          }
          var $a = { "ID": ID, "Idjob": Idjob, "Namebank": NamebankCB, "Namesaka": NbsakaCB, "Total": Rall };
          $arr.push($a)
        })
        if($num===numlist){
          res.json({ results: "success",datarow: JSON.stringify($arr)});
        }
      } else {
        res.json({ results: "error" });
      }
    })

  }
})
router.post('/manmunkongapprove', (req, res) => {
  var Formpost = req.body;
  //console.dir(Formpost)
  var $datalist = Formpost.datalist;
  var bank = Formpost.bank;
  var CodebankM = bank.Codebank;
  var NamebankM = bank.Namebank;
  var numlist = $datalist.length;
  var $xuser  = Formpost.xuser;
  var Idsaka = $xuser.Idsaka;
  var Ka = $xuser.Ka;
  var uName = $xuser.Name;
  var user = $xuser.user;
  var money = Formpost.money;
  var Jb1000 = money.Jb1000;
	var Jb500 = money.Jb500;
	var Jb100 = money.Jb100;
	var Jb50 = money.Jb50;
	var Jb20 = money.Jb20;
	var Jb10 = money.Jb10;
	var Jc10 = money.Jc10;
	var Jc5 = money.Jc5;
	var Jc2 = money.Jc2;
	var Jc1 = money.Jc1;
	var Jc050 = money.Jc050;
	var Jc025 = money.Jc025;
  var Rall = money.Rall;
  var Rjb = money.Rjb;
  var Rjc = money.Rjc;
  var date = dt.format("Y-m-d H:M:S.000");
    var dateCash = dt.format('Ymd');
    var range = generate(5);
    var short_id = `BF${Idsaka}${dateCash}${range}`;
    var   $arr = [];
    var  num=0;
  
  var $sqllook =`SELECT  Id, Idjob, Idjobd, Datejob, Codebank, Namebank, Codesaka, Jb1000, Jb500, Jb100, Jb50, Jb20, Jb10, Jc10, Jc5, Jc2, Jc1, Jc050, Jc025, Rb, Rjb, Rc, Rjc, Rall, Closs, Mark, Type, Status, Userrec, Joblink, Fak, Ton, Kl, Ym, YFak, 
  YTon, Idclose, Ka, Stclose
FROM            cash.dbo.Moneyt_Munkong
WHERE        (Codesaka = '${Idsaka}') AND (Type = 3) AND (Codebank = '${CodebankM}') AND (Status = 0)`; 

scm.query($sqllook, (err, data) => {
  if (data.rowsAffected[0] !== 0) {
    var datarow = data.recordset[0];
    var Idm = datarow['Id'];
    var Idjobm = datarow['Idjob'];
    var Idjobdm = datarow['Idjobd'];
    var Codebankm = datarow['Codebank'];
    var Codesakam = datarow['Codesaka']; //'001'
    var Jb1000m = datarow['Jb1000'];
    var Jb500m = datarow['Jb500'];
    var Jb100m = datarow['Jb100'];
    var Jb50m = datarow['Jb50'];
    var Jb20m = datarow['Jb20'];
    var Jb10m = datarow['Jb10'];
    var Jc10m = datarow['Jc10'];
    var Jc5m = datarow['Jc5'];
    var Jc2m = datarow['c2'];
    var Jc1m = datarow['Jc1'];
    var Jc050m = datarow['Jc050'];
    var Jc025m = datarow['Jc025'];
    var Rjbm = Jb1000m + Jb500m + Jb100m + Jb50m + Jb20m + Jb10m;
    var Rjcm = Jc10m +Jc5m + Jc2m + Jc1m + Jc050m + Jc025m;
    var Rallm = datarow['Rall'];
    var All = $Rallm + $Rall;
    var Jb1000_All = Jb1000m + Jb1000;		
    var Jb500_All = Jb500m + Jb500;	
    var Jb100_All = Jb100m + Jb100;
    var Jb50_All = Jb50m + Jb50;
    var Jb20_All = Jb20m + Jb20;
    var Jb10_All = Jb10m + Jb10;
    var Jc10_All = Jc10m + Jc10;
    var Jc5_All = Jc5m + Jc5;
    var Jc2_All = Jc2m + Jc2;
    var Jc1_All = Jc1m + Jc1;
    var Jc050_All = Jc050m + Jc050;
    var Jc025_All = Jc025m + Jc025;	
    var Rjb_All = Jb1000_All+Jb500_All+Jb100_All+Jb50_All+Jb20_All+Jc10_All;
    var Rjc_All = Jc10_All+Jc5_All+Jc2_All+Jc1_All+Jc050_All+Jc025_All;
    var $sqlmun=`INSERT INTO cash.Moneyt_Munkong 
    (Idjob,Idjobd,Datejob,Codebank,Namebank,Codesaka,Jb1000,Jb500,Jb100,Jb50,Jb20,Jb10,Jc10,Jc5,Jc2,Jc1,Jc050,Jc025,Rjb,Rjc,Rall,Mark,Type,Status,Userrec,Ka) 
    VALUES 
    ('${short_id}','${Idjobm}','${date}','${Codebankm}','${Codesakam}','${Idsaka}',${Jb1000_All},${Jb500_All},${Jb100_All},
    ${Jb50_All},${Jb20_All},${Jb10_All},${Jc10_All},${Jc5_All},${Jc2_All},${Jc1_All},${Jc050_All},
    ${Jc025_All},${Rjb_All},${Rjc_All},${All},'add by $user ${uName}','3','0','${user}','${Ka}')`;
    scm.query($sqlmun, (err, ok) => {
      if (ok.rowsAffected[0] !== 0) {
        scm.query(`Update cash.Moneyt_Munkong set Status =  '1',Idclose = '${user}',Ton = '${date}' WHERE (Id = ${Idm})`)
      }
    })
    for (let i = 0; i < numlist; i += 1) {
      var ID =$datalist[i].ID;
      var Idjob = $datalist[i].Idjob;
      var Codebank = $datalist[i].Codebank;
      var date = dt.format("Y-m-d H:M:S.000");
      scm.query(`UPDATE cash.Moneyt_Munkong SET Status =  '3',Idclose = '${user}',Ton = '${date}',Ka= '${Ka}' WHERE (Id = ${ID})`)
      $arr.push({"ID":ID,"Idjob":Idjob,"codebank":Codebank,"location":Idsaka,"Bank":CodebankM,"NameBank":NamebankM})
      num++;
    }
    if(num===numlist){
      res.json({ results: "success",datarow: JSON.stringify($arr),"Rall":Rallm,"bank":Rjbm,"Coin":Rjcm});
    }
  }else{
    res.json({ results: "error"});
  }
})

})
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
function zeroPad(num, size) {
  var s = num + 1 + "";
  while (s.length < size) s = "0" + s;
  return s;
}
module.exports = router;