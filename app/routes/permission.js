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





router.post('/filter_menu', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { mater_menu_id, master_menu_name, menu_name } = req.body;
        return response.success(await filterMenuService([mater_menu_id && mater_menu_id != "" ? mater_menu_id : null, master_menu_name ?? null, menu_name ?? null]));
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});

router.get('/findUserById/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { id } = req.params;

        const callback = await getUserByIdService([id])
        if (callback.length > 0) {
            return response.success(callback[0]);
        } else {
            return response.error([{
                errorcode: 400,
                errorDis: "ไม่พบข้อมูล"
            }])
        }

    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});

router.get('/findById/:company_id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { company_id } = req.params;

        const callback = await getOemByIdService([company_id])
        if (callback.length > 0) {
            return response.success(callback[0]);
        } else {
            return response.error([{
                errorcode: 400,
                errorDis: "ไม่พบข้อมูล"
            }])
        }

    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});

router.get('/getOemByCompanyIdService/:company_id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { company_id } = req.params;

        const callback = await getOemByCompanyIdService([company_id])
        if (callback.length > 0) {
            return response.success(callback);
        } else {
            return response.error([{
                errorcode: 400,
                errorDis: "ไม่พบข้อมูล"
            }])
        }

    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.get('/getPermissByUser/:user_id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { user_id } = req.params;
        var userDetail = await condb.clientQuery(
            `SELECT *
            FROM identity_user WHERE id = $1 and is_use = true;`, [user_id]);

        var company_id = userDetail.rows[0].company_id;
        var company_detail = await condb.clientQuery(
            `SELECT *
                FROM company WHERE id = $1 and is_use = true;`, [company_id]);


        var permissionOem = await condb.clientQuery(
            `SELECT a.id, a.oem_id ,b.name as oem_name, a.user_id,b.is_active ,b.logo_path
                FROM permission_oem a LEFT JOIN oem b ON a.oem_id = b.id 
                WHERE a.user_id = $1 AND b.is_active = true`,
            [user_id]);

            var tempMenu = [];
            for(let item of permissionOem.rows){
                var permissionMenuOnOem = await condb.clientQuery(
                    `SELECT a.id, a.permission_oem_id, a.menu_id, b.name as menu_name,b.academy,b.display_name as menu_display_name,b.is_image as menu_is_image, b.icon as menu_icon,b.image_path as menu_image_path,
                    b.level as menu_level, b.path as menu_path,b.id as menu_id,b.parent_id as menu_parent,b.sort as menu_sort,c.oem_id as oem_id 
                    FROM permission_menu a left join menu b  on a.menu_id = b.id 
                    left join permission_oem c on a.permission_oem_id = c.id WHERE b.is_use = true and a.permission_oem_id = $1`,
                    [item.id]);


                    for(let i of permissionMenuOnOem.rows){
                        var check_child = permissionMenuOnOem.rows.filter((e)=>{ return e.menu_parent === i.menu_id });
                        i.have_child = false;
                        if(check_child.length > 0){
                            i.have_child = true;
                        }
                        tempMenu.push(i);
                    }
            }


        var data = {
            company: company_detail.rows[0],
            oem: permissionOem.rows,
          /*   master_menu: masterMenu.rows, */
            menu: tempMenu,
            user: userDetail.rows[0],
            start_date: moment(company_detail.rows[0].start_date).startOf('days'),
            exp_date: moment(company_detail.rows[0].expire_date).endOf('days'),
            is_active: userDetail.rows[0].is_active,
            /*    allMenu:result_getAllMenu, */
        }




     
            return response.success(data);
       

    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


















router.get('/getCompanyByGroupID/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const gr_company_id = req.params.id;
        /*       console.log('gr_company_id', gr_company_id); */
        const callback = await condb.clientQuery(
            `SELECT company_id, company_name, company_detail, company_start_date, company_expire_date, company_is_use, company_logo, company_logo_path, company_logo_name, company_updated_date, company_cg_id, company_abbr, company_sort, company_created_date,company_is_active
            FROM company where company_cg_id = $1 and company_is_use = true;`, [gr_company_id]);

        return response.success(callback.rows);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.get('/getUserByID1/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const IDuser = req.params.id;
        /*  console.log('IDuser', IDuser); */
        const userDetail = await condb.clientQuery(
            `SELECT iu_id, iu_company_group_id, iu_name, iu_sirname, iu_username, iu_email, iu_password, iu_mobile, iu_detail, iu_is_active, iu_token, iu_token_create, iu_token_expired, iu_create_date, iu_is_use, iu_user_profile, iu_user_profile_name, iu_user_profile_path,iu_mobile2
            FROM identity_user where iu_id = $1;`, [IDuser]);

        const docMoc = await condb.clientQuery(
            `SELECT ud_id, ud_iu_id, ud_document, ud_document_path as doc_path, ud_document_name as doc_name, ud_is_use, ud_is_active, ud_create_date
            FROM user_document where ud_iu_id = $1;`, [IDuser]);

        let arrrr = [];
        for (let d = 0; d < docMoc.rows.length; d++) {
            var un = {

                no: d,
                documentname: docMoc.rows[d].doc_name,
                documentPath: docMoc.rows[d].doc_path,
                is_use: true
            }
            arrrr.push(un);
        }

        userDetail.rows[0].docMulti = arrrr; cryptoOption.encrypt
        userDetail.rows[0].iu_password = cryptoOption.decrypt(userDetail.rows[0].iu_password);

        const company = await condb.clientQuery(
            `SELECT ic_id, ic_company_id, ic_iu_id
            FROM identity_company where ic_iu_id = $1;`, [IDuser]);

        userDetail.rows[0].listCom = company.rows;

        return response.success(userDetail.rows[0]);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.post('/addUser', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        /*  const userlist = req.body.userList;
         const imgProfile = req.body.imgProfile;
         const companyBaby = req.body.companyBaby; 
         const group_id = req.body.group_id;
         const docSlist = req.body.dosc; */
        const model = req.body;

        console.log('แอด ผู้ใช้', model);
        const checkUsernameGmail = await condb.clientQuery(
            `SELECT iu_id, iu_company_group_id, iu_name, iu_sirname, iu_username, iu_email, iu_password, iu_mobile, iu_detail, iu_is_active, iu_token, iu_token_create, iu_token_expired, iu_create_date, iu_is_use, iu_user_profile, iu_user_profile_name, iu_user_profile_path, iu_mobile2
            FROM identity_user where iu_username = $1;`, [model.username]);


        if (checkUsernameGmail.rows.length > 0) {
            error_list.push({
                errorcode: "vehicle8.nf",
                errorDis: "username ซ้ำในระบบ!",
            });
        }
        console.log('3');
        if (error_list.length > 0) {
            return response.error(error_list);
        }

        model.password = (model.password) ? cryptoOption.encrypt(model.password) : null;




        let iu_id1 = uuidv4();
        await condb.clientQuery(
            `INSERT INTO identity_user(
                iu_id, iu_company_group_id, iu_name, iu_sirname, iu_username, iu_email, iu_password, iu_mobile, iu_detail, iu_is_active, iu_token, iu_token_create, iu_token_expired, 
                iu_create_date, iu_is_use, iu_user_profile, iu_user_profile_name, iu_user_profile_path, iu_mobile2)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);`, [
            iu_id1,
            model.group_id,
            model.fristname,
            model.sirname,
            model.username,
            model.email,
            model.password,
            model.moblie1 ? model.moblie1 : null,
            model.detail ? model.detail : null,
            model.isAtcive === true ? true : false,
            null,
            null,
            null,
            new Date(),
            true,
            model.img_name ? model.img_name : null,
            model.img_name ? model.img_name : null,
            model.img_path ? model.img_path : null,
            model.moblie2 ? model.moblie2 : null,
        ]);

        if (model.companyBaby.length > 0) {
            for (let i of model.companyBaby) {
                let id_idcom = uuidv4();
                await condb.clientQuery(
                    `INSERT INTO identity_company(
                           ic_id, ic_company_id, ic_iu_id)
                           VALUES ($1, $2, $3);`, [id_idcom, i, iu_id1]);
            }

        }

        console.log('6');
        if (model.sb_bill_doc.length > 0) {
            for (let t of model.sb_bill_doc) {
                let idDoc2 = uuidv4();
                await condb.clientQuery(
                    `INSERT INTO user_document(
                            ud_id, ud_iu_id, ud_document, ud_document_path, ud_document_name, ud_is_use, ud_is_active, ud_create_date)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`, [idDoc2, iu_id1, null, t.sbd_path_document, t.sbd_document_name, true, true, new Date()]);
            }

        }





        return response.success('true');
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});



router.post('/document', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        /*  console.log('files',req.files);
         console.log('ดู',req); */


        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            /*  console.log('เข้าเเล้ว 10'); */

            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                let profile = Array.isArray(req.files.Profile) ? req.files.Profile : [req.files.Profile];
                let data = [];
                profile.forEach(p => {
                    let _genName = uuidv4() + "_" + p.name;
                    let path = req.body.typeFile;
                    let rootPath = "./uploads/"
                    let fullPath = rootPath + path + "/" + _genName
                    //Use the mv() method to place the file in upload directory (i.e. "uploads")
                    p.mv(fullPath);
                    let doc_id = uuidv4();
                    data.push({
                        doc_id: doc_id,
                        orgin_name: p.name,
                        name: _genName,
                        path: Buffer.from(fullPath).toString('base64'),
                        mimetype: p.mimetype,
                        size: p.size
                    })
                })


                let temp = {
                    status: true,
                    message: 'File is uploaded',
                    data: data
                };
                return response.success(temp);
            })



        }


        /* return response.success(userDetail.rows[0]); */
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});




