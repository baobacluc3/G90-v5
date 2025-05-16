
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', 
  database: 'petcare', 
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err.message);
  } else {
    console.log('✅ Đã kết nối MySQL thành công!');
  }
});

module.exports = connection;
