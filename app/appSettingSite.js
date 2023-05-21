require('dotenv').config({ path:process.cwd()+ '/.env' })

module.exports ={
 
START_PROJECT:process.env.START_PROJECT,


DB_SERVER_DEV:process.env.DB_SERVER_DEV,
DB_USERNAME_DEV:process.env.DB_USERNAME_DEV,
DB_PASSWORD_DEV:process.env.DB_PASSWORD_DEV,
DB_NAME_DEV:process.env.DB_NAME_DEV,
DB_PORT_DEV:process.env.DB_PORT_DEV,
LOG_DB_SERVER_DEV:process.env.LOG_DB_SERVER_DEV,
LOG_DB_USERNAME_DEV:process.env.LOG_DB_USERNAME_DEV,
LOG_DB_PASSWORD_DEV:process.env.LOG_DB_PASSWORD_DEV,
LOG_DB_NAME_DEV:process.env.LOG_DB_NAME_DEV,
LOG_DB_PORT_DEV:process.env.LOG_DB_PORT_DEV,


DB_SERVER_PROD:process.env.DB_SERVER_PROD,
DB_USERNAME_PROD:process.env.DB_USERNAME_PROD,
DB_PASSWORD_PROD:process.env.DB_PASSWORD_PROD,
DB_NAME_PROD:process.env.DB_NAME_PROD,
DB_PORT_PROD:process.env.DB_PORT_PROD,
LOG_DB_SERVER_PROD:process.env.LOG_DB_SERVER_PROD,
LOG_DB_USERNAME_PROD:process.env.LOG_DB_USERNAME_PROD,
LOG_DB_PASSWORD_PROD:process.env.LOG_DB_PASSWORD_PROD,
LOG_DB_NAME_PROD:process.env.LOG_DB_NAME_PROD,
LOG_DB_PORT_PROD:process.env.LOG_DB_PORT_PROD,



HOST:process.env.HOST,
PORT:process.env.PORT,
JWTSECRET:process.env.JWTSECRET,
CUSTOMHERDERKEY:process.env.CUSTOMHERDERKEY,
USERSWAGGER:process.env.USERSWAGGER,
PASSWORDSWAGGER:process.env.PASSWORDSWAGGER,
FIXDATA_MATERIAL_UNIT_PIECE:process.env.FIXDATA_MATERIAL_UNIT_PIECE,
FIXDATA_MATERIAL_UNIT_WEIGHT:process.env.FIXDATA_MATERIAL_UNIT_WEIGHT,
LOGACCESSPATH:process.env.LOGACCESSPATH,
PASSWORDACADEMY:process.env.PASSWORDACADEMY,

URL_SERVER_API_UPLOAD_FILE: process.env.URL_SERVER_API_UPLOAD_FILE,
URL_SERVER_API_ALLCON: process.env.URL_SERVER_API_ALLCON,
APP_ID: process.env.APP_ID,
}