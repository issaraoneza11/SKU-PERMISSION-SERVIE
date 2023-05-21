const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Responsedata = require('../middleware/response');

const cryptoOption = require("../cryptoSetting");
const connectionSetting = require("../dbconnect");
const databaseContextPg = require("database-context-pg");

const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const moment = require('moment');
var multiparty = require('multiparty');
const { decrypt } = require('../cryptoSetting');
const { mode } = require('crypto-js');

const uploadService = require("../lib/api/upload");

const filterUser = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const { trailer_id } = req.params;
        const model = req.body;

        var userTable = await condb.clientQuery(
            `SELECT id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, user_profile, token, token_create, token_expired, create_date, is_use, user_profile_name, user_profile_path, is_passchange
            FROM identity_user where 
                ($1::text is null or name ILIKE '%' || $1 || '%') and 
                ($2::text is null or sirname ILIKE '%' || $2 || '%') and 
                ($3::text is null or username ILIKE '%' || $3 || '%') and 
                is_use = true and company_id = $4 ORDER BY create_date DESC
                ;`
            , [model.name || null, model.sirname || null, model.username || null, model.company_id]);


        return response.success(userTable.rows);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};
router.post("/filterUser", [authenticateToken], filterUser);

/* =========================================================== */

const changActive = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const { trailer_id } = req.params;
        const user_id = req.params.id;

        let chang = await condb.clientQuery(
            `SELECT id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, user_profile, token, token_create, token_expired, create_date, is_use, user_profile_name, user_profile_path, is_passchange
            FROM identity_user where id = $1;`
            , [user_id]);
        var act = false;
        if (chang.rows[0].is_active === true) {
            act = false;
        } else if (chang.rows[0].is_active === false) {
            act = true;
        } else {
            return response.error([
                {
                    errorcode: 400,
                    errorMessage: 'What Wrong!!',
                },
            ]);
        }
        await condb.clientQuery(
            `UPDATE identity_user
                SET is_active=$2
                WHERE id=$1;`
            , [user_id, act]);



        return response.success(true);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
};
router.get("/changActive/:id", [authenticateToken], changActive);

/* =========================================================== */

const delUser = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const { trailer_id } = req.params;
        const user_id = req.params.id;

        await condb.clientQuery(
            `UPDATE identity_user
                SET is_use = false
                WHERE id=$1;`
            , [user_id]);



        return response.success(true);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
};
router.get("/delUser/:id", [authenticateToken], delUser);

/* =========================================================== */

const addUser = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        const api_upload = new uploadService();
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const user_token = response.getPayloadData();
        const model = req.body;

        var checkUser = await condb.clientQuery(
            `SELECT id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, user_profile, token, token_create, token_expired, create_date, 
            is_use, user_profile_name, user_profile_path, is_passchange
            FROM identity_user where company_id = $2 and username = $1 and is_use = true;`
            , [
                model.username,
                model.company_id,
            ]);
        if (checkUser.rows.length > 0) {
            return response.error([
                {
                    errorcode: 400,
                    errorMessage: 'This username is already',
                },
            ]);
        } else {
 
            let user_id = uuidv4();

            model.password = (model.password) ? cryptoOption.encrypt(model.password) : null;

            await condb.clientQuery(
                `INSERT INTO identity_user(
                        id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, 
                        user_profile, token, token_create, token_expired, create_date, is_use, user_profile_name, user_profile_path, is_passchange)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21);`
                , [
                    user_id,
                    model.company_id,
                    'c0fd1c11-da3e-439d-b3c3-54b4a187628d',
                    model.name,
                    model.sirname || null,
                    model.username,
                    model.email || null,
                    model.password,
                    model.mobile1 || null,
                    model.mobile2 || null,
                    model.detail || null,
                    model.is_active,
                    null,
                    null,
                    null,
                    null,
                    new Date(),
                    true,
                    model.imgProfile.length > 0 ? model.imgProfile[0].path : null,
                    model.imgProfile.length > 0 ? model.imgProfile[0].name : null,
                    null
                ]);


            let Upload2 = [];
            console.log('model',model);
      
                if(model.imgProfile.length > 0){
                    for(let item of model.imgProfile){
                        let temp2 = {
                            project_key: "66B-AdvanceBio",
                            is_image: false,
                            ref_id: user_id,
                            path_file: item.path,
                            file_name: item.name,
                            menu_id: "",
                            menu_name: "userManagement",
                            oem_id: '',
                            company_id: model.company_id,
                            user_id: user_token.fup,
                            is_save: item.is_save,
                        }
                        Upload2.push(temp2);
                    }
                    
                }
                let Upload3 = [];
             
                if (model.ImgUse.length > 0) {
                    for(let item2 of model.ImgUse){
                        let temp3 = {
                            project_key: "66B-AdvanceBio",
                            is_image: true,
                            ref_id: user_id,
                            path_file: item2.path,
                            file_name: item2.name,
                            menu_id: "",
                            menu_name: "userManagement",
                            oem_id: '',
                            company_id: model.company_id,
                            user_id: user_token.fup,
                            is_save: item2.is_save,
                        }
                        Upload2.push(temp3);
                    }
                }
               /*  console.log('ได้-',); */

          /*   if (model.imgProfile.length > 0 || model.ImgUse.length > 0) {
                    console.log('Upload2',Upload2); */

                    console.log('Uplaod',Upload2);
                    await api_upload.SaveFileUpload(token, Upload2);
       

          /*   } */

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
};
router.post("/addUser", [authenticateToken], addUser);

