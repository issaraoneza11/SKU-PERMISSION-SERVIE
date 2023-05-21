var baseService = require('./baseService');
var _baseService = new baseService();
const {
    Client,
    Pool
} = require('pg')
const connectionSetting = require('../dbconnect');
const connectionPool = connectionSetting.connectionPool;
const connectionConfig = connectionSetting.config;
const _QueryCompany = require('../query/queryCompany.json');
var moment = require("moment");
var {
    v4: uuidv4
} = require('uuid');
var CryptoJS = require("crypto-js");
var appSetting = require("../appSetting.js");
const SECRET = appSetting.jwtSecret; 
const cryptoOption = require("../cryptoSetting");
const { config } = require('../dbconnect');
const { mode } = require('crypto-js');
class companyService {
   /*  async addNewCompany(model, admin_id) {
        return new Promise((async (resolve, reject) => {
            try {
                (async () => {
                    var client = new Client(connectionConfig)
                    await client.connect()
                    try {
                        await client.query('BEGIN');
                        let company_id = uuidv4();
                        const config_data = {"status_inform":null,"po_sign":null,"com_name":null,"inform":null,"remark":[{"key":"status_inform","remark":"สำหรับเปิด/ปิดประกาศตอนที่ลูกค้าเข้าสู้ระบบ"},{"key":"po_sign","remark":"ชื่อผู็อนุมัติใบสั่งซื้อ"},{"key":"com_name","remark":"ชื่อบริษัทลูกค้า"},{"key":"inform","remark":"ข้อความที่จะประกาศให้ทางลูกค้าทราบ"}]};
                        await client.query(_QueryCompany.addNewCompany, [company_id, admin_id, model.company_name|| null, model.company_detail|| null, model.apply_date|| null, model.start_date|| null, model.expire_date|| null, model.is_factory_active|| null, model.logo_company|| null, model.logo_company_path|| null, model.logo_company_name|| null,model.abbr||null, config_data, moment(new Date()), true]);
                        if (model.oem && model.oem.length > 0) {
                            for (const o of model.oem) {
                                let oem_id = uuidv4();
                                await client.query(_QueryCompany.addOEMByCompany, [oem_id, company_id, admin_id, o.name|| null, o.logo|| null, o.logo_path|| null, o.logo_name|| null, moment(new Date()), true, true]);
                            }
                        }
                        if (model.document && model.document.length > 0) {
                            for (const d of model.document) {
                                let doc_id = uuidv4();
                                await client.query(_QueryCompany.addDocCompany, [doc_id, company_id, d.document|| null, d.document_path|| null, d.document_name|| null, moment(new Date()), true]);
                            }
                        }

                        await client.query('COMMIT')
                        console.log("COMMIT")
                        resolve(true);
                    } catch (e) {
                        await client.query('ROLLBACK')
                        reject(e);
                    } finally {
                        await client.end()
                    }
                })().catch(e => {
                    console.log(e);
                    throw Error(e)
                })
            } catch (e) {
                reject(e);
            }
        }))

    }
    async UpdateNewCompany(model, admin_id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)
                await client.connect()
                try {
                    await client.query('BEGIN');
                   
                    await client.query(_QueryCompany.updateCompany, [admin_id, model.company_name|| null, model.company_detail|| null, model.apply_date|| null, model.start_date|| null, model.expire_date|| null, model.is_factory_active|| null, model.logo_company|| null, model.logo_company_path|| null, model.logo_company_name|| null, model.abbr ||null, model.id]);
                    if (model.oem && model.oem.length > 0) {
                        for (const o of model.oem) {
                            if (o.id) {
                                await client.query(_QueryCompany.updateOEMByCompany, [admin_id, o.name|| null, o.logo|| null, o.logo_path|| null, o.logo_name|| null, o.is_use, o.is_active|| null, o.id]);

                            } else {
                                let oem_id = uuidv4();
                                await client.query(_QueryCompany.addOEMByCompany, [oem_id, model.id, admin_id, o.name|| null, o.logo|| null, o.logo_path|| null, o.logo_name|| null, moment(new Date()), true, o.is_active|| null]);
                            }
                        }
                    }
                    if (model.document && model.document.length > 0) {
                        for (const d of model.document) {
                            if (!d.id) {
                                let doc_id = uuidv4();
                                await client.query(_QueryCompany.addDocCompany, [doc_id, model.id, d.document|| null, d.document_path|| null, d.document_name|| null, moment(new Date()), true]);
                            }
                            if (d.id && (d.is_use == false)) {
                                await client.query(_QueryCompany.updateDocCompany, [d.is_use, d.id]);
                            }
                        }
                    }

                    await client.query('COMMIT')
                    console.log("COMMIT")
                    resolve(true);
                } catch (e) {
                    await client.query('ROLLBACK')
                    reject(e);
                } finally {
                    await client.end()
                }
            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    async delCompanyById(id, admin_id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)

                await client.connect()
                try {
                    await client.query(_QueryCompany.delCompany, [id]);
                    resolve(true);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end()
                }

            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    async SetupCompany(model, admin_id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)
                await client.connect()
                try {
                    var config_remark = [];
                    //console.log(model.config);
                    for(var r = 0; r < model.config.length; r++){
                        let temp_remark ={
                            key:model.config[r].key,
                            remark:model.config[r].remark,
                        }
                        config_remark.push(temp_remark);
                    }
                    
                    var obj_config = {};
                    
                    for(let i = 0;i < model.config.length;i++){
                      if(model.config[i].is_use === true){
                        var key = `${model.config[i].key}`;
                   
                        var value = model.config[i].value;
                        obj_config[key] = value;
                      }
                       
                   
                        
                         
        
                    }
                    obj_config['remark'] = config_remark;
                   // console.log(obj_config)
                   // console.log(config_remark)
                    //throw Error("break");
                
          
                    await client.query(_QueryCompany.setupCompany, [model.fg_min|| null, model.fg_max|| null, model.raw_min|| null, model.raw_max|| null, model.rank_a|| null, model.rank_b|| null, model.rank_c|| null, model.rank_d|| null, model.factory_capacity|| null, model.id , obj_config || null]);
                    resolve(true);
                } catch (e) {
                    await client.query('ROLLBACK')
                    reject(e);
                } finally {
                    await client.end()
                }
            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    async findSetupById(id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)

                await client.connect()
                try {
                    var company = await client.query(_QueryCompany.findCompanyById, [id]);
                    if (company.rows.length > 0) {
                        resolve(company.rows[0]);
                    } else {
                        reject("not found");
                    }

                } catch (e) {
                    reject(e);
                } finally {
                    await client.end()
                }

            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }*/
    async findByIdCompany(id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)

