const low = require('lowdb')
const storage = require('lowdb/browser')

const db = low('db', { storage })

module.exports = db;