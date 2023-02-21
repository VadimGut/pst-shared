import knex from 'knex' 

export const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USERNAME || 'your_database_user',
    password: process.env.DATABASE_PASSWORD || 'your_database_password',
    database: process.env.DATABASE_NAME || 'myapp_test',
    ssl: false
  }
});