router.post('/edituser', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {

        console.log('EDIT req', req.body);
        /* const userlist = req.body.userList;
        const model = req.body.imgProfile; */
        /*  const doclist = req.body.userList.docManfile; */
        /* const companyBaby = req.body.companyBaby;  */
        /*  const user_id4 = req.body.userList.user_id4;
         const group_id = req.body.group_id;
         const docSlist = req.body.dosc; */
        const model = req.body;


        const checkUsernameGmail = await condb.clientQuery(
            `SELECT iu_id, iu_company_group_id, iu_name, iu_sirname, iu_username, iu_email, iu_password, iu_mobile, iu_detail, iu_is_active, iu_token, iu_token_create, iu_token_expired, iu_create_date, iu_is_use, iu_user_profile, iu_user_profile_name, iu_user_profile_path, iu_mobile2
            FROM identity_user where iu_is_use = true and iu_username = $1 and iu_id != $2;`, [model.username, model.user_id4]);

        console.log('1');
        if (checkUsernameGmail.rows.length > 0) {
            error_list.push({
                errorcode: "vehicle8.nf",
                errorDis: "username ซ้ำในระบบ!",
            });
        }
        console.log('2');
        if (error_list.length > 0) {
            return response.error(error_list);
        }
        console.log('3');
        const getUserData = await condb.clientQuery(
            `SELECT iu_id, iu_company_group_id, iu_name, iu_sirname, iu_username, iu_email, iu_password, iu_mobile, iu_detail, iu_is_active, iu_token, iu_token_create, iu_token_expired, iu_create_date, iu_is_use, iu_user_profile, iu_user_profile_name, iu_user_profile_path, iu_mobile2
            FROM identity_user where iu_id = $1;`, [model.user_id4]);

        if (model.password !== null && model.password !== "") {

            model.password = (model.password) ? cryptoOption.encrypt(model.password) : null;

            await condb.clientQuery(
                `UPDATE identity_user
                SET  iu_company_group_id=$2, iu_name=$3, iu_sirname=$4, iu_username=$5, iu_email=$6, 
                iu_password=$7, iu_mobile=$8, iu_detail=$9,iu_is_active=$14,
                iu_user_profile=$10, iu_user_profile_name=$11, iu_user_profile_path=$12, iu_mobile2=$13
                WHERE iu_id=$1;`, [
                model.user_id4,
                model.group_id ? model.group_id : getUserData.rows[0].iu_company_group_id,
                model.fristname,
                model.sirname,
                model.username,
                model.email,
                model.password,
                model.moblie1 || null,
                model.detail || null,
                model.img_name || null,
                model.img_name || null,
                model.img_path || null,
                model.moblie2 || null,
                model.isAtcive === true ? true : false
            ]);
        } else {

            await condb.clientQuery(
                `UPDATE identity_user
                SET  iu_company_group_id=$2, iu_name=$3, iu_sirname=$4, iu_username=$5, iu_email=$6, 
                iu_mobile=$7, iu_detail=$8,iu_is_active=$13,
                iu_user_profile=$9, iu_user_profile_name=$10, iu_user_profile_path=$11, iu_mobile2=$12
                WHERE iu_id=$1;`, [
                model.user_id4,
                model.group_id ? model.group_id : getUserData.rows[0].iu_company_group_id,
                model.fristname,
                model.sirname,
                model.username,
                model.email,

                model.moblie1 || null,
                model.detail || null,
                model.img_name || null,
                model.img_name || null,
                model.img_path || null,
                model.moblie2 || null,
                model.isAtcive === true ? true : false
            ]);
        }

        let cmo = await condb.clientQuery(
            `SELECT ic_id, ic_company_id, ic_iu_id
            FROM identity_company where ic_iu_id = $1 ;`, [model.user_id4]);

        /*  console.log('ดูคอม0',cmo.rows); */

        let SaveCom = [];
        let delCom = [];
        if (cmo.rows.length > 0) {
            for (let item of cmo.rows) {

                let fil = model.companyBaby.filter((e1) => { return e1.com_id === item.ic_company_id })

                if (fil.length > 0) {
                    item.isSel = true
                } else {
                    item.isSel = false
                }
                delCom.push(item)
            }
            let saveCo = [];
            let dolo = [];
            if (delCom.length > 0) {

                for (let ofDel of delCom) {
                    if (ofDel.isSel === false) {
                        dolo.push(ofDel);

                        console.log('จะลบ', ofDel);
                        await condb.clientQuery(
                            `DELETE FROM identity_company
                                    WHERE  ic_id = $1;`, [ofDel.ic_id]);
                    } else if (ofDel.isSel === true) {
                        saveCo.push(ofDel);
                    }

                }
            }

            let saveRa = [];
            let saveRa2 = [];
            let comSETARRY = model.companyBaby;
            if (comSETARRY.length > 0) {
                for (let p of comSETARRY) {

                    let sprit = delCom.filter((e4) => { return e4.ic_company_id === p.com_id })
                    if (sprit.length > 0) {
                        saveRa2.push(p)
                    } else {
                        saveRa.push(p);
                    }


                }
            }

            if (saveRa.length > 0) {
                for (let index of saveRa) {
                    let co_id = uuidv4();
                    await condb.clientQuery(
                        `INSERT INTO identity_company(
                            ic_id, ic_company_id, ic_iu_id)
                            VALUES ($1, $2, $3);`, [co_id, index.com_id, model.user_id4]);

                }

            }

        }





        /* 
                    if(model.companyBaby.length > 0){
                        console.log("คอมพานี",model.companyBaby);
                        let tiem22 = [];
                        for(let i of model.companyBaby){
                             tiem22=  await condb.clientQuery(
                                `SELECT ic_id, ic_company_id, ic_iu_id
                                FROM identity_company where ic_iu_id = $1 and ic_company_id = $2;`, [model.user_id4,i]);
        
                       if (tiem22.rows.length > 0) {
                        console.log('มี',tiem22.rows);
                       }else{
                        let coid = uuidv4();
                        await condb.clientQuery(
                            `INSERT INTO identity_company(
                                ic_id, ic_company_id, ic_iu_id)
                                VALUES ($1, $2, $3);`, [coid,i,model.user_id4]);
                       }
                    }
                    console.log('tim : ',tiem22.rows);
                    } */

        if (model.sb_bill_doc.length > 0) {
            await condb.clientQuery(
                `DELETE FROM user_document
                        WHERE ud_iu_id = $1;`, [model.user_id4]);
            for (let t of model.sb_bill_doc) {
                console.log('T', t);
                let idDoc2 = uuidv4();
                await condb.clientQuery(
                    `INSERT INTO user_document(
                            ud_id, ud_iu_id, ud_document, ud_document_path, ud_document_name, ud_is_use, ud_is_active, ud_create_date)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`, [idDoc2, model.user_id4, null, t.sbd_path_document, t.sbd_document_name, true, true, new Date()]);
            }

        } else if (model.sb_bill_doc.length === 0) {
            await condb.clientQuery(
                `DELETE FROM user_document
                        WHERE ud_iu_id = $1;`, [model.user_id4]);

        }





        return response.success(true);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});




