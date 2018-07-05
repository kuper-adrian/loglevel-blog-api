const packageVersion = require('../../package.json').version;

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let knex = require('knex');

const dataFolderPath = './data';
const dbFilePath = `${dataFolderPath}/dev-null.db`;

exports.init = () => {
  return new Promise((resolve, reject) => {
    // make sure that data folder exists
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath);
    }

    let wasCreated = false;

    // create db file if it doesnt already exist
    if (!fs.existsSync(dbFilePath)) {
      const db = new sqlite3.Database(dbFilePath);

      const createScript = fs.readFileSync(
        `${__dirname}/scripts/create/${packageVersion}.sql`, 
        { encoding: 'utf8' });
    
      db.serialize(() => {
        db.exec(createScript.toString()); 
      });

      db.close();

      wasCreated = true;
    }

    /* eslint global-require: "off" */
    knex = require('knex')({
      client: 'sqlite3',
      connection: {
        filename: dbFilePath,
      },
      useNullAsDefault: true,
    });
  

    if (wasCreated) {
      return knex('DbInfo').insert({ version: packageVersion, created: (new Date()).toISOString() })
        .then(() => {
          // TODO change
          return knex('User').insert({
            nickname: 'admin',
            password: 'admin',
          })
        })
    }
    return resolve();
  });
}