import {default as UserModel} from '../../models/User.js';

export const activeUserController = async (req, res) => {
    
    const user = await UserModel.findOne({userId: req.params.userId, active: true})
    if (!user) {
        return res.json({
            exists: false
        })
    } else {
        return res.json({
            exists: true
        })
    }
}