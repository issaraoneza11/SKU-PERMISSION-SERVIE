const clientQuery = require('../lib/clientQuery');
const queryMenu = require("../query/queryMenu");

const filterMenuService = async (value) => {
    const callback = await clientQuery(queryMenu.filterMenuService, value)
    return callback.rows
}

const getUserByIdService = async (value) => {
    const callback = await clientQuery(queryMenu.getUserByIdService, value)
    return callback.rows
}

const getOemByIdService = async (value) => {
    const callback = await clientQuery(queryMenu.getOemByIdService, value)
    return callback.rows
}

const getOemByCompanyIdService = async (value) => {
    const callback = await clientQuery(queryMenu.getOemByCompanyIdService, value)
    return callback.rows
}
module.exports = {
    filterMenuService,
    getUserByIdService,
    getOemByIdService,
    getOemByCompanyIdService
}