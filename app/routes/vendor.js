const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Responsedata = require("../middleware/response");
const {
  filterMenuService,
  getUserByIdService,
  getOemByIdService,
  getOemByCompanyIdService,
} = require("../service/menu");
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
/* var _getUserIDByToken = authRouter.getUserIDByToken; */
const uploadService = require("../lib/api/upload");


const calSkip = (page, size) => {
  return (page - 1) * size;
};


router.post(
  "/get_all_Vendor",
  [
    /* authenticateToken */
  ],
  async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
      const model = req.body;
      const tmp = await condb.clientQuery(`SELECT * FROM vendor;`);
      return response.success(tmp.rows);
    } catch (error) {
      return response.error([
        {
          errorcode: 400,
          errorMessage: error.message,
        },
      ]);
    }
  }
);


const calSkip = (page, size) => {
  return (page - 1) * size;
};

router.post("/filterVendor", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader;
    const user_token = response.getPayloadData();

    const model = req.body;
    let field_sort = "vd_created_date";
    let sort_type = "DESC";
    if (model.field_sort == "update_date") {
      field_sort = "vd_updated_date";
    }

    if (model.sort_type == "ASC") {
      sort_type = "ASC";
    }

    let current = model.current || 1;
    let pageSize = model.pageSize || 10;

    let queryStr = `SELECT vd_id, vd_api_id, vd_code, vd_name, vd_coporate_no, vd_tel, vd_country_name, vd_province_name, vd_district_name, vd_sub_district_name, vd_zipcode, vd_email, vd_address, vd_organize_name, vd_business_type_name, vd_document_id, vd_document_path, vd_is_dbd, vd_account_type, vd_kyc_status, vd_is_active, vd_is_use, vd_created_date, vd_updated_date
    FROM vendor WHERE vd_is_use = true AND vd_name = $1 ORDER BY ${field_sort} ${sort_type}
    limit ${pageSize} offset ${calSkip(current, pageSize)} ;`;

    let queryCount = `SELECT vd_id, vd_api_id, vd_code, vd_name, vd_coporate_no, vd_tel, vd_country_name, vd_province_name, vd_district_name, vd_sub_district_name, vd_zipcode, vd_email, vd_address, vd_organize_name, vd_business_type_name, vd_document_id, vd_document_path, vd_is_dbd, vd_account_type, vd_kyc_status, vd_is_active, vd_is_use, vd_created_date, vd_updated_date
    FROM vendor WHERE vd_is_use = true AND vd_name = $1;`;

    const tmp = await condb.clientQuery(queryStr, [
      model.name || null,
    ]);

    const tmpCount = await condb.clientQuery(queryCount, [
      model.name || null,
    ]);


    let letven_name_list = `SELECT vd_id, vd_api_id, vd_code, vd_name, vd_coporate_no, vd_tel, vd_country_name, vd_province_name, vd_district_name, vd_sub_district_name, vd_zipcode, vd_email, vd_address, vd_organize_name, vd_business_type_name, vd_document_id, vd_document_path, vd_is_dbd, vd_account_type, vd_kyc_status, vd_is_active, vd_is_use, vd_created_date, vd_updated_date
    FROM vendor `;

    let tmpData = {
      data: tmp.rows,
      countData: tmpCount.rows[0].count || 0,
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
      AND uv_vd_id =$1
      
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

module.exports = router;
