var baseService = require("./baseService");
var _baseService = new baseService();
const _config = require("../appSetting.js");
const { Client, Pool } = require("pg");
const connectionSetting = require("../dbconnect");
const connectionPool = connectionSetting.connectionPool;
const connectionConfig = connectionSetting.config;
const _QueryPermission = require("../query/queryPermission.json");

var moment = require("moment");
var { v4: uuidv4 } = require("uuid");
const { cli } = require("webpack");

class permissionService {
  /* 
    async addMaterial(model, user_id) {
        return new Promise(async (resolve, reject) => {
          try {
            (async () => {
              var client = new Client(connectionConfig);
              await client.connect();
              try {
                var query = await client.query(_QueryMaterial.checkNameMaterial, [
                  model.no,
                  model.oem_id,
                ]);
                if (query.rows.length > 0) {
                  reject({
                    message: "already material no",
                  });
                }
                let material_id = uuidv4();
               
                console.log("COMMIT");
                resolve(true);
              } catch (e) {
                reject(e);
              } finally {
                await client.end();
              }
            })().catch((e) => {
              console.log(e);
              throw Error(e);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
 */

  async findByUserIdPermission(material_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.findByUserId, [
              material_id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows[0]);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAll_ICON() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getAll_icon, [
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }


  async getAllMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getAllMenu);
            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAllUser() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getAllUser);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAllFeatureUser() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getAllFeatureUser);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAllFeature() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getAllFeature);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async filterFeature(model) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.filterFeature,[
              model.feature || null,
              model.menu_id || null,
            ]);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_Level_all() {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.get_level_all);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async addFeature(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            //console.log(model)
            var checkFeature = await client.query(
              _QueryPermission.checkNameFeature,
              [model.feature,model.menu_id]
            );
            if(checkFeature.rows.length > 0){
              throw Error("Feature Name Already!!");
            }

            var query_sort = await client.query(_QueryPermission.checkFeature);
            let sort = query_sort.rows[0].max;
            let id = uuidv4();
            /*    if(model.level == 1){
                  let icon = null;
                  let parent_id = null;
                }else if(model.level == 2){
                  let parent_id = model.parent_id;
                } */
            await client.query(_QueryPermission.addFeature, [
              id,
              model.feature,
              model.menu_id,
              sort + 1,
              moment(new Date()),
              user_id,
              user_id,
              moment(new Date()),
              true,
              model.display_feature,
            ]);
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async addFeatureUser(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            var checkFeatureUser = await client.query(
              _QueryPermission.checkFeatureUser,
              [
                model.user_id,
                model.feature_id,
              ]
            );
            if(checkFeatureUser.rows.length > 0){
              throw Error("Feature and User has Already!!");
            }

            let id = uuidv4();

            await client.query(_QueryPermission.addFeatureUser, [
              id,
              model.user_id,
              true,
              model.feature_id,
            ]);
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async addMenu(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            var query_sort = await client.query(_QueryPermission.checkMenuSort);
            let sort = query_sort.rows[0].max;
            let id = uuidv4();
            /*    if(model.level == 1){
                  let icon = null;
                  let parent_id = null;
                }else if(model.level == 2){
                  let parent_id = model.parent_id;
                } */
                console.log(model)
               
            await client.query(_QueryPermission.addMenu, [
              id,
              model.name || null,
              model.path || null,
              model.parent_id || null,
              model.level,
              moment(new Date()),
              user_id,
              moment(new Date()),
              user_id,
              true,
              sort + 1,
              model.icon || null,
              model.image_name || null,
              model.image_path || null,
              model.is_image === "image" ? true : false,
              model.display_name || null,

              model.academy || null,
              model.academy_image_name || null,
              model.academy_image_path || null,
              model.academy_image || null,
             
            ]);
           
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async updateMenu(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            console.log(model);
            //throw Error("break");
            await client.query(_QueryPermission.updateMenu, [
              model.id,
              model.name || null,
              model.display_name || null,
              model.path || null,
              moment(new Date()),
              user_id,
              model.parent_id || null,
              model.icon || null,
              model.image_name || null,
              model.image_path || null,
              model.is_image === "image" ? true : false,

              model.academy || null,
              model.academy_image_name || null,
              model.academy_image_path || null,
              model.academy_image || null,

            ]);
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async updateFeature(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            await client.query(_QueryPermission.updateFeature, [
              model.id,
              model.feature,
              model.display_feature,
              model.menu_id,
              user_id,
              moment(new Date()),
            ]);
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async updateFeature_user(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {

            console.log(model)
          
             await client.query(_QueryPermission.delFeaturePemission,[model.user_id]);
             for(let index = 0; index < model.feature.length; index++){
                let pf_id = uuidv4();
                await client.query(_QueryPermission.addFeaturePemission, [
                  pf_id,
                  model.user_id,
                  true,
                  model.feature[index].id,
                ]);
             }
          /*   await client.query(_QueryPermission.updateFeatureUser, [
              model.id,
              model.user_id,
              model.feature_id,
            ]); */
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async delMenu(id, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            var query = await client.query(_QueryPermission.checkSupMenu, [id]);
            if (query.rows[0].count > 0) {
              reject({
                message: "Don't delete because have sup menu",
              });
            } else {
              await client.query(_QueryPermission.delMenu, [id]);
              console.log("COMMIT");
              resolve(true);
            }
            /*   reject({
                message: query,
              }); */
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async delfeature(id, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          console.log(id);
          try {
            await client.query(_QueryPermission.delFeature, [id]);
            resolve(true);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async delfeature_user(id, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          console.log(id);
          try {
            await client.query(_QueryPermission.delFeatureUser, [id]);
            resolve(true);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async filterMenuLv1(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            var temp = await client.query(_QueryPermission.filterMenuLv1, [
              model.name || null,
            ]);

            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            }
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async filterMenuLv2(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {
            var temp = await client.query(_QueryPermission.filterMenuLv2, [
              model.name || null,
              model.parent_id,
            ]);

            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            }
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_Level_1(model) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.get_level_1,[
              model.name || null,
              model.path || null,
            ]);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_Level_2(model) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            console.log(model)
            let temp = await client.query(_QueryPermission.get_level_2,[
              model.name || null,
              model.path || null,
              model.parent_id || null,
            ]);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async get_Level_3(model) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.get_level_3,[
              model.name || null,
              model.path || null,
              model.parent_id || null,
            ]);

            resolve(temp.rows);
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async findLevelById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.find_level_Byid, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows[0]);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async findFeatureById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.findByFeatureId, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows[0]);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async findFeatureUserById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(
              _QueryPermission.findByFeatureUserDataId,
              [id]
            );
            console.log(temp.rows)
          
              resolve(temp.rows);
        
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }


  async getLevel2ByLv1(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
             
          try {
            //console.log(model)
            const arr = [];
            for(var i=0; i < model.length;i++){
              var temp = await client.query(_QueryPermission.getLevelByLv,[model[i].menu_parent]);
              for(var t=0; t < temp.rows.length;t++){
                arr.push(temp.rows[t]);
              }
              
            }
            //console.log(arr)
            if (arr.length > 0) {
              resolve(arr);
            } else {
              resolve(arr);
            } 
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getLevel3ByLv2(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
             
          try {
            console.log(model)
            const arr = [];
            for(var i=0; i < model.length;i++){
              var temp = await client.query(_QueryPermission.getLevelByLv,[model[i].menu_parent]);
              for(var t=0; t < temp.rows.length;t++){
                arr.push(temp.rows[t]);
              }
              
            }
            console.log(arr)
            if (arr.length > 0) {
              resolve(arr);
            } else {
              resolve(arr);
            } 
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  
  
  async addMenuPermission(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
             
          try {
            console.log(model)
            const arr = [];
       
              await client.query(_QueryPermission.delMenuPermission,[model[0].user_id]);
      
            for(var i=0; i < model.length;i++){
              let pm_id = uuidv4();
            await client.query(_QueryPermission.addMenuPermission,[pm_id,model[i].menu_id,true, model[i].user_id]);
            }
            console.log(arr)
            resolve(true);
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async findMenuPermissionByUserId(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
             
          try {
          
          
         
              var temp = await client.query(_QueryPermission.findMenuPermissionByUserId,[user_id]);
               console.log(temp.rows)
              
            
            //console.log(arr)
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            } 
            console.log("COMMIT");
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }


  async getMenuByUserID(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getMenuByUserId, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getFeatureByUserID(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getFeatureByUserId, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
             var temp_Default = {
                user_id:id,
                menu:"",
                feature:"",
              };
              resolve([temp_Default]);
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  
  async sorting_menu(data,admin_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {

            let menuByLevel = await client.query(_QueryPermission.getMenuByLevel, [
                data.menu_level,
              ]);
            

            if (menuByLevel.rows.length === 0) {
              reject("not found");
            }

            
            if (data.sort_type==="sort_up") {
              let menu_for_swap = {};
            for (let index = 0; index < menuByLevel.rows.length; index++) {
              if (data.current_sort_id === menuByLevel.rows[index].id) {
                menu_for_swap["menu_id"] = menuByLevel.rows[index-1].id;
                menu_for_swap["menu_sort"] = menuByLevel.rows[index-1].sort;
              }
            }


           /*  console.log(  menuByLevel); */
           /*  console.log(menu_for_swap.menu_id); */
            
            await client.query(_QueryPermission.update_sort, [
              moment(new Date()),
                admin_id,
              menu_for_swap.menu_sort,
              data.current_sort_id,
            ]);
            
            
            await client.query(_QueryPermission.update_sort, [
              moment(new Date()),
              admin_id,
              data.current_sort,
              menu_for_swap.menu_id,
            ]);

           

            }else if (data.sort_type==="sort_down"){

              let menu_for_swap = {};
              for (let index = 0; index < menuByLevel.rows.length; index++) {
                if (data.current_sort_id === menuByLevel.rows[index].id) {
                  menu_for_swap["menu_id"] = menuByLevel.rows[index+1].id;
                  menu_for_swap["menu_sort"] = menuByLevel.rows[index+1].sort;
                }
              }
              await client.query(_QueryPermission.update_sort, [
                moment(new Date()),
                  admin_id,
                menu_for_swap.menu_sort,
                data.current_sort_id,
              ]);
              
              
              await client.query(_QueryPermission.update_sort, [
                moment(new Date()),
                admin_id,
                data.current_sort,
                menu_for_swap.menu_id,
              ]);
  
             
            }

            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

    
  async getOEMByUserID(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            let temp = await client.query(_QueryPermission.getOEMByUserID, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              reject("not found");
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  async findOemUserById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();
          try {
            console.log(id);
            let temp = await client.query(_QueryPermission.findOemUserById, [
              id,
            ]);
            if (temp.rows.length > 0) {
              resolve(temp.rows);
            } else {
              resolve([]);
            }
          } catch (e) {
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  
  async updateOem_user(model, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        (async () => {
          var client = new Client(connectionConfig);
          await client.connect();

          try {

            console.log(model)
          
            
             
             if ( model.oem.length > 0) {

              await client.query(_QueryPermission.delOemPermission,[model.user_id]);

                  for(let index = 0; index < model.oem.length; index++){
                let pf_id = uuidv4();
                await client.query(_QueryPermission.addOemPermission, [
                  pf_id,
                  model.user_id,
                  model.oem[index].id,
                  true,
                ]);
             }

             }
          
            console.log("COMMIT");
            resolve(true);
          } catch (e) {
            await client.query("ROLLBACK");
            reject(e);
          } finally {
            await client.end();
          }
        })().catch((e) => {
          console.log(e);
          throw Error(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  
}





module.exports = permissionService;
