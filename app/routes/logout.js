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





const LogOut = async (req, res, next) => {
    const response = new Responsedata(req, res);

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader;
        const user_token = response.getPayloadData();
        const api_allcon = new allconService();
        const userDetail = jwt_decode(user_token.access_token_allcon);

    
        let newToken;
       await authFnc.refreshToken(token,user_token).then(function(result){
            newToken = result; // Now you can use res everywhere
        });;

     api_allcon.logoutAllcon(newToken.newAllconToken.access_token,userDetail.accountId);
        return response.success(true);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};





router.get("/logout", [authenticateToken], LogOut);





module.exports = router;