router.get('/delatUser/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const IDuser = req.params.id;
        /*  console.log('IDuser', IDuser); */

        await condb.clientQuery(
            `UPDATE identity_user
            SET  iu_is_use=false
            WHERE iu_id=$1;`, [IDuser]);



        return response.success(true);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});




/**
* Upload Profile
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/

const Profile = async = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {

            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            //console.log(req.files.Profile);7
            let profile = req.files.Profile;
            let _genName = uuidv4() + "_" + profile.name;
            let path = req.body.typeFile;
            let rootPath = "./uploads/";
            let fullPath = rootPath + path + "/" + _genName;
            //Use the mv() method to place the file in upload directory (i.e. "uploads")

            profile.mv(fullPath);

            let temp = {
                status: true,
                message: 'File is uploaded',
                data: {
                    orgin_name: profile.name,
                    name: _genName,
                    path: Buffer.from(fullPath).toString('base64'),
                    mimetype: profile.mimetype,
                    size: profile.size
                }
            }

            //send response
            console.log("temp", temp);

            return response.success(temp);
        }


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }

}

router.post('/profile', [authenticateToken], Profile);




router.post('/updatUserByID', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const model = req.body;
        console.log('model', model);

        /* let checkEmail = await condb.clientQuery(
            `SELECT iu_id,iu_email
            FROM identity_user where iu_id != $1 and iu_email = $2;`, [model.iu_id,model.iu_email]);
        if(checkEmail.rows.length > 0){
            return response.error([{
                errorcode: 400,
                errorDis: 'Email ซ้ำในระบบ !!!'
            }]) */
        /*   }else{ */
        console.log('EMAIL', model.iu_email.toString());

        if (model.iu_user_profile_path !== null && model.iu_user_profile_path !== '') {
            await condb.clientQuery(
                `UPDATE identity_user
                    SET iu_name=$2, iu_sirname=$3,iu_email=$4,iu_mobile=$5,iu_detail=$6, iu_user_profile=$7, 
                    iu_user_profile_name=$8, iu_user_profile_path=$9, iu_mobile2=$10
                    WHERE iu_id=$1;`, [
                model.iu_id,
                model.iu_name || null,
                model.iu_sirname || null,
                model.iu_email ? model.iu_email.toString() : '',
                model.iu_mobile || null,
                model.iu_detail || null,
                null,
                model.iu_user_profile_name || null,
                model.iu_user_profile_path || null,
                model.iu_mobile2 || null

            ]);
        } else {
            await condb.clientQuery(
                `UPDATE identity_user
                    SET iu_name=$2, iu_sirname=$3,iu_email=$4,iu_mobile=$5,iu_detail=$6,iu_mobile2=$7
                    WHERE iu_id=$1;`, [
                model.iu_id,
                model.iu_name || null,
                model.iu_sirname || null,
                model.iu_email ? model.iu_email.toString() : '',
                model.iu_mobile || null,
                model.iu_detail || null,
                model.iu_mobile2 || null,
            ]);
        }


        /*  

        } */



        return response.success(true);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});

