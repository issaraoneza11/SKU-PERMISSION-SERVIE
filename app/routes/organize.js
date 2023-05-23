const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Responsedata = require('../middleware/response');
const authFnc = require('../middleware/authFnc');
const jwt_decode = require ("jwt-decode");
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

const allconService = require("../lib/api/Allcon");

/* ============================================================ */
const changeOrganize = async (req, res, next) => {
    const response = new Responsedata(req, res);

    try {

     const { organize_id } = req.params;
        console.log(organize_id);
        const authHeader = req.headers.authorization;
        const token = authHeader;
        const user_token = response.getPayloadData();
        console.log("token",token)
        console.log("user",user_token)
        await condb.clientQuery(
            `UPDATE user_vendor
            SET  uv_updated_date=$2, uv_is_default=false
            WHERE uv_usr_id = $1 `
            , [
                user_token.user_id,
      
                new Date()
            ]);
        await condb.clientQuery(
            `UPDATE user_vendor
            SET  uv_updated_date=$3, uv_is_default=true
            WHERE uv_usr_id = $1 AND uv_vd_id = $2;`
            , [
                user_token.user_id,
                organize_id,
                new Date()
            ]);


   

            const api_allcon = new allconService();
            const userDetail = jwt_decode(user_token.access_token_allcon);
       
        
            let newToken;
           await authFnc.refreshToken(token,user_token).then(function(result){
                newToken = result; // Now you can use res everywhere
            });;
     /*        console.log("new",newToken) */
     const organizeById = await condb.clientQuery(
        `SELECT *
        FROM vendor WHERE 
        vd_id = $1
            ;`
        , [organize_id]);
            api_allcon.changeAllConOrganize(newToken.newAllconToken.access_token,organizeById.rows[0].vd_api_id);
           
            
             let all_organize_crate =  await api_allcon.getMasterOrganizeCreate(newToken.newAllconToken.access_token,{'accountId':userDetail.accountId});
     /*       console.log(all_organize_crate); */
            const vendorList = await condb.clientQuery(
                `SELECT *
                FROM user_vendor LEFT JOIN vendor ON vd_id = uv_vd_id WHERE 
                uv_usr_id = $1
                    ;`
                , [user_token.user_id]);
                for(let v of vendorList.rows){
                  v.is_create = false;
                  var checkCreate = all_organize_crate.items.filter((e)=>{return e.organizeId === v.vd_api_id});
                  if(checkCreate.length > 0){
                    //คนสร้าง
                    v.is_create = true;
                  }
                }
    
                let temp = {
                    status:true,
                    newToken:newToken.token,
                    vendor:vendorList.rows
                };
            return response.success(temp);


     
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};




const getDetailOrganizeList = async (req, res, next) => {
    const response = new Responsedata(req, res);

    try {

        const authHeader = req.headers.authorization;
        const token = authHeader;
/*         console.log(token) */
        const user_token = response.getPayloadData(token);
   /*      console.log(user_token) */
        const api_allcon = new allconService();
        const userDetail = jwt_decode(user_token.access_token_allcon);
   /*      console.log(userDetail) */
      

       
       let arr_list = [];
        for(let item of req.body){
            const vendorList = await condb.clientQuery(
                `SELECT *
                FROM vendor WHERE 
                vd_id = $1
                    ;`
                , [item.vendor_id]);
                let ven_name = '';
                if(vendorList.rows.length > 0){
                    ven_name = vendorList[0].vd_name || '';
                }
                arr_list.push(ven_name);
        }
      
       
           
        return response.success(arr_list);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};





router.get("/Change/:organize_id", [authenticateToken], changeOrganize);
router.post("/getDetailOrganizeList", [authenticateToken], getDetailOrganizeList);




module.exports = router;