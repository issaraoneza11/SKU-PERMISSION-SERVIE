const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Responsedata = require("../middleware/response");

const databaseContextPg = require("database-context-pg");
const connectionSetting = require("../dbconnect");
const cryptoOption = require("../cryptoSetting");
const authRouter = require("./auth");
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const moment = require("moment");
var multiparty = require("multiparty");
const { decrypt } = require("../cryptoSetting");
const { log } = require("util");



const calSkip = (page, size) => {
  return (page - 1) * size;
};





router.get("/getAdminList", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const authHeader = req.headers.authorization;

    
    const tmp = await condb.clientQuery(
        `SELECT * FROM identity_user WHERE usr_ut_id = $1;
            `,
        [
          '442bbfca-d918-4dc5-ae6c-5d2f8cc15a22', //admin type
  
        ]
    );  


    return response.success(tmp.rows);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorMessage: error.message,
      },
    ]);
  }
});

router.get("/getVendor/:id", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const { id } = req.params;

    const tmp = await condb.clientQuery(
      `SELECT * FROM vendor WHERE vd_id = $1;
          `,
      [
        id

      ]

    );
    console.log( tmp.rows[0].vd_id);


    const user = await condb.clientQuery(
      `SELECT * FROM user_vendor WHERE uv_vd_id = $1;
          `,
      [
          tmp.rows[0].vd_id

      ]

    );

    return response.success({
      vd: tmp.rows[0],
      uservd:user.rows.length
    });

   


   
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorMessage: error.message,
      },
    ]);
  }
});


router.post("/filterVendorUser", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {

      const authHeader = req.headers.authorization;
      const model = req.body;
      
          let current = model.current || 1;
          let pageSize = model.pageSize || 10;
      let queryStr = `SELECT * FROM user_vendor LEFT JOIN identity_user on usr_id = uv_usr_id WHERE uv_is_use = true 
      AND uv_vd_id =$1 Order by uv_created_date DESC
      
      limit ${pageSize} offset ${calSkip(current, pageSize)}
      ;`;
     

      const tmp = await condb.clientQuery(
          queryStr,[
              model.id  
          ]
         
      );


      let queryCount = `SELECT COUNT(*) FROM user_vendor LEFT JOIN identity_user on usr_id = uv_usr_id WHERE uv_is_use = true 
      AND uv_vd_id =$1
      
     
      ;`;
     
      const tmpCount = await condb.clientQuery(
          queryCount,[
              model.id
          ]
      );

    
          let tmpData = {
              data:tmp.rows,
              countData:tmpCount.rows[0].count || 0,
          };
      return response.success(tmpData);
  } catch (error) {
      return response.error([
          {
              errorcode: 400,
              errorMessage: error.message,
          },
      ]);
  }
});

router.get("/switchUserVendor/:id/:checked", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const { id,checked } = req.params;

   await condb.clientQuery(
      `UPDATE user_vendor
      SET  uv_is_active = $2
      WHERE uv_id=$1;`,
      [
        id,
        checked === 'true' ? false: true
      ]

    );
    

    return response.success(true);

   


   
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorMessage: error.message,
      },
    ]);
  }
});




router.post("/updatePermissionBrand", [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
  
        const authHeader = req.headers.authorization;
        const model = req.body;
        await condb.clientQuery(
            `DELETE FROM permission_brand WHERE pb_brand_id = $1`,
            [
               
               model.brand_id,// brand_id 
          
            ]
      
          );
        for(let i of model.data){
            let id = uuidv4();
            await condb.clientQuery(
                `INSERT INTO permission_brand(
                    pb_id, pb_usr_id, pb_brand_id, pb_is_use, pb_created_date, pb_updated_date)
                    VALUES ($1, $2, $3, $4, $5, $6);`,
                [
                   id,
                   i.value,//user_id,
                   model.brand_id,// brand_id 
                   true,
                   new Date(),
                   new Date(),
                ]
          
              );
        }
    
         
        return response.success(true);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
  });


  router.post("/getPermissionBrandList", [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
  
        const authHeader = req.headers.authorization;
        const model = req.body;
        let dataArr = [];
        for(let i of model){
            let temp = await condb.clientQuery(
                `SELECT * FROM permission_brand LEFT JOIN identity_user ON usr_id = pb_usr_id WHERE pb_brand_id = $1`,
                [
                   
                   i.brand_id,// brand_id 
              
                ]
          
              );
              let arr = [];
              for(let item of temp.rows){
                let tmp = {
                    label:`${item.usr_first_name} ${item.usr_last_name}`,
                    text:`${item.usr_first_name} ${item.usr_last_name}`,
                    value:item.usr_id
                }
                arr.push(tmp);
              }
              dataArr.push(arr)
        }
      
        
         
        return response.success(dataArr);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
  });


module.exports = router;
