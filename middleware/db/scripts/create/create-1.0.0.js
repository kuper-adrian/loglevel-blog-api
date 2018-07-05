/**
 * Script to create db structure and necessary db entries for version 1.0.0.
 */
const packageVersion = require('../../../../package.json').version;

const dbVersion = '1.0.0';
// TODO unique and nullable
const DB_SCHEMA = {
  tables: {
    // -----------------------------------------------------------------------------------
    // DB INFO TABLE
    // -----------------------------------------------------------------------------------
    dbInfo: {
      name: 'DbInfo',
      columns: {
        id: {
          name: 'id',
          type: 'INT',
          primary: true,
        },
        version: {
          name: 'version',
          type: 'TEXT',
        },
        created: {
          name: 'created',
          type: 'TEXT',
          description: 'Contains date of database creation',
        }
      }
    },
    // -----------------------------------------------------------------------------------
    // USER TABLE
    // -----------------------------------------------------------------------------------
    user: {
      name: 'User',
      columns: {
        id: {
          name: 'id',
          type: 'INT',
          primary: true,
        },
        firstName: {
          name: 'firstName',
          type: 'TEXT',
        },
        lastName: {
          name: 'lastName',
          type: 'TEXT',
        },
        nickname: {
          name: 'nickname',
          type: 'TEXT',
        },
        email: {
          name: 'email',
          type: 'TEXT'
        },
        password: {
          name: 'password',
          type: 'TEXT',
          description: 'bcrypt hashed password of user',
        }
      },
    },
    // -----------------------------------------------------------------------------------
    // BLOG POST TABLE
    // -----------------------------------------------------------------------------------
    blogPost: {
      name: 'BlogPost',
      columns: {
        id: {
          name: 'id',
          type: 'INT',
          primary: true,
        },
        title: {
          name: 'title',
          type: 'TEXT'
        },
        plug: {
          name: 'plug',
          type: 'TEXT',
        },
        text: {
          name: 'text',
          type: 'TEXT',
          description: 'Contains blog post text as asciidoc',
        },
        published: {
          name: 'published',
          type: 'TEXT',
          description: 'Contains date of publication'
        },
        authorId: {
          name: 'authorId',
          type: 'INT',
          foreignKey: {
            references: 'id',
            inTable: 'user'
          },
        },
      },
    },
    // -----------------------------------------------------------------------------------
    // TAG TABLE
    // -----------------------------------------------------------------------------------
    tag: {
      name: 'Tag',
      columns: {
        id: {
          name: 'id',
          type: 'INT',
          primary: true,
        },
        test: {
          name: 'name',
          type: 'TEXT',
        }
      }
    },
    // -----------------------------------------------------------------------------------
    // BLOG POST TAG JUNCTION TABLE
    // -----------------------------------------------------------------------------------
    blogPostTagJunction: {
      name: 'blogPostTabJunction',
      columns: {
        tagId: {
          name: 'tagId',
          type: 'INT',
          foreignKey: {
            references: 'id',
            inTable: 'Tag',
          },
        },
        blogPostId: {
          name: 'blogPostId',
          type: 'INT',
          foreignKey: {
            references: 'id',
            inTable: 'BlogPost',
          },
        },
      },
    },
  },
};


if (packageVersion !== dbVersion) {
  throw new Error(`Package version (${packageVersion}) does not match version of db that is supposed to be created (${dbVersion})`);
}

const createTable = (knex, table) => {
  return knex.schema.hasTable(table.name)
    .then((exists) => {
      // reject promise if table already exists
      if (exists) {
        return Promise.reject(new Error(`Cant't create table ${table.name} which already exists!`));
      }
      console.log(`creating table ${table.name}`)
      // else create table according to schema object
      return knex.schema.createTable(table.name, (t) => {
        // iterate over every column
        Object.keys(table.columns).forEach((key) => {
          const col = table.columns[key];
          console.log(`creating column ${col.name}`);

        
          // and create it as specified...
          if (col.primary !== undefined && col.primary) {
            t.increments(col.name).primary();
            return;
          }

          if (col.foreignKey !== undefined) {
            console.log('foreign key!')
            if (col.foreignKey.references === undefined || col.foreignKey.inTable === undefined) {
              console.log('invalid')
              return Promise.reject(new Error('invalid foreign key specified'));
            }
            
            console.log('create column itself')
            t.integer(col.name);
            console.log('and reference')
            t.foreign(col.name).references(col.foreignKey.references).inTable(col.foreignKey.inTable);
            return;
          }

          if (col.type === 'INT') {
            t.integer(col.name);
            return;
          }

          if (col.type === 'TEXT') {
            t.text(col.name);
            return;
          }
        });
      });
    })
}



const createDbInfoTable = (knex) => {
  return createTable(knex, DB_SCHEMA.tables.dbInfo)
    .then(() => {
      console.log('creating db info entry');
      return knex(DB_SCHEMA.tables.dbInfo.name).insert({
        version: dbVersion,
        created: (new Date()).toISOString(),
      })
    })
}

const createUserTable = (knex) => {
  return createTable(knex, DB_SCHEMA.tables.user)
    .then(() => {
      console.log('creating admin user entry');
      // create the only user 
      return knex(DB_SCHEMA.tables.user.name).insert({
        // TODO add admin user with parameters from command line
      })
    })
}

const createBlogPostTable = (knex) => {
  return createTable(knex, DB_SCHEMA.tables.blogPost);
}

const createTagTable = (knex) => {
  return createTagTable(knex, DB_SCHEMA.tables.tag);
}

const createBlogPostTagJunctionTable = (knex) => {
  return createTable(knex, DB_SCHEMA.tables.blogPostTagJunction);
}

/**
 * Returns promise to create all tables and necessary entries.
 * @param {knex} knex 
 */
exports.create = (knex) => {
  return createDbInfoTable(knex)
    .then(() => createUserTable(knex))
    .then(() => createBlogPostTable(knex))
    .then(() => createTagTable(knex))
    .then(() => createBlogPostTagJunctionTable(knex))

    .catch((error) => {
      // TODO logging
      console.log(error.message);
    })
}