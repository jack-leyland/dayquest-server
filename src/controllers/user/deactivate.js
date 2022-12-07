import { postgresQuery } from "../../db/index.js"
import RefreshTokenModel from "../../models/RefreshTokens.js"
import UserModel from "../../models/User.js"

export const deactivateUserController = async (req, res) => {
    try {
        let doc = await UserModel.findOneAndUpdate({userId: req.user.userId, active: true}, {$set: {active: false}})
        if (!doc) {
            return res.status(404)
        }
        postgresQuery(`UPDATE users SET active=0 WHERE "userId"=$1`,[req.user.userId])
        await RefreshTokenModel.deleteMany({userId: req.user.userId})
        return res.json({
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.json({
            success: false
        })
    }
}