/* =========================================================== */

const getUserByID = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        const user_id = req.params.id;

        let byID = await condb.clientQuery(
            `SELECT id as user_id,* 
                FROM identity_user
                WHERE id=$1;`
            , [user_id]);

        byID.rows[0].password = cryptoOption.decrypt(byID.rows[0].password);

        return response.success(byID.rows[0]);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
};
router.get("/getUserByID/:id", [authenticateToken], getUserByID);

/* =========================================================== */

const editUser = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        const api_upload = new uploadService();
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const user_token = response.getPayloadData();
        const model = req.body;

        var checkUser = await condb.clientQuery(
            `SELECT id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, user_profile, token, token_create, token_expired, create_date, 
            is_use, user_profile_name, user_profile_path, is_passchange
            FROM identity_user where id != $1 and company_id = $3 and username = $2 and is_use = true;`
            , [
                model.user_id,
                model.username,
                model.company_id,
            ]);
        if (checkUser.rows.length > 0) {
            return response.error([
                {
                    errorcode: 400,
                    errorMessage: 'This username is already',
                },
            ]);
        } else {

            model.password = (model.password) ? cryptoOption.encrypt(model.password) : null;
       
            await condb.clientQuery(
                `UPDATE identity_user
                            SET 
                            name=$2, 
                            sirname=$3, 
                            username=$4, 
                            email=$5, 
                            password=$6, 
                            mobile1=$7, 
                            mobile2=$8,
                            detail=$9, 
                            is_active=$10, 
                            user_profile_name=$11,
                            user_profile_path=$12 
                        
                            WHERE id = $1;`
                , [
                    model.user_id,
                    model.name,
                    model.sirname || null,
                    model.username,
                    model.email || null,
                    model.password,
                    model.mobile1 || null,
                    model.mobile2 || null,
                    model.detail || null,
                    model.is_active,
                    model.ImgUse.length > 0 ? model.ImgUse[0].path : null,
                    model.ImgUse.length > 0 ? model.ImgUse[0].name : null,
                    
                ]);
            let Upload2 = [];
            console.log('model',model);
      
                if(model.imgProfile.length > 0){
                    for(let item of model.imgProfile){
                        let temp2 = {
                            project_key: "66B-AdvanceBio",
                            is_image: false,
                            ref_id: model.user_id,
                            path_file: item.path,
                            file_name: item.name,
                            menu_id: "",
                            menu_name: "userManagement",
                            oem_id: '',
                            company_id: model.company_id,
                            user_id: user_token.fup,
                            is_save: item.is_save,
                        }
                        Upload2.push(temp2);
                    }
                
                }
                let Upload3 = [];
             
                if (model.ImgUse.length > 0) {
                    for(let item2 of model.ImgUse){
                        let temp3 = {
                            project_key: "66B-AdvanceBio",
                            is_image: true,
                            ref_id: model.user_id,
                            path_file: item2.path,
                            file_name: item2.name,
                            menu_id: "",
                            menu_name: "userManagement",
                            oem_id: '',
                            company_id: model.company_id,
                            user_id: user_token.fup,
                            is_save: item2.is_save,
                        }
                        Upload2.push(temp3);
                    }
                }
               /*  console.log('ได้-',); */

          /*   if (model.imgProfile.length > 0 || model.ImgUse.length > 0) {
                    console.log('Upload2',Upload2); */

                    console.log('Uplaod',Upload2);
                    await api_upload.SaveFileUpload(token, Upload2);
       

          /*   } */

            /* if (model.ImgUse.length > 0) {
                if (model.ImgUse[0].path !== '' && model.ImgUse[0].path !== null) {
                    console.log('Upload3',Upload3);
                    await api_upload.SaveFileUpload(token, Upload3);
                }

            } */

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
};
router.post("/editUser", [authenticateToken], editUser);

