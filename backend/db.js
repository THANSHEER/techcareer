const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'techcareer.db');
const db = new sqlite3.Database(dbPath);

// Promise wrappers for database operations
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database run error:', sql, err);
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) {
        console.error('Database get error:', sql, err);
        reject(err);
        return;
      }
      resolve(result || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database all error:', sql, err);
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
};
