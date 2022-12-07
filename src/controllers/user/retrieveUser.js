import { postgresQuery } from '../../db/index.js';
import {default as UserModel} from '../../models/User.js';

export const activeUserController = async (req, res) => {
    const user = await UserModel.findOne({userId: req.user.userId, active: true})
    if (!user) {
        return res.json({
            exists: false
        })
    } else {
        if (req.query.return) {
            const queryResult = await postgresQuery('SELECT exp, level FROM users WHERE "userId"=$1',[req.user.userId])
            let userObject = {
                userId: user.userId,
                username: user.username,
                email: user.email,
                devices: user.devices,
                active: user.active,
                level: queryResult.rows[0]["level"],
                exp: queryResult.rows[0]["exp"]
            }
            return res.json({
                user: userObject,
                exists: true
            })
        } else {
            return res.json({
                exists: true
            })
        }


    }
}