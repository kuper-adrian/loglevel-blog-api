const packageVersion = require('../../package.json').version;

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const moment = require('moment');
let knex = require('knex');

const { BreakError } = require('../../models/BreakErrors');
const logger = require('../../services/logger').getLogger();

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

  return knex('User').where({ nickname: username })
    .then((rows) => {
      if (rows.length === 0) return null;

      const bcryptHash = rows[0].password;
      [user] = rows;

      return bcrypt.compare(plainPassword, bcryptHash);
    })

    .then(passwordMatch => (passwordMatch ? user : null))

    .catch((error) => {
      logger.error(error);
      return null;
    });
};

exports.saveRefreshToken = (refreshToken, userId) => {
  if (!refreshToken || !userId) {
    return Promise.reject(new Error('invalid parameters'));
  }

  return knex.transaction(trx =>
    knex('RefreshToken')
      .transacting(trx)
      .delete()
      .where({
        userId,
      })

      .then(() =>
        knex('RefreshToken')
          .transacting(trx)
          .insert({
            uuid: refreshToken,
            expires: moment().add(1, 'days').toISOString(),
            created: moment().toISOString(),
            userId,
          }))

      .then(trx.commit)
      .catch(trx.rollback));
};

exports.doesUserExist = nickname =>
  knex('User').where({ nickname })
    .then(rows => rows.length === 1);

exports.getUserByNickname = (nickname) => {
  if (!nickname) {
    return Promise.reject(new Error('nickname parameter required!'));
  }

  return knex('User').where({ nickname })
    .then((rows) => {
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    });
};

exports.getRefreshToken = (userId) => {
  if (!userId) {
    return Promise.reject(new Error('invalid parameters'));
  }

  return knex('RefreshToken').where({ userId })
    .then((rows) => {
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    });
};

exports.getBlogPostById = (postId) => {
  let blogPost = {};

  return knex('BlogPost')
    .join('User', 'BlogPost.authorId', 'User.id')
    .where('BlogPost.id', postId)
    .select(
      'BlogPost.id',
      'BlogPost.title',
      'BlogPost.plug',
      'BlogPost.text',
      'BlogPost.published',
      'User.firstName',
      'User.lastName',
    )

    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject(new BreakError('Post not found'));
      }
      [blogPost] = rows;

      return knex('BlogPost')
        .join('BlogPostTagJunction', 'BlogPost.id', 'BlogPostTagJunction.blogPostId')
        .join('Tag', 'BlogPostTagJunction.tagId', 'Tag.id')
        .where('BlogPost.id', blogPost.id)
        .select('Tag.name');
    })

    .then((tags) => {
      blogPost.tags = [];

      for (let i = 0; i < tags.length; i += 1) {
        const tag = tags[i];
        blogPost.tags.push(tag.name);
      }

      return blogPost;
    })

    .catch((error) => {
      if (error instanceof BreakError) {
        logger.info(error.message);
      } else {
        logger.error(error);
      }
      return null;
    });
};
