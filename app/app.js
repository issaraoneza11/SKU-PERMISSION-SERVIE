var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
var morgan = require("morgan");
var fs = require("fs");
const rfs = require("rotating-file-stream");
const basicAuth = require("express-basic-auth");
const _config = require("./appSetting.js");
const databaseConnect = require("./dbconnect.js");
/**
 * Import routes
 */
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");

var permissionRoute = require("./routes/permission");
var oemManagementRoute = require("./routes/oemManagement");
var userManagementRoute = require("./routes/userManagement");
var organzeRoute = require("./routes/organize");
var app = express();
/**
 * Swagger generate route
 */
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("./swagger.json");
swaggerDocument.host = _config.host + ":" + _config.port;

app.use(
  "/api-docs",
  basicAuth({
    users: { TTT: _config.passwordSwagger },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

/**
 * 
 * Log Control
 */

var fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    createParentPath: true,
  })
);

 function log_file_name(time, index) {
  if (!time) return "access.log";

  return [formatDate(time), index, "access.log"].join("-");
}



if (app.get("env") == "production") {
  let accessLogStream = rfs.createStream(log_file_name, {
    size: "2M",
    interval: "1d",
    path: _config.logAccessPath,
  });
  app.use(morgan({ stream: accessLogStream }));
} else {
  app.use(morgan('dev')); //log to console on development
}
/** 
 * view engine setup
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** 
 * Router
 */

app.use("/", indexRouter);
app.use("/api/auth", authRouter.router);
app.use("/api/organize", organzeRoute);

app.use("/api/permission",permissionRoute);
app.use("/api/oemManagement",oemManagementRoute);
app.use("/api/userManagement",userManagementRoute);
/** 
 * Eerror
 */
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.disable("x-powered-by");

module.exports = app;
