
import jwt from 'jsonwebtoken';
import {default as config} from '../config/index.js'


export const regRequestisValid = (req) => {
    if (!Object.hasOwn(req.body, 'username')) return false;
    if (!Object.hasOwn(req.body, 'email')) return false;
    if (!Object.hasOwn(req.body, 'password')) return false;
    return true
  }

export const loginRequestisValid = (req) => {
    if (!Object.hasOwn(req.body, 'id')) return false;
    if (!Object.hasOwn(req.body, 'password')) return false;
    return true
  }

export const refreshRequestisValid = (req) => {
    if (!Object.hasOwn(req.body, 'refresh_token')) return false;
    return true
  }

export const generateTokens = (user, access_only) => {
    const tokens = {
        access: jwt.sign({ user: user }, config.access_secret, { expiresIn: config.access_ttl }),
        refresh: jwt.sign({ user: user }, config.refresh_secret, { expiresIn: config.refresh_ttl })
      }
    if (access_only) {
        return tokens.access
    } else {
        return tokens
    }
    
}
