const { MongoClient } = require('mongodb');

const CONFIG = {
    CONN: "mongodb://admin:admin@10.254.192.212:20001?authSource=admin",
    DB: 'potencia'
}

console.log('---');

const clientMdb = new MongoClient(CONFIG.CONN);

const gpon_onus_dbm = clientMdb.db(CONFIG.DB).collection('gpon_onus_dbm');

const docs = gpon_onus_dbm.find({});

console.log(docs);