/**
 * Script to create db structure and necessary db entries for version 1.0.0.
 */

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
        name: {
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
  return knex.hasSchema(table.name)
    .then((exists) => {
      // reject promise if table already exists
      if (!exists) {
        return Promise.reject(new Error(`Cant't create table ${table.name} which already exists!`));
      }

      // else create table according to schema object
      return knex.schema.createTable(table.name, (t) => {
        // iterate over every column
        Object.keys(table.columns).forEach((col) => {
          // and create it as specified...

          if (col.primary !== undefined && col.primary) {
            t.increments(col.name).primary();
            return;
          }

          if (col.foreignKey !== undefined) {
            if (col.foreignKey.references === undefined || col.foreignKey.inTable === undefined) {
              return Promise.reject(new Error('invalid foreign key specified'));
            }
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
      return knex(DB_SCHEMA.tables.dbInfo.name).insert({
        version: dbVersion,
        created: (new Date()).toISOString(),
      })
    })
}

const createUserTable = (knex, trx) => {
  return createTable(knex, DB_SCHEMA.tables.user)
    .then(() => {
      // create the only user 
      return knex(DB_SCHEMA.tables.user.name).insert({
        // TODO add admin user with parameters from command line
      })
    })
}

const createBlogPostTable = (knex, trx) => {

}

const createTagTable = (knex, trx) => {

}

const createBlogPostTagJunctionTable = (knex, trx) => {

}

/**
 * Returns promise to create all tables and necessary entries.
 * @param {knex} knex 
 */
exports.create = (knex) => {
  return createTable(knex, DB_SCHEMA.tables.dbInfo) 
    .then(() => createTable(knex, DB_SCHEMA.tables.user))
    .then(() => createTable(knex, DB_SCHEMA.tables.blogPost))
    .then(() => createTable(knex, DB_SCHEMA.tables.tag))
    .then(() => createTable(knex, DB_SCHEMA.tables.blogPostTagJunction))

    .catch((error) => {
      // TODO logging
      console.log(error.message);
    })
}