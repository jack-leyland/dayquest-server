import pg from 'pg'
import config from '../config/index.js'
const { Pool } = pg

const connectionString = config.isProduction ? config.DBUrl : config.testDBUrl
const pool = new Pool({
    connectionString,
})


export const postgresQuery = async (queryString, params) => {
    const start = Date.now()
    const res = await pool.query(queryString, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
}

export const getClient = async () => {
    const client = await pool.connect()
    const query = client.query
    const release = client.release

    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!')
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)

    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      clearTimeout(timeout)
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
}