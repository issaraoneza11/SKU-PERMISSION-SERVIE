const Axios = require('axios');
const config = require('../../../appSettingSite');

class allconService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_ALLCON}`,
            headers: {
                'Content-Type': 'application/json',
            },
            transformRequest: [function (data, headers) {

                if (token) {
                    headers.Authorization = "Bearer " + token
                }
              
                return JSON.stringify(data);
            }]

        });
    }


    async getMasterOrganize(token, account_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/master/organize?accountId=${account_id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                 console.log('error', error)
                resolve(null)
            }
        });
    }

    async getMasterOrganizeCreate(token, tempData) {
        return new Promise(async (resolve, reject) => {
            try {
        
                const url = `/organize/organizations?type=Create&offset=0&search=&limit=9999`;
                const { data } = await this.Api(token).get(url,tempData);
                resolve(data);
            } catch (error) {
                 console.log('error', error)
                resolve(null)
            }
        });
    }

    async getMasterOrganizeInvite(token, tempData) {
        return new Promise(async (resolve, reject) => {
            try {
             
                const url = `/organize/organizations?offset=0&limit=9999&type=Invite`;
                const { data } = await this.Api(token).get(url,tempData);
                resolve(data);
            } catch (error) {
                 console.log('error', error)
                resolve(null)
            }
        });
    }


    async refreshAllconToken(token, access_token,refresh_token) {
        return new Promise(async (resolve, reject) => {
            try {
                let temp = {
                    access_token:access_token,
                    refresh_token:refresh_token,
                    app_id:'e77267cc-eecf-4492-b21c-4358d97d38b4',
                }

                console.log(temp)
                const url = `/oauth2/refresh-token`
                const { data } = await this.Api(access_token).post(url,temp)
                resolve(data);
            } catch (error) {
                 console.log('error', error)
                resolve(null)
            }
        });
    }


    async changeAllConOrganize(access_token,organize_code) {
        return new Promise(async (resolve, reject) => {
            try {
                
          
   
                const url = `/master/organize-change?organizecode=${organize_code}&appid=${config.APP_ID}`
                const { data } = await this.Api(access_token).get(url);
               /*  console.log("dataCHG",data) */
                resolve(data);
            } catch (error) {
                 console.log('error', error)
                resolve(null)
            }
        });
    }

   

    
}


module.exports = allconService;