/* ============================================================ */
const filterUserGetOEM = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const { trailer_id } = req.params;
        const model = req.body;

        var userTable = await condb.clientQuery(
            `SELECT id, company_id, admin_id, name, sirname, username, email, password, mobile1, mobile2, detail, is_active, user_profile, token, token_create, token_expired, create_date, is_use, user_profile_name, user_profile_path, is_passchange
            FROM identity_user where 
                ($1::text is null or name ILIKE '%' || $1 || '%') 
                 and
                ($2::text is null or sirname ILIKE '%' || $2 || '%') and  
                ($3::text is null or username ILIKE '%' || $3 || '%') and 
                is_use = true and company_id = $4 ORDER BY create_date DESC
                ;`
            , [model.name || null,model.sirname || null, model.username || null, model.company_id]);

            let temOEM = [];
            for(let item of userTable.rows){
                var listOem = await condb.clientQuery(
                    `SELECT a.*,b.*
                    FROM permission_oem a
                    left join oem b on a.oem_id = b.id
                    where a.user_id = $1 and b.is_active = true and b.is_use = true;`
                    , [item.id]); 

                    if(listOem.rows.length > 0){
                        item.oemlist = listOem.rows;
                    }else{
                        item.oemlist = [];
                    }
                    temOEM.push(item);
            }

            let finalTemp = [];
            if(model.oem_select_id !== ''){
                for(let i of temOEM){
                    var fiy = i.oemlist;
                    
                    if(fiy.length > 0){
                        let chek = fiy.filter((e)=>{return e.oem_id === model.oem_select_id})
                        if(chek.length > 0){
                            finalTemp.push(i);
                        }
                        /* console.log('fiy',i); */
                      
                    }
                }
                
            }else{
                finalTemp = temOEM;
            }
           

        return response.success(finalTemp);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};
router.post("/filterUserGetOEM", [authenticateToken], filterUserGetOEM);

/* =========================================================== */

const oembyUSerID = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        const user_id = req.params.id;
    
        let byID = await condb.clientQuery(
            `SELECT id as user_id,* 
                FROM identity_user
                WHERE id=$1;`
            , [user_id]);

       let get_OEm =  await condb.clientQuery(
            `SELECT id, user_id, oem_id, is_active
            FROM permission_oem
                WHERE user_id=$1;`
            , [byID.rows[0].id]);
          
           /*  if(get_OEm.rows.length > 0){
                for(let item of get_OEm.rows){
                    console.log('เจอนะครับ',item);
                    item.select = true;
                }
            } */
            byID.rows[0].listOEM = get_OEm.rows
          /*   console.log('เจอนะครับ', byID.rows[0]); */
        return response.success(byID.rows[0]);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorMessage: error.message,
            },
        ]);
    }
};
router.get("/oembyUSerID/:id", [authenticateToken], oembyUSerID);

/* =========================================================== */


module.exports = router;