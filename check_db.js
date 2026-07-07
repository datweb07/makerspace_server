const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mswebsite_vi',
  password: '123456',
  port: 5432,
});
client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'workshops' AND table_name = 'diy'"))
  .then(res => console.log('workshops.diy:', res.rows))
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'workshops' AND table_name = 'short_courses'"))
  .then(res => console.log('workshops.short_courses:', res.rows))
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'workshops' AND table_name = 'schedules'"))
  .then(res => console.log('workshops.schedules:', res.rows))
  .catch(err => console.error(err))
  .finally(() => client.end());
