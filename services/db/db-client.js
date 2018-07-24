const packageVersion = require('../../package.json').version;

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
let knex = require('knex');

const SALT_ROUNDS = 10;

const dataFolderPath = './data';
const dbFilePath = `${dataFolderPath}/dev-null.db`;

/**
 * Initialises the database on app startup.
 * Creates database if necessary and seeds initial db entries.
 * @param {Object} initialUser Object that contains nickname and password of the
 * initial db admin user
 */
exports.init = function init(initialUser) {
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
        { encoding: 'utf8' },
      );

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

    // if the database had to be created, we need to add a initial admin user
    // and other initial data to the database
    if (wasCreated) {
      // make sure initialUser parameter was passed
      if (!initialUser) {
        // delete newly created db file since setup failed
        fs.unlinkSync(dbFilePath);

        reject(new Error('no initial user passed on db creation'));
      }
      // ...and contains the needed properties
      if (!initialUser.nickname || !initialUser.password) {
        // delete newly created db file since setup failed
        fs.unlinkSync(dbFilePath);

        reject(new Error('no nickname or password specified for initial user'));
      }

      const creationDate = new Date().toDateString();

      knex('DbInfo').insert({
        version: packageVersion,
        created: creationDate,
        guidNamespace: uuidv1(),
      })

        .then(() => bcrypt.hash(initialUser.password, SALT_ROUNDS))

        .then(hash => knex('User').insert({
          nickname: initialUser.nickname,
          password: hash,
        }))

        .then(() => resolve())

        .catch((error) => {
          // delete newly created db file since setup failed
          fs.unlinkSync(dbFilePath);

          reject(error);
        });
    }
    return resolve();
  });
};

exports.getRegisteredUser = (username, plainPassword) => {
  let user = null;

  return knex.select('nickname', 'password').from('User').where({ nickname: username })
    .then((rows) => {
      if (rows.length === 0) return null;

      const bcryptHash = rows[0].password;
      user = {
        nickname: rows[0].nickname,
      };

      return bcrypt.compare(plainPassword, bcryptHash);
    })

    .then(passwordMatch => (passwordMatch ? user : null))

    .catch((error) => {
      console.log(error);
      return null;
    });
};

exports.getGuidNamespace = () => knex.select('guidNamespace').from('DbInfo')
  .then(rows => rows[0].guidNamespace);