                await client.connect()
                try {
     
                    let company = await client.query(_QueryCompany.findCompanyById, [id]);
                 
                
                    if (company.rows.length > 0) {
                        
                       
                        resolve(company.rows[0]);
                    } else {
                        reject("not found");
                    }

                } catch (e) {
                    reject(e);
                } finally {
                    await client.end()
                }


            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    /* async getMasterCompany(id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)
                var company = await client.query(_QueryCompany.getMasterCompany);
                resolve(company.rows);

            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    } */
 
    //---------------------user-----------------------
    async addUser(model, admin_id) {
        return new Promise((async (resolve, reject) => {
            try {
                (async () => {
                    var client = new Client(connectionConfig)
                    await client.connect()
                    try {
                        await client.query('BEGIN');
                        let user_id = uuidv4();
                        model.password = (model.password)? cryptoOption.encrypt(model.password):null;
                        var _check =  await client.query(_QueryCompany.checkUsernameEmail,[model.username|| null,model.email|| null])
                        if(_check.rows.length>0){
                            throw Error("already username or email");
                        }
                        await client.query(_QueryCompany.addUser, [user_id, model.company_id, admin_id, model.name|| null, model.sirname|| null, model.username|| null, model.email|| null, model.password|| null, model.mobile1|| null, model.mobile2|| null, model.detail|| null, model.is_active|| null, model.user_profile|| null, model.user_profile_name|| null, model.user_profile_path|| null, moment(new Date()), true]);

                        if (model.document && model.document.length > 0) {
                            for (const d of model.document) {
                                let doc_id = uuidv4();
                                await client.query(_QueryCompany.addUserDoc, [doc_id, user_id, d.document|| null, d.document_name|| null, d.document_path|| null, moment(new Date()), true]);
                            }
                        }

                        await client.query('COMMIT')
                        console.log("COMMIT")
                        resolve(true);
                    } catch (e) {
                        await client.query('ROLLBACK')
                        reject(e);
                    } finally {
                        await client.end()
                    }
                })().catch(e => {
                    console.log(e);
                    throw Error(e)
                })
            } catch (e) {
                reject(e);
            }
        }))

    }
    async updateUser(model, admin_id) {
        return new Promise((async (resolve, reject) => {
            try {
                (async () => {
                    var client = new Client(connectionConfig)
                    await client.connect()
                    try {
                       model.password = (model.password)? cryptoOption.encrypt(model.password):null;
                        await client.query('BEGIN');
                        await client.query(_QueryCompany.updateUser, [admin_id, model.name|| null, model.sirname|| null, model.username|| null, model.email|| null, model.password|| null, model.mobile1|| null, model.mobile2|| null, model.detail|| null, model.is_active|| null, model.user_profile|| null, model.user_profile_name|| null, model.user_profile_path|| null, model.id]);

                        if (model.document && model.document.length > 0) {
                            for (const d of model.document) {
                                if (!d.id) {
                                    let doc_id = uuidv4();
                                    await client.query(_QueryCompany.addUserDoc, [doc_id, model.id, d.document|| null, d.document_name|| null, d.document_path|| null, moment(new Date()), true]);

                                }
                                if (d.id && (d.is_use == false)) {
                                    await client.query(_QueryCompany.delUserDoc, [d.id]);
                                }

                            }
                        }

                        await client.query('COMMIT')
                        console.log("COMMIT")
                        resolve(true);
                    } catch (e) {
                        await client.query('ROLLBACK')
                        reject(e);
                    } finally {
                        await client.end()
                    }
                })().catch(e => {
                    console.log(e);
                    throw Error(e)
                })
            } catch (e) {
                reject(e);
            }
        }))

    }
    async delUser(id, admin_id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)

