const packageVersion = require('../../package.json').version;
const dbCreator = require(`./scripts/create/create-${packageVersion}`);

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let knex = require('knex');

const dataFolderPath = './data';
const dbFilePath = `${dataFolderPath}/dev-null.db`;

exports.init = () => {
  console.log('db initialisation started')
  return new Promise((resolve, reject) => {
    // make sure that data folder exists
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath);
    }

    let wasCreated = false;

    // create db file if it doesnt already exist
    if (!fs.existsSync(dbFilePath)) {
      const db = new sqlite3.Database(dbFilePath);
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
      console.log('creating new database');
      return dbCreator.create(knex);
    }

    return resolve();
  });
}