router.post('/updatUserPassword', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const model = req.body;
        console.log('model', model);

        /*  model.iu_password = (model.iu_password) ? cryptoOption.encrypt(model.iu_password) : null; */
        model.new_password = (model.new_password) ? cryptoOption.encrypt(model.new_password) : null;

        console.log('รหัสผ่านแปรง', model.iu_password);
        let checkpassword = await condb.clientQuery(
            `SELECT iu_id,iu_password
            FROM identity_user where iu_id = $1;`, [model.iu_id]);

        let passwordQQ = (checkpassword.rows[0].iu_password) ? cryptoOption.decrypt(checkpassword.rows[0].iu_password) : ''
        console.log('ดูหน่อย', passwordQQ, " : ", model.iu_password);

        if (passwordQQ === model.iu_password) {
            await condb.clientQuery(
                `UPDATE identity_user
                SET iu_password=$2
                WHERE iu_id=$1;`, [
                model.iu_id,
                model.new_password,
            ]);

        } else {
            return response.error([{
                errorcode: 400,
                errorDis: "รหัสผ่านเดิมไม่ถูกต้อง"
            }])
        }




        return response.success(true);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});





const AllOEM = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const { trailer_id } = req.params;
        const user_id = req.params.id;

        var oem_temp = await condb.clientQuery(
            `SELECT ic_id, ic_company_id, ic_iu_id, b.company_name
        FROM identity_company left join company as b on ic_company_id = b.company_id where ic_iu_id = $1;`
            , [user_id]);

        return response.success(oem_temp.rows);
    } catch (error) {
        return response.error([
            {
                errorcode: 400,
                errorDis: error.message,
            },
        ]);
    }
};
router.get("/allOEM/:id", [authenticateToken], AllOEM);

