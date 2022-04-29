
const express = require("express");
const router = express.Router();
const sql = require("mssql");
var cors = require("cors");
var bodyParser = require('body-parser');
const { json } = require("body-parser");
const app = express();
var moment = require('moment-timezone');
const bcrypt = require('bcrypt');
var CryptoJS = require("crypto-js");
const whitelist = [
  'http://192.168.2.37',
  'http://192.168.2.39',
  'http://192.168.2.39:5000',
  'http://119.110.245.78',
  'http://119.110.245.78:5000',
  'http://192.168.1.10',
  'http://localhost:49718',
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
var t = moment().tz("Asia/Bangkok").format().replace(/T/, ' ');
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router.get('/', (req, res) => {
  res.send('Payslip Ok')
});
router.get('/encript', (req, res) => {
  //res.send('encript Ok')
  var ciphertext = CryptoJS.AES.encrypt('25000', 'salaly').toString(); //เก็บลงฐานข้อมูล
  console.dir(ciphertext);
  var ciphertext = 'U2FsdGVkX1/3Fn7IVEsF7wy2XKNagwxgCgQyTmJ40D8='
  var bytes = CryptoJS.AES.decrypt(ciphertext, 'salaly');
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  res.send(originalText)
});

let date_ob = new Date();
let pay = new sql.Request();
router.post('/mobiledropoff', (req, res) => {
  //var month = JSON.parse(req.body.month);
  //console.log(req.body);
  var month = req.body.month;
  var year = req.body.year;
  var empCode = req.body.empCode;
  var sql = `SELECT  *  FROM   SAMCOS.dbo.V_dropoff WHERE (code = '${empCode}')`;
  var arr = [];
  //WHERE        (code = '${empCode}') AND (offmonth = '${month}') AND (offyear = '${year}')`
  pay.query(sql, (err, rs) => {
    if (err) res.json({ results: `error`, rows: sql });
    if (rs.recordset.length === 0)
      res.json({ results: `error` })
    else
      for (let i = 0; i < rs.rowsAffected[0]; i++) {
        var eSalary = CryptoJS.AES.decrypt(rs.recordset[i]['Salary'], 'Salary').toString(CryptoJS.enc.Utf8);
        var eNetIncome = CryptoJS.AES.decrypt(rs.recordset[i]['NetIncome'], 'NetIncome').toString(CryptoJS.enc.Utf8);
        var eTotalInc = CryptoJS.AES.decrypt(rs.recordset[i]['TotalInc'], 'TotalInc').toString(CryptoJS.enc.Utf8);
        var eYTD = CryptoJS.AES.decrypt(rs.recordset[i]['IncomeYTD'], 'Income-YTD').toString(CryptoJS.enc.Utf8);
        var eSSID = CryptoJS.AES.decrypt(rs.recordset[i]['SSID'], 'SSID').toString(CryptoJS.enc.Utf8);
        var eWage = CryptoJS.AES.decrypt(rs.recordset[i]['Wage'], 'Wage').toString(CryptoJS.enc.Utf8);
        arr.push({
          offmonth: rs.recordset[i]['offmonth'],
          offmonthName: rs.recordset[i]['offmonthName'],
          monthinis: rs.recordset[i]['monthinis'],
          offyear: rs.recordset[i]['offyear'],
          DateOff: rs.recordset[i]['DateOff'],
          userIM: rs.recordset[i]['userIM'],
          code: rs.recordset[i]['code'],
          ThaiName: rs.recordset[i]['ThaiName'],
          EngName: rs.recordset[i]['EngName'],
          BankAccount: rs.recordset[i]['BankAccount'],
          Advance: rs.recordset[i]['Advance'],
          Allowance: rs.recordset[i]['Allowance'],
          AppCrem: rs.recordset[i]['AppCrem'],
          App_Coop_SAMCO: rs.recordset[i]['App_Coop_SAMCO'],
          BackPay: rs.recordset[i]['BackPay'],
          Blank01: rs.recordset[i]['Blank01'],
          Blank02: rs.recordset[i]['Blank02'],
          Blank03: rs.recordset[i]['Blank03'],
          Blank04: rs.recordset[i]['Blank04'],
          Blank05: rs.recordset[i]['Blank05'],
          Blank06: rs.recordset[i]['Blank06'],
          Blank06: rs.recordset[i]['Blank06'],
          Blank07: rs.recordset[i]['Blank07'],
          Blank08: rs.recordset[i]['Blank08'],
          Blank09: rs.recordset[i]['Blank09'],
          Blank10: rs.recordset[i]['Blank10'],
          Card: rs.recordset[i]['Card'],
          ChildEdu: rs.recordset[i]['ChildEdu'],
          ChildNotEdu: rs.recordset[i]['ChildNotEdu'],
          Cola: rs.recordset[i]['Cola'],
          CompenTax: rs.recordset[i]['CompenTax'],
          Coop1_SAMCO: rs.recordset[i]['Coop1_SAMCO'],
          Coop1_SCB: rs.recordset[i]['Coop1_SCB'],
          Coop2_SAMCO: rs.recordset[i]['Coop2_SAMCO'],
          Coop2_SCB: rs.recordset[i]['Coop2_SCB'],
          CoopDebtAdd: rs.recordset[i]['CoopDebtAdd'],
          CoopSamco: rs.recordset[i]['CoopSamco'],
          Crem: rs.recordset[i]['Crem'],
          Crem_SAMCO: rs.recordset[i]['Crem_SAMCO'],
          DamageFee: rs.recordset[i]['DamageFee'],
          Diligent: rs.recordset[i]['Diligent'],
          Donate: rs.recordset[i]['Donate'],
          Emp_PF: rs.recordset[i]['Emp_PF'],
          Emp_SS: rs.recordset[i]['Emp_SS'],
          Extra1: rs.recordset[i]['Extra1'],
          Extra2: rs.recordset[i]['Extra2'],
          Form: rs.recordset[i]['Form'],
          IncOther1: rs.recordset[i]['IncOther1'],
          IncOther2: rs.recordset[i]['IncOther2'],
          IncOther3: rs.recordset[i]['IncOther3'],
          IncomeYTD: eYTD,
          Insurance: rs.recordset[i]['Insurance'],
          InsuranceDeves: rs.recordset[i]['InsuranceDeves'],
          JLDesc: rs.recordset[i]['JLDesc'],
          Law_Comp: rs.recordset[i]['Law_Comp'],
          LegalDpt: rs.recordset[i]['LegalDpt'],
          NetIncome: eNetIncome,
          NoDays: rs.recordset[i]['NoDays'],
          OT1: rs.recordset[i]['OT1'],
          OT2: rs.recordset[i]['OT2'],
          OT3: rs.recordset[i]['OT3'],
          OT15: rs.recordset[i]['OT15'],
          OT15S: rs.recordset[i]['OT15S'],
          OT_DF: rs.recordset[i]['OT_DF'],
          OT_HD: rs.recordset[i]['OT_HD'],
          OrgCode: rs.recordset[i]['OrgCode'],
          OrgName: rs.recordset[i]['OrgName'],
          Other3: rs.recordset[i]['Other3'],
          Other4: rs.recordset[i]['Other4'],
          Outtime: rs.recordset[i]['Outtime'],
          PFYTD: rs.recordset[i]['PFYTD'],
          PayDate: rs.recordset[i]['PayDate'],
          Return_Reward: rs.recordset[i]['Return_Reward'],
          Return_Wage: rs.recordset[i]['Return_Wage'],
          Reward: rs.recordset[i]['Reward'],
          Risk: rs.recordset[i]['Risk'],
          SLF: rs.recordset[i]['SLF'],
          SSYTD: rs.recordset[i]['SSYTD'],
          SSID: eSSID,
          SUN: rs.recordset[i]['SUN'],
          Salary: eSalary,
          SalaryDeduc: rs.recordset[i]['SalaryDeduc'],
          Tax: rs.recordset[i]['Tax'],
          TaxYTD: rs.recordset[i]['TaxYTD'],
          TaxPayType: rs.recordset[i]['TaxPayType'],
          Tax_N: rs.recordset[i]['Tax_N'],
          Telephone: rs.recordset[i]['Telephone'],
          TotalDed: rs.recordset[i]['TotalDed'],
          TotalInc: eTotalInc,
          Training: rs.recordset[i]['Training'],
          Wage: eWage,
          Wage_other: rs.recordset[i]['Wage_other'],
          Welfare: rs.recordset[i]['Welfare'],
          WorkPlace: rs.recordset[i]['WorkPlace'],
          Depart: rs.recordset[i]['Depart'],
        })
      }
    res.json({ datarow: arr, results: 'success', datapost: month.month })
  });
});
router.post('/mobiledropoffold', (req, res) => {
  //var month = JSON.parse(req.body.month);
  var month = req.body.month;
  var year = req.body.year;
  var empCode = req.body.empCode;
  var arr = [];
  var sql = `SELECT  *
  FROM            SAMCOS.dbo.V_dropoffold
  WHERE        (code = '${empCode}') AND (offmonth = '${month}') AND (offyear = '${year}')`
  pay.query(sql, (err, rs) => {
    if (err) res.json({ results: `error`, rows: sql });
    if (rs.recordset.length === 0)
      res.json({ results: `error` })
    else
      for (let i = 0; i < rs.rowsAffected[0]; i++) {
        var eSalary = CryptoJS.AES.decrypt(rs.recordset[i]['Salary'], 'Salary').toString(CryptoJS.enc.Utf8);
        var eNetIncome = CryptoJS.AES.decrypt(rs.recordset[i]['NetIncome'], 'NetIncome').toString(CryptoJS.enc.Utf8);
        var eTotalInc = CryptoJS.AES.decrypt(rs.recordset[i]['TotalInc'], 'TotalInc').toString(CryptoJS.enc.Utf8);
        var eYTD = CryptoJS.AES.decrypt(rs.recordset[i]['IncomeYTD'], 'Income-YTD').toString(CryptoJS.enc.Utf8);
        var eSSID = CryptoJS.AES.decrypt(rs.recordset[i]['SSID'], 'SSID').toString(CryptoJS.enc.Utf8);
        var eWage = CryptoJS.AES.decrypt(rs.recordset[i]['Wage'], 'Wage').toString(CryptoJS.enc.Utf8);

        arr.push({
          offmonth: rs.recordset[i]['offmonth'],
          offmonthName: rs.recordset[i]['offmonthName'],
          monthinis: rs.recordset[i]['monthinis'],
          offyear: rs.recordset[i]['offyear'],
          DateOff: rs.recordset[i]['DateOff'],
          userIM: rs.recordset[i]['userIM'],
          code: rs.recordset[i]['code'],
          ThaiName: rs.recordset[i]['ThaiName'],
          EngName: rs.recordset[i]['EngName'],
          BankAccount: rs.recordset[i]['BankAccount'],
          Advance: rs.recordset[i]['Advance'],
          Allowance: rs.recordset[i]['Allowance'],
          AppCrem: rs.recordset[i]['AppCrem'],
          App_Coop_SAMCO: rs.recordset[i]['App_Coop_SAMCO'],
          BackPay: rs.recordset[i]['BackPay'],
          Blank01: rs.recordset[i]['Blank01'],
          Blank02: rs.recordset[i]['Blank02'],
          Blank03: rs.recordset[i]['Blank03'],
          Blank04: rs.recordset[i]['Blank04'],
          Blank05: rs.recordset[i]['Blank05'],
          Blank06: rs.recordset[i]['Blank06'],
          Blank06: rs.recordset[i]['Blank06'],
          Blank07: rs.recordset[i]['Blank07'],
          Blank08: rs.recordset[i]['Blank08'],
          Blank09: rs.recordset[i]['Blank09'],
          Blank10: rs.recordset[i]['Blank10'],
          Card: rs.recordset[i]['Card'],
          ChildEdu: rs.recordset[i]['ChildEdu'],
          ChildNotEdu: rs.recordset[i]['ChildNotEdu'],
          Cola: rs.recordset[i]['Cola'],
          CompenTax: rs.recordset[i]['CompenTax'],
          Coop1_SAMCO: rs.recordset[i]['Coop1_SAMCO'],
          Coop1_SCB: rs.recordset[i]['Coop1_SCB'],
          Coop2_SAMCO: rs.recordset[i]['Coop2_SAMCO'],
          Coop2_SCB: rs.recordset[i]['Coop2_SCB'],
          CoopDebtAdd: rs.recordset[i]['CoopDebtAdd'],
          CoopSamco: rs.recordset[i]['CoopSamco'],
          Crem: rs.recordset[i]['Crem'],
          Crem_SAMCO: rs.recordset[i]['Crem_SAMCO'],
          DamageFee: rs.recordset[i]['DamageFee'],
          Diligent: rs.recordset[i]['Diligent'],
          Donate: rs.recordset[i]['Donate'],
          Emp_PF: rs.recordset[i]['Emp_PF'],
          Emp_SS: rs.recordset[i]['Emp_SS'],
          Extra1: rs.recordset[i]['Extra1'],
          Extra2: rs.recordset[i]['Extra2'],
          Form: rs.recordset[i]['Form'],
          IncOther1: rs.recordset[i]['IncOther1'],
          IncOther2: rs.recordset[i]['IncOther2'],
          IncOther3: rs.recordset[i]['IncOther3'],
          IncomeYTD: eYTD,
          Insurance: rs.recordset[i]['Insurance'],
          InsuranceDeves: rs.recordset[i]['InsuranceDeves'],
          JLDesc: rs.recordset[i]['JLDesc'],
          Law_Comp: rs.recordset[i]['Law_Comp'],
          LegalDpt: rs.recordset[i]['LegalDpt'],
          NetIncome: eNetIncome,
          NoDays: rs.recordset[i]['NoDays'],
          OT1: rs.recordset[i]['OT1'],
          OT2: rs.recordset[i]['OT2'],
          OT3: rs.recordset[i]['OT3'],
          OT15: rs.recordset[i]['OT15'],
          OT15S: rs.recordset[i]['OT15S'],
          OT_DF: rs.recordset[i]['OT_DF'],
          OT_HD: rs.recordset[i]['OT_HD'],
          OrgCode: rs.recordset[i]['OrgCode'],
          OrgName: rs.recordset[i]['OrgName'],
          Other3: rs.recordset[i]['Other3'],
          Other4: rs.recordset[i]['Other4'],
          Outtime: rs.recordset[i]['Outtime'],
          PFYTD: rs.recordset[i]['PFYTD'],
          PayDate: rs.recordset[i]['PayDate'],
          Return_Reward: rs.recordset[i]['Return_Reward'],
          Return_Wage: rs.recordset[i]['Return_Wage'],
          Reward: rs.recordset[i]['Reward'],
          Risk: rs.recordset[i]['Risk'],
          SLF: rs.recordset[i]['SLF'],
          SSYTD: rs.recordset[i]['SSYTD'],
          SSID: eSSID,
          SUN: rs.recordset[i]['SUN'],
          Salary: eSalary,
          SalaryDeduc: rs.recordset[i]['SalaryDeduc'],
          Tax: rs.recordset[i]['Tax'],
          TaxYTD: rs.recordset[i]['TaxYTD'],
          TaxPayType: rs.recordset[i]['TaxPayType'],
          Tax_N: rs.recordset[i]['Tax_N'],
          Telephone: rs.recordset[i]['Telephone'],
          TotalDed: rs.recordset[i]['TotalDed'],
          TotalInc: eTotalInc,
          Training: rs.recordset[i]['Training'],
          Wage: eWage,
          Wage_other: rs.recordset[i]['Wage_other'],
          Welfare: rs.recordset[i]['Welfare'],
          WorkPlace: rs.recordset[i]['WorkPlace'],
          Depart: rs.recordset[i]['Depart'],
        })
      }
    res.json({ datarow: arr, results: 'success', datapost: month.month })
  });
});
router.get('/dropoff', async (req, res) => {
  var sql = `SELECT  * FROM SAMCOS.dbo.V_dropoff `;
  pay.query(sql, (err, recordset) => {
    res.send(recordset.recordset)
  })
});
router.get('/appvsersion', async (req, res) => {
  var sql = `SELECT  TOP (1) PERCENT appName, appVersion, appNumber, appNote, appUpdate,appUrl
  FROM  SAMCOS.dbo.DropoffVersion
  ORDER BY appNumber DESC`;
  pay.query(sql, (err, recordset) => {
    // res.send(recordset.recordset)
    res.json({ results: `success`, rows: recordset.recordset })

  })
});
router.post('/dropoff', (req, res) => {
  var month = req.body.month;
  var year = req.body.year;
  var userim = req.body.userim;
  var sql = `SELECT  *
  FROM            SAMCOS.dbo.V_dropoff
  WHERE        (code = '383061') AND (offmonth = '${month.value}') AND (offyear = '${year}')`
  pay.query(sql, (err, recordset) => {
    if (err) res.json({ results: `error`, rows: sql });
    if (recordset.recordset.length === 0)
      res.json({ results: `error`, rows: month.value })
    else
      res.json({ datarow: recordset.recordset, results: 'success', monthpost: month.value, yearpost: year })
  });
});
router.post('/userlogin', (req, res) => {
  //var user =  '384141';// req.body.user;
  //var password = '3100503771825';//req.body.password;

  var user = req.body.user;
  var password = req.body.password;
  let strsql = `SELECT *
    FROM  SAMCOS.dbo.DropOffUsers
    WHERE   (code = '${user}') `
  pay.query(strsql, (err, results) => {
    const dbpass = results.recordset[0]['Password'];
    // console.log(dbpass)
    if (results.recordset.length === 0) {
      res.json({ datarow: 0, detail: 'empty' })
    } else {
      const pass = bcrypt.compareSync(password, dbpass);
      if (pass === true) {
        res.json({ datarow: results.recordset, detail: 'success' })
      } else {
        res.json({ datarow: 0, detail: 'wrong' })
      }
    }
  })
});
router.post('/dropOffchangepassword', (req, res) => {
  var code = req.body.code;
  var oldPass = req.body.oldPass;
  var curentHash = req.body.curentHash;
  var password = req.body.password;
  const pass = bcrypt.compareSync(oldPass, curentHash);
  var callb = { oldPass, curentHash, password, pass };
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  if (pass != true) {
    res.json({ 'results': `error`, 'detail': 'incorrect password', 'status': '0' })
  } else {
    let strsql = `UPDATE   SAMCOS.dbo.DropOffUsers SET Password='${hash}'
    WHERE   (code = '${code}') `
    pay.query(strsql, (err, results) => {
      if (results.rowsAffected[0] == 1) {
        res.json({ 'results': `success`, 'detail': "successful", 'status': '1' })
      } else {
        res.json({ 'results': `error`, 'detail': "Something went wrong", 'status': '9' })
      }
    })
  }
})
router.get('/getconvertor', (req, res) => {
  let strsql = `SELECT EmpCode, MoneyDesc, OrgCode, TransAmt FROM  SAMCOS.dbo.HRConvertor`;
  pay.query(strsql, (err, recordset) => {
    if (err) res.json({ results: `error`, rows: sql });
    if (recordset.recordset.length === 0)
      res.json({ results: `error`, rows: month.value })
    else
      res.json({ datarow: recordset.recordset, results: 'success' })
  });
});
router.post('/hrconvertor', async (req, res) => {
  var values = req.body.dataobj;
  var userim = req.body.userim;
  let strsql = `DELETE FROM  SAMCOS.dbo.HRConvertor `;
  pay.query(strsql);
  const table = new sql.Table('SAMCOS.dbo.HRConvertor');
  table.create = true;
  table.columns.add('EmpCode', sql.NVarChar(50), { nullable: false });
  table.columns.add('MoneyDesc', sql.NVarChar(150), { nullable: true });
  table.columns.add('OrgCode', sql.NVarChar(50), { nullable: true });
  table.columns.add('OrgNameThai', sql.NVarChar(150), { nullable: true });
  table.columns.add('PersonFNameThai', sql.NVarChar(150), { nullable: false });
  table.columns.add('PersonLNameThai', sql.NVarChar(128), { nullable: true });
  table.columns.add('TransAmt', sql.NVarChar(128), { nullable: false });
  table.columns.add('UserIm', sql.NVarChar(128), { nullable: false });
  for (let j = 0; j < values.length; j += 1) {
    table.rows.add(
      values[j]['EmpCode'],
      values[j]['MoneyDesc'],
      values[j]['OrgCode'],
      values[j]['OrgNameThai'],
      values[j]['PersonFNameThai'],
      values[j]['PersonLNameThai'],
      values[j]['TransAmt'],
      userim,
    );
  };
  const request = new sql.Request();
  return await request.bulk(table)
    .then(data => {
      // console.log(data);
      res.json({ 'results': `success`, 'requestrow': `${data.rowsAffected}` })
    })
    .catch(err => {
      // console.log(err);
      res.json({ 'results': `error` })
    });

})
router.post('/userdropoff', async (req, res) => {
  var values = req.body.dataobj;
  var userim = req.body.userim;
  const table = new sql.Table('SAMCOS.dbo.DropOffUsers');
  table.create = true;
  table.columns.add('code', sql.NVarChar(50), { nullable: false, primary: true });
  table.columns.add('EngName', sql.NVarChar(150), { nullable: true });
  table.columns.add('OrgCode', sql.NVarChar(50), { nullable: true });
  table.columns.add('OrgName', sql.NVarChar(150), { nullable: true });
  table.columns.add('SSID', sql.NVarChar(50), { nullable: false });
  table.columns.add('ThaiName', sql.NVarChar(150), { nullable: false });
  table.columns.add('WorkPlace', sql.NVarChar(128), { nullable: true });
  table.columns.add('Password', sql.NVarChar(128), { nullable: false });
  for (let j = 0; j < values.length; j += 1) {
    const ssid = `${values[j]['SSID']}`;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(ssid, salt);
    table.rows.add(
      values[j]['code'],
      values[j]['EngName'],
      values[j]['OrgCode'],
      values[j]['OrgName'],
      '',
      values[j]['ThaiName'],
      values[j]['WorkPlace'],
      hash,
    );
  };
  const request = new sql.Request();
  return await request.bulk(table)
    .then(data => {
      // console.log(data);
      res.json({ 'results': `success`, 'requestrow': `${data.rowsAffected}` })
    })
    .catch(err => {
      // console.log(err);
      res.json({ 'results': `error` })
    });
})
router.post('/postdropoff', async (req, res) => {
  var values = req.body.dataobj;
  var userim = req.body.userim;
  var month = req.body.month;
  var year = req.body.year;
  var sqlinto = "insert into SAMCOS.dbo.DropoffOld select * from SAMCOS.dbo.DropOff";
  // pay.query(sqlinto).then(rs)
  pay.query(sqlinto, async (err, recordset) => {
    //console.log(recordset.rowsAffected[0]);
    //if (recordset.rowsAffected[0] !== 0){
    const strsql = `DELETE FROM  SAMCOS.dbo.DropOff `;
    await pay.query(strsql);
    const table = new sql.Table('SAMCOS.dbo.DropOff');
    table.create = true;
    table.columns.add('offmonth', sql.NVarChar(50), { nullable: true });
    table.columns.add('offmonthName', sql.NVarChar(128), { nullable: true });
    table.columns.add('monthinis', sql.NVarChar(128), { nullable: true });
    table.columns.add('offyear', sql.NVarChar(128), { nullable: true });
    table.columns.add('DateOff', sql.NVarChar(128), { nullable: true });
    table.columns.add('userIM', sql.NVarChar(128), { nullable: true });
    table.columns.add('code', sql.NVarChar(50), { nullable: false });
    table.columns.add('ThaiName', sql.NVarChar(250), { nullable: false });
    table.columns.add('EngName', sql.NVarChar(250), { nullable: true });
    table.columns.add('BankAccount', sql.NVarChar(128), { nullable: false });
    table.columns.add('Advance', sql.NVarChar(128), { nullable: true });
    table.columns.add('Allowance', sql.NVarChar(128), { nullable: true });
    table.columns.add('AppCrem', sql.NVarChar(128), { nullable: true });
    table.columns.add('App_Coop_SAMCO', sql.NVarChar(128), { nullable: true });
    table.columns.add('BackPay', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank01', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank02', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank03', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank04', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank05', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank06', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank07', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank08', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank09', sql.NVarChar(128), { nullable: true });
    table.columns.add('Blank10', sql.NVarChar(128), { nullable: true });
    table.columns.add('Card', sql.NVarChar(128), { nullable: true });
    table.columns.add('Child-Edu', sql.NVarChar(128), { nullable: true });
    table.columns.add('Child-NotEdu', sql.NVarChar(128), { nullable: true });
    table.columns.add('Cola', sql.NVarChar(128), { nullable: true });
    table.columns.add('CompenTax', sql.NVarChar(128), { nullable: true });
    table.columns.add('Coop1_SAMCO', sql.NVarChar(128), { nullable: true });
    table.columns.add('Coop1_SCB', sql.NVarChar(128), { nullable: true });
    table.columns.add('Coop2_SAMCO', sql.NVarChar(128), { nullable: true });
    table.columns.add('Coop2_SCB', sql.NVarChar(128), { nullable: true });
    table.columns.add('CoopDebtAdd', sql.NVarChar(128), { nullable: true });
    table.columns.add('CoopSamco', sql.NVarChar(128), { nullable: true });
    table.columns.add('Crem', sql.NVarChar(128), { nullable: true });
    table.columns.add('Crem_SAMCO', sql.NVarChar(128), { nullable: true });
    table.columns.add('DamageFee', sql.NVarChar(128), { nullable: true });
    table.columns.add('Diligent', sql.NVarChar(128), { nullable: true });
    table.columns.add('Donate', sql.NVarChar(128), { nullable: true });
    table.columns.add('Emp_PF', sql.NVarChar(128), { nullable: true });
    table.columns.add('Emp_SS', sql.NVarChar(128), { nullable: true });
    table.columns.add('Extra1', sql.NVarChar(128), { nullable: true });
    table.columns.add('Extra2', sql.NVarChar(128), { nullable: true });
    table.columns.add('Form', sql.NVarChar(128), { nullable: true });
    table.columns.add('IncOther1', sql.NVarChar(128), { nullable: true });
    table.columns.add('IncOther2', sql.NVarChar(128), { nullable: true });
    table.columns.add('IncOther3', sql.NVarChar(128), { nullable: true });
    table.columns.add('Income-YTD', sql.NVarChar(128), { nullable: true });
    table.columns.add('Insurance', sql.NVarChar(128), { nullable: true });
    table.columns.add('InsuranceDeves', sql.NVarChar(128), { nullable: true });
    table.columns.add('JLDesc', sql.NVarChar(228), { nullable: true });
    table.columns.add('Law_Comp', sql.NVarChar(128), { nullable: true });
    table.columns.add('LegalDpt', sql.NVarChar(128), { nullable: true });
    table.columns.add('NetIncome', sql.NVarChar(128), { nullable: true });
    table.columns.add('NoDays', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT1', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT2', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT3', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT15', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT15S', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT_DF', sql.NVarChar(128), { nullable: true });
    table.columns.add('OT_HD', sql.NVarChar(128), { nullable: true });
    table.columns.add('OrgCode', sql.NVarChar(128), { nullable: true });
    table.columns.add('OrgName', sql.NVarChar(250), { nullable: true });
    table.columns.add('Other3', sql.NVarChar(128), { nullable: true });
    table.columns.add('Other4', sql.NVarChar(128), { nullable: true });
    table.columns.add('Outtime', sql.NVarChar(128), { nullable: true });
    table.columns.add('PF-YTD', sql.NVarChar(128), { nullable: true });
    table.columns.add('PayDate', sql.NVarChar(128), { nullable: true });
    table.columns.add('Return_Reward', sql.NVarChar(128), { nullable: true });
    table.columns.add('Return_Wage', sql.NVarChar(128), { nullable: true });
    table.columns.add('Reward', sql.NVarChar(128), { nullable: true });
    table.columns.add('Risk', sql.NVarChar(128), { nullable: true });
    table.columns.add('SLF', sql.NVarChar(128), { nullable: true });
    table.columns.add('SS-YTD', sql.NVarChar(128), { nullable: true });
    table.columns.add('SSID', sql.NVarChar(128), { nullable: true });
    table.columns.add('SUN', sql.NVarChar(128), { nullable: true });
    table.columns.add('Salary', sql.NVarChar(128), { nullable: false });
    table.columns.add('SalaryDeduc', sql.NVarChar(250), { nullable: true });
    table.columns.add('Tax', sql.NVarChar(128), { nullable: true });
    table.columns.add('Tax-YTD', sql.NVarChar(128), { nullable: true });
    table.columns.add('TaxPayType', sql.NVarChar(128), { nullable: true });
    table.columns.add('Tax_N', sql.NVarChar(128), { nullable: true });
    table.columns.add('Telephone', sql.NVarChar(128), { nullable: true });
    table.columns.add('TotalDed', sql.NVarChar(128), { nullable: true });
    table.columns.add('TotalInc', sql.NVarChar(128), { nullable: true });
    table.columns.add('Training', sql.NVarChar(128), { nullable: true });
    table.columns.add('Wage', sql.NVarChar(128), { nullable: true });
    table.columns.add('Wage_other', sql.NVarChar(128), { nullable: true });
    table.columns.add('Welfare', sql.NVarChar(128), { nullable: true });
    table.columns.add('WorkPlace', sql.NVarChar(128), { nullable: true });
    table.columns.add('Depart', sql.NVarChar(128), { nullable: true });
    var dayoff = ("0" + date_ob.getDate()).slice(-2) + '/' + ("0" + (date_ob.getMonth() + 1)).slice(-2) + '/' + date_ob.getFullYear();
    for (let j = 0; j < values.length; j += 1) {
      var eNetIncome = CryptoJS.AES.encrypt(values[j]['NetIncome'].toString(), 'NetIncome').toString();
      var eSalary = CryptoJS.AES.encrypt(values[j]['Salary'].toString(), 'Salary').toString();
      var eTotalInc = CryptoJS.AES.encrypt(values[j]['TotalInc'].toString(), 'TotalInc').toString();
      var eIncomeYTD = CryptoJS.AES.encrypt(values[j]['Income-YTD'].toString(), 'Income-YTD').toString();
      var eSSID = CryptoJS.AES.encrypt(values[j]['SSID'].toString(), 'SSID').toString();
      var eWage = CryptoJS.AES.encrypt(values[j]['Wage'].toString(), 'Wage').toString();
      table.rows.add(
        month.value, month.viewValue, month.inis, year, dayoff, userim,
        values[j]['code'],
        values[j]['ThaiName'], values[j]['EngName'], values[j]['BankAccount'], values[j]['Advance'], values[j]['Allowance'], values[j]['AppCrem'],
        values[j]['App_Coop_SAMCO'], values[j]['BackPay'], values[j]['Blank01'], values[j]['Blank02'], values[j]['Blank03'], values[j]['Blank04'], values[j]['Blank05'],
        values[j]['Blank06'], values[j]['Blank07'], values[j]['Blank08'], values[j]['Blank09'], values[j]['Blank10'], values[j]['Card'], values[j]['Child-Edu'],
        values[j]['Child-NotEdu'], values[j]['Cola'], values[j]['CompenTax'], values[j]['Coop1_SAMCO'], values[j]['Coop1_SCB'], values[j]['Coop2_SAMCO'], values[j]['Coop2_SCB'],
        values[j]['CoopDebtAdd'], values[j]['CoopSamco'], values[j]['Crem'], values[j]['Crem_SAMCO'], values[j]['DamageFee'], values[j]['Diligent'], values[j]['Donate'],
        values[j]['Emp_PF'], values[j]['Emp_SS'], values[j]['Extra1'], values[j]['Extra2'], values[j]['Form'], values[j]['IncOther1'], values[j]['IncOther2'], values[j]['IncOther3'],
        eIncomeYTD, values[j]['Insurance'], values[j]['InsuranceDeves'], values[j]['JLDesc'], values[j]['Law_Comp'], values[j]['LegalDpt'], eNetIncome,
        values[j]['NoDays'], values[j]['OT1'], values[j]['OT2'], values[j]['OT3'], values[j]['OT15'], values[j]['OT15S'], values[j]['OT_DF'], values[j]['OT_HD'], values[j]['OrgCode'],
        values[j]['OrgName'], values[j]['Other3'], values[j]['Other4'], values[j]['Outtime'], values[j]['PF-YTD'], values[j]['PayDate'],
        values[j]['Return_Reward'], values[j]['Return_Wage'], values[j]['Reward'], values[j]['Risk'], values[j]['SLF'], values[j]['SS-YTD'], eSSID, values[j]['SUN'],
        eSalary, values[j]['SalaryDeduc'], values[j]['Tax'], values[j]['Tax-YTD'], values[j]['TaxPayType'], values[j]['Tax_N'], values[j]['Telephone'], values[j]['TotalDed'], eTotalInc,
        values[j]['Training'], eWage, values[j]['Wage_other'], values[j]['Welfare'], values[j]['WorkPlace'], values[j]['Depart'],
      );
    }
    const request = new sql.Request();
    return await request.bulk(table)
      // const results = await request.bulk(table);
      // res.json({ 'results': `success`, 'requestrow': `${results.rowsAffected}` })
      //console.log(`rows affected ${results.rowsAffected}`);
      .then(data => {
        // console.log(data);
        res.json({ 'results': `success`, 'requestrow': `${data.rowsAffected}` })
      })
      .catch(err => {
        // console.log(err);
        res.json({ 'results': `error` })
      });

    // }
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

module.exports = router;