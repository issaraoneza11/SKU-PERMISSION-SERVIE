var express = require("express");
var router = express.Router();

const jwt_decode = require ("jwt-decode");
const jwt = require("jwt-simple");
var moment = require("moment");
var JwtSetting = require("../jwtSetting");
const connectionSetting = require("../dbconnect");
const databaseContextPg = require("database-context-pg");
const Responsedata = require('../middleware/response');
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const allconService = require("../lib/api/Allcon");



const passport = require("passport");
passport.use(JwtSetting.jwtAuth);

const TokenEncode = (payload) => {
  return jwt.encode(payload, JwtSetting.SECRET);
};
const TokenDecode = (token) => {
  return jwt.decode(token, JwtSetting.SECRET);
};
const getUserIDByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.fup && payload.sys == "c") {
    return payload.fup;
  }
  return null;
};
const getAdminIDByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.fup && payload.sys == "s") {
    return payload.fup;
  }
  return null;
};
const getCompanyIdByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.com && payload.sys == "c") {
    return payload.com;
  }
  return null;
};
const getPayload = (token) => {
  return TokenDecode(token);
};
const requireJWTAuth = passport.authenticate("jwt", {
  session: false,
});




















router.post("/GenToken", async (req, res, next) => {
  /*   console.log("here", req.body) */
  const response = new Responsedata(req, res);
try{

/*   console.log(req.body) */
 /*        console.log(jwt_decode(req.body.access_token)) */
          const userDetail = jwt_decode(req.body.access_token);

         const check_permission =  await condb.clientQuery(
            `SELECT *
            FROM identity_user WHERE 
            "usr_accountId" = $1
                ;`
            , [userDetail.accountId]);


            if(check_permission.rows.length > 0) {

              allconService
              const api_allcon = new allconService();
              let tmpOr = {
                accountId:userDetail.accountId
              }
            let all_organize =  await api_allcon.getMasterOrganize(req.body.access_token,userDetail.accountId);
            let all_organize_crate =  await api_allcon.getMasterOrganizeCreate(req.body.access_token,tmpOr);
            let all_organize_invite =  await api_allcon.getMasterOrganizeInvite(req.body.access_token,tmpOr);

            console.log("all_organize",all_organize);
            console.log("all_organize_crate",all_organize_crate);
            console.log("all_organize_invite",all_organize_invite);
    
              const vendorList = await condb.clientQuery(
                `SELECT *
                FROM user_vendor LEFT JOIN vendor ON vd_id = uv_vd_id WHERE 
                uv_usr_id = $1
                    ;`
                , [check_permission.rows[0].usr_id]);
                for(let v of vendorList.rows){
                  v.is_create = false;
                  var checkCreate = all_organize_crate.items.filter((e)=>{return e.organizeId === v.vd_api_id});
                  if(checkCreate.length > 0){
                    //คนสร้าง
                    v.is_create = true;
                  }
                }
              var iat = moment(new Date());
              var exp = moment(new Date()).add(1, "days");

            
              const payload = {
                access_token_allcon:req.body.access_token,
                refresh_token:req.body.refresh_token,
                user_id:check_permission.rows[0].usr_id,
                
                iat: iat.unix(),
                exp: exp.unix(),
                exp_date: moment(exp).format('วันที่ DD-MM-yyyy เวลา HH:mm:ss'),
              };
              var token = TokenEncode(payload);


              let temp ={
                status:"login success",
                token:token,
                user:`${check_permission.rows[0].usr_first_name}   ${check_permission.rows[0].usr_last_name}`,
                vendor:vendorList.rows
              }
              return response.success(temp);
            }else{
              return response.error([{
                errorcode: 400,
                errorMessage: 'คุณยังไม่ม่สิทธิในการเข้าใช้งาน',
                path:'/login'
            }])
            }


              } catch (error) {
            return response.error([
                {
                    errorcode: 400,
                    errorMessage: error.message,
                },
            ]);
        }

         /* 
            _companyService
              .findByIdCompany(_res.rows[0].company_id)
              .then((_res2) => {
           
                var iat = moment(new Date());
                var exp = moment(new Date()).add(1, "days");

              
                const payload = {
                  sub: req.body.user,
                  fup: _res.rows[0].id,
                  com: _res.rows[0].company_id,
                  sys: "c",
                  iat: iat.unix(),
                  exp: exp.unix(),
                  exp_date: moment(exp).format('วันที่ DD-MM-yyyy เวลา HH:mm:ss'),
                };
                var token = TokenEncode(payload);
               
              }); */
                
         

  

});























module.exports = {
  router: router,
  requireJWTAuth: requireJWTAuth,
  getUserIDByToken: getUserIDByToken,
  getAdminIDByToken: getAdminIDByToken,
  getPayload: getPayload,
  getCompanyIdByToken: getCompanyIdByToken,
};
