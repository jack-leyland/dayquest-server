import { getClient } from "./index.js";
import {Tables} from "../constants/Tables.js"

// Note: This database serves as a server-side copy of the mobile client's local SQLite database, hence the simplified types.

export default async () => {
    const client = await getClient()
    try {
        await client.query('BEGIN')
        Tables.forEach(async (query) => {
            await client.query(query)
        })
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
    } finally{
        client.release()
    }
}

