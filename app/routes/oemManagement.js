const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Responsedata = require('../middleware/response');
const { filterMenuService, getUserByIdService, getOemByIdService, getOemByCompanyIdService } = require('../service/menu');
const databaseContextPg = require("database-context-pg");
const connectionSetting = require("../dbconnect");
const cryptoOption = require("../cryptoSetting");
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const moment = require('moment');
var multiparty = require('multiparty');
const { decrypt } = require('../cryptoSetting');
const uploadService = require("../lib/api/upload");

router.post("/filterOem", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    const model = req.body;

  /*   console.log(model) */

    if (model.date1 === null) {
      var datestar = null;
    } else {
      var datestar = moment(model.date1)
        .startOf("days")
        .format("YYYY-MM-DD HH:mm");
      if (model.date2 != null) {
        var dateend = moment(model.date2)
          .endOf("days")
          .format("YYYY-MM-DD HH:mm");
      } else {
        var dateend = moment(model.date1)
          .endOf("days")
          .format("YYYY-MM-DD HH:mm");
      }

    }


   /*  console.log(datestar, dateend) */

    var filterOem = await condb.clientQuery(
      `SELECT id as oem_id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort
	FROM oem WHERE is_use = true AND ($1::timestamp is null or create_date BETWEEN $1 and $2) AND ($3::text is null or name ILIKE '%' || $3 || '%') AND company_id =$4 Order by create_date DESC;
          `,
      [
        datestar || null,
        dateend || null,
        model.name,
        model.company_id
      ]
    );
   /*  console.log(filterOem.rows) */
    return response.success(filterOem.rows);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});

router.post("/activeOem", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    const model = req.body;

  /*   console.log(model) */

    await condb.clientQuery(
      `UPDATE oem
	SET is_active=$2
	WHERE id=$1;
          `,
      [
        model.oem_id,
        !model.active
      ]
    );

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});


router.get("/delOem/:id", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    const { id } = req.params;

   /*  console.log(id) */

    await condb.clientQuery(
      `UPDATE oem
	SET is_use= false
	WHERE id=$1;
          `,
      [
        id,
      ]
    );

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});

router.get("/getOem/:id", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);

  const error_list = [];
  try {
    const { id } = req.params;

/*     console.log(id) */

    var getOem = await condb.clientQuery(
      `SELECT id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort
	FROM oem WHERE id = $1;
          `,
      [
        id,
      ]
    );

    return response.success(getOem.rows);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});




router.post("/addOem", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const user_token = response.getPayloadData();
  const api_upload = new uploadService();
  const error_list = [];
  try {
    const model = req.body;

    var Chack = await condb.clientQuery(
      `SELECT id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort
	FROM oem WHERE name = $1;
          `,
      [
        model.Oem_name,
      ]
    );
    if (Chack.rows.length > 0) {
      return response.error([{
        errorcode: 400,
        errorMessage: `The latest version of ${model.Oem_name}  is now available.`
      }])
    } else {

      let oem_id = uuidv4();
      await condb.clientQuery(
        `INSERT INTO public.oem(
      id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
          `,
        [
          oem_id,
          '7c0bec40-2744-4a3b-8cef-02ddb0d11e2b',
          'c0fd1c11-da3e-439d-b3c3-54b4a187628d',
          model.Oem_name,
          null,
          new Date(),
          true,
          null,
          null,
          model.is_active,
          null,

        ]
      );


      let Upload = [];

      let temp = {
        project_key: "66B-AdvanceBio",
        is_image: true,
        ref_id: oem_id,
        path_file: model.Oem_logo_path,
        file_name: model.Oem_logo_name,
        menu_id: "",
        menu_name: "oemManagement",
        oem_id: '',
        company_id: '7c0bec40-2744-4a3b-8cef-02ddb0d11e2b',
        user_id: user_token.fup,
        is_save: true,
      }
      Upload.push(temp);

      if (model.Oem_logo_path !== '' && model.Oem_logo_name !== '') {

        await api_upload.SaveFileUpload(token, Upload);
      }

    }

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});