//******************************************************************** */
router.post('/filterUser', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        var userList = await condb.clientQuery(
            `SELECT * FROM identity_user WHERE is_use = true AND 
           
            ($1::text is null or name ILIKE '%' || $1 || '%') AND 
            ($2::text is null or sirname ILIKE '%' || $2 || '%') AND 
            ($3::text is null or username ILIKE '%' || $3 || '%')

            ORDER BY create_date desc
            
          
            
            ;`, [
                body.name || null,
                body.sirname || null,
                body.username || null
            ]);
        for (let item of userList.rows) {
            let menuPermission = await condb.clientQuery(
                `SELECT c.id as menu_id,c.name as menu_name,d.id as oem_id, d.name as oem_name  FROM permission_oem a LEFT JOIN permission_menu b ON a.id = b.permission_oem_id 
                LEFT JOIN menu c ON b.menu_id = c.id LEFT JOIN oem d ON a.oem_id = d.id  WHERE 
                a.user_id = $1
                ;`, [item.id]);
           /*      console.log(menuPermission.rows) */
          item.menuList = menuPermission.rows || [];
        }
        return response.success(userList.rows);


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.get('/filterUserByPermissionOem/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const {id} = req.params;

        var userList = await condb.clientQuery(
            `SELECT b.* FROM permission_oem a LEFT JOIN identity_user b ON a.user_id = b.id WHERE a.oem_id = $1
            ;`, [
                id
            ]);
        
        return response.success(userList.rows);


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.get('/getMenuAll', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
     

        var menuList = await condb.clientQuery(
            `SELECT * FROM menu WHERE is_use = true ORDER BY sort;
            ;`, [
           
            ]);
        
        return response.success(menuList.rows);


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});

router.post('/SyncMenuPermission', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        
        const body = req.body;

        for(let item of body.userList){
            var getRelateComUser = await condb.clientQuery(
                `SELECT * FROM permission_oem WHERE oem_id = $1 AND user_id = $2;
                ;`, [
                body.oem_id,
                item.id
                ]);
                
                await condb.clientQuery(
                    `DELETE FROM permission_menu WHERE permission_oem_id = $1;
                    ;`, [
                        getRelateComUser.rows[0].id
                    ]);
            
   

            for(let menu of body.menuList){
              let permiss_id = uuidv4();
              await condb.clientQuery(
                `INSERT INTO permission_menu(
                    id, menu_id, is_use, permission_oem_id)
                    VALUES ($1, $2, $3, $4);`, [
                        permiss_id,
                        menu.id,
                        true,
                        getRelateComUser.rows[0].id
                ]);
              
    

            }





            
          }
        
        return response.success(true);


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});


router.get('/getMenuPermissionByUser/:id', [authenticateToken], async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        
        const {id} = req.params;

      
        let menuPermission = await condb.clientQuery(
            `SELECT c.id as menu_id,c.name as menu_name,d.id as oem_id, d.name as oem_name  FROM permission_oem a LEFT JOIN permission_menu b ON a.id = b.permission_oem_id 
            LEFT JOIN menu c ON b.menu_id = c.id LEFT JOIN oem d ON a.oem_id = d.id  WHERE 
            a.user_id = $1
            ;`, [id]);





            
          
        
        return response.success(menuPermission.rows);


    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
});



module.exports = router;