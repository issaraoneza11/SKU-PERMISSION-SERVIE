
const jwt_decode = require ("jwt-decode");
const allconService = require("../lib/api/Allcon");
var moment = require("moment");
const jwt = require("jwt-simple");
var JwtSetting = require("../jwtSetting");
const TokenEncode = (payload) => {
    return jwt.encode(payload, JwtSetting.SECRET);
  };



async function refreshToken(token,user_token){
/*     console.log(user_token) */

    const api_allcon = new allconService();
   /*  const userDetail = jwt_decode(user_token.access_token_allcon); */
/*     console.log(userDetail) */
    let newAlltoken =  await api_allcon.refreshAllconToken(token,user_token.access_token_allcon,user_token.refresh_token_allcon);
  /*   console.log("newAlltoken",newAlltoken) */
     
     
    var iat = moment(new Date());
    var exp = moment(new Date()).add(1, "days");
   
    const payload = {
        access_token_allcon:newAlltoken.access_token,
        refresh_token_allcon:newAlltoken.refresh_token,
        user_id:user_token.user_id,
        r:user_token.r,
        iat: iat.unix(),
        exp: exp.unix(),
        exp_date: moment(exp).format('วันที่ DD-MM-yyyy เวลา HH:mm:ss'),
      };
/*       console.log(payload); */
      var tokenNew = TokenEncode(payload);


   let temp = {
    newAllconToken:newAlltoken,
    token:tokenNew
   };
      return temp;
}


module.exports = {
    refreshToken:refreshToken
  };