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

router.post(
  "/get_all_Vendor", [/* authenticateToken */],    
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



router.get(
  "/getVendor/:id",
  [
    /* authenticateToken */
  ],
  async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
      const { id } = req.params;

      const tmp = await condb.clientQuery(
        `SELECT * FROM vendor;
            `,
        [id]
      );

      /* for (let i of tmp.rows) {
          
            
      } */

      return response.success(tmp.rows[0]);
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

module.exports = router;