                await client.connect()
                try {
                    await client.query(_QueryCompany.delUser, [id]);
                    resolve(true);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end()
                }

            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    async findUserById(id, admin_id) {
        return new Promise((async (resolve, reject) => {

            (async () => {
                var client = new Client(connectionConfig)

                await client.connect()
                try {
                   var query = await client.query(_QueryCompany.findUserById, [id]);
                   let temp = query.rows.length>0?query.rows[0]:{};
                    if(query.rows.length>0){
                        temp.password = (temp.password)? cryptoOption.decrypt(temp.password):null;
                        let doc = await client.query(_QueryCompany.findDocByUser, [id]);
                        temp.document=doc.rows;
                    }
                    resolve(temp);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end()
                }

            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))

    }
    async getAllUser() {
        return new Promise((async (resolve, reject) => {
            (async () => {
                var client = new Client(connectionConfig);
                await client.connect();
                try {
                    let query = await client.query(_QueryCompany.getAllUser);
                    resolve(query.rows);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end();
                }
            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))
    }

    async filterUser(model) {
        return new Promise((async (resolve, reject) => {
            (async () => {
                var client = new Client(connectionConfig);
                await client.connect();
                try {
                    let query = await client.query(_QueryCompany.filterUser,[
                        model.name || null,
                        model.username || null,
                        model.email || null,
                        model.company_id || null,
                    ]);
                    resolve(query.rows);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end();
                }
            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))
    }

    async getviewOemByUserId(user_id){
        return new Promise((async (resolve, reject) => {
            try {    
                var client = new Client(connectionConfig)
                await client.connect();
                var query = await client.query(_QueryCompany.getviewOemByUserId, [user_id]);
                // if (check.rows.length == 0) {
                //     throw Error("not found")
                // } else {
                //     await client.query(_QueryProductPlaning.updateRealOrder, [model.order,user_id,moment(new Date()),check.rows[0].id]);
                // }
                resolve(query.rows)
            }catch(ex){
                reject(ex); 
            }
        }))
    }
    async findOEMByCompanyIdAndUser(user,user_id){
        return new Promise((async (resolve, reject) => {
            try {    
                var client = new Client(connectionConfig)
                await client.connect();
                var query = await client.query(_QueryCompany.getUserDetailByUser, [user_id]);
                
                var oem = await client.query(_QueryCompany.getOEMbyCompanyId,[query.rows[0].company_id]);
                var temp = {
                    user_detail:query.rows[0],
                    oem_list:oem.rows,
                }
                // if (check.rows.length == 0) {
                //     throw Error("not found")
                // } else {
                //     await client.query(_QueryProductPlaning.updateRealOrder, [model.order,user_id,moment(new Date()),check.rows[0].id]);
                // }
                resolve(temp)
            }catch(ex){
                reject(ex); 
            }
        }))
    }
    

}
module.exports = companyService