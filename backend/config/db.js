const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const server = process.env.DB_SERVER;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

// Sử dụng msnodesqlv8 (native driver) với chế độ User/Password
const dbConfig = {
    connectionString: `Driver={SQL Server};Server=${server};Database=${database};Uid=${user};Pwd=${password};`
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Đã kết nối SQL Server thành công với User:', user, 'vào Database:', database);
        return pool;
    })
    .catch(err => {
        console.log('❌ Lỗi kết nối SQL Server! Kiểm tra lại thông tin trong .env');
        console.error(err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
