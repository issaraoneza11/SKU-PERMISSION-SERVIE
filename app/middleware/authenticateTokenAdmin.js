const jwt = require('jsonwebtoken')
const config = require('../appSetting')
const logService = require('../service/logservice');
const authRouter = require('../routes/auth');

/**
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
module.exports = authenticateTokenAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    /* console.log(authHeader) */
/*     console.log(token) */
    if (!token){
        return res.sendStatus(401);
    }
    

    jwt.verify(token, config.jwtSecret, async (err, model) => {
   /*      console.log("here Middle ware") */
        if (err) return res.sendStatus(403)

        if (!authRouter.getUserIDByToken(token)) return res.status(400).send({
            message: "need correct level"
        })

        if (authRouter.getRoleByToken(token) !== '442bbfca-d918-4dc5-ae6c-5d2f8cc15a22') return res.status(400).send({
            message: "need correct level"
        })
       

        const _logService = new logService();
        const _log = _logService.model;

        _log.activity.parameter = {
            "body": req.body,
            "query": req.query,
            "params": req.params,
            "header": req.headers,
            "payload": authRouter.getPayload(token)
        };
        _log.activity.path = req.baseUrl + req.path;
        const _retrue = await _logService.log(_log);
        res.log = {
            log: _log,
            id: _retrue,
        }
        req.model = model
        next()
    })
}