router.post("/updateOem", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const user_token = response.getPayloadData();
  const api_upload = new uploadService();
  const error_list = [];
  try {
    const model = req.body;
    /* console.log(model) */
    var Chack = await condb.clientQuery(
      `SELECT id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort
	FROM oem WHERE name = $1 AND id!=$2;
          `,
      [
        model.Oem_name,
        model.oem_id,
      ]
    );
    if (Chack.rows.length > 0) {
      return response.error([{
        errorcode: 400,
        errorMessage: `The latest version of ${model.Oem_name}  is now available.`
      }])
    } else {

      await condb.clientQuery(
        `UPDATE oem SET name=$2,is_active=$3 WHERE id=$1;
          `,
        [
          model.Oem_id,
          model.Oem_name,
          model.is_active,
        ]
      );


      let Upload = [];

      let temp = {
        project_key: "66B-AdvanceBio",
        is_image: true,
        ref_id: model.Oem_id,
        path_file: model.Oem_logo_path,
        file_name: model.Oem_logo_name,
        menu_id: "",
        menu_name: "oemManagement",
        oem_id: '',
        company_id: '7c0bec40-2744-4a3b-8cef-02ddb0d11e2b',
        user_id: user_token.fup,
        is_save: true,
      }
      Upload.push(temp);

      if (model.Oem_logo_path !== '' && model.Oem_logo_name !== '') {
        console.log(Upload)
        await api_upload.SaveFileUpload(token, Upload);
      }

    }

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});


/* ===================== User Relation OEM ====================================*/
router.post("/addRelationOemUSer", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const user_token = response.getPayloadData();
  const api_upload = new uploadService();
  const error_list = [];
  try {
    const model = req.body;
    let user_id = req.body.user_id;
    let elament = req.body.reala || [];

    console.log('REL',elament);

    for(let item of elament){

      if(item.select === true){
      var Chack = await condb.clientQuery(
              `SELECT id, user_id, oem_id, is_active
              FROM permission_oem where user_id = $1 and oem_id = $2`,
              [
                user_id,
                item.oem_id,
              ]);
              if(Chack.rows.length === 0){
                let re_id = uuidv4();
                await condb.clientQuery(
                  `INSERT INTO permission_oem(
                    id, user_id, oem_id, is_active)
                    VALUES ($1, $2, $3, $4);`,
                  [
                    re_id,
                    user_id,
                    item.oem_id,
                    true,
                  ]);
              }
      }else if(item.select === false){
        var getID = await condb.clientQuery(
          `SELECT id, user_id, oem_id, is_active
          FROM permission_oem where user_id = $1 and oem_id = $2`,
          [
            user_id,
            item.oem_id,
          ]);
          if(getID.rows.length > 0){
            let permisOEM_id = getID.rows[0].id
                 await condb.clientQuery(
                `DELETE FROM permission_menu
                WHERE permission_oem_id = $1;`,
                [
                  permisOEM_id
                ]);
                
            /* ลบจาก permistion oem */
            await condb.clientQuery(
              `DELETE FROM permission_oem
              WHERE id = $1;`,
              [
                permisOEM_id
              ]);
              /* ลบจาก เมนู */
         
          }
         

      }
     
      

    }





    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});




router.post("/filterOemByIsActive", [authenticateToken], async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    const model = req.body;

  /*   console.log(model) */

    if (model.date1 === null) {
      var datestar = null;
    } else {
      var datestar = moment(model.date1)
        .startOf("days")
        .format("YYYY-MM-DD HH:mm");
      if (model.date2 != null) {
        var dateend = moment(model.date2)
          .endOf("days")
          .format("YYYY-MM-DD HH:mm");
      } else {
        var dateend = moment(model.date1)
          .endOf("days")
          .format("YYYY-MM-DD HH:mm");
      }

    }


   /*  console.log(datestar, dateend) */

    var filterOem = await condb.clientQuery(
      `SELECT id as oem_id, company_id, admin_id, name, logo, create_date, is_use, logo_name, logo_path, is_active, sort
	FROM oem WHERE is_use = true AND ($1::timestamp is null or create_date BETWEEN $1 and $2) AND ($3::text is null or name ILIKE '%' || $3 || '%') AND company_id =$4 and is_active = true Order by create_date DESC;
          `,
      [
        datestar || null,
        dateend || null,
        model.name,
        model.company_id
      ]
    );
   /*  console.log(filterOem.rows) */
    return response.success(filterOem.rows);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
});

module.exports = router;