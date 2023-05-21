const Axios = require('axios');
const config = require('../../../appSettingSite');

class uploadService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_UPLOAD_FILE}`,
            headers: {
                'Content-Type': 'application/json',
            },
            transformRequest: [function (data, headers) {

                if (token) {
                    headers.Authorization = "Bearer " + token
                }
                headers["x-ttt"] = config.CUSTOMHERDERKEY;
                return JSON.stringify(data);
            }]

        });
    }

    async SaveFileUpload(token, tempData) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/upload/addFileUpload`
                const { data } = await this.Api(token).post(url,tempData)
                resolve(data);
            } catch (error) {
                // console.log('error', error)
                resolve(null)
            }
        });
    }

   

    
}


module.exports = uploadService;