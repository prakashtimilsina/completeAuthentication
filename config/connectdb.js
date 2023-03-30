const mongoose = require('mongoose');

const connectDb = async (DATABASE_URL) => {
    try{
        const DB_OPTIONS ={
            dbName: 'PTshopee'
        }
        const connect = await mongoose.connect(DATABASE_URL, DB_OPTIONS)
        console.log('Connected Successfully at host:',
            connect.connection.host, 'database:',
            connect.connection.name)
    }catch(error){
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDb;