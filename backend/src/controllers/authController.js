import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
    try {
        const {username , password, email, firstName, lastName} = req.body;

        if(!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({message: "Must fill in all fields!"});
        }

        // Check if user exists
        const duplicate = await User.findOne({username});
        if(duplicate) {
            res.status(409).json({message: "username is exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user
        await User.create({
            username, 
            hashedPassword,
            email,
            displayName:`${firstName} ${lastName}`
        })

        // success
        return res.sendStatus(204);
    } catch (error) {
        console.error("Failed in signup.", error);
        return res.status(500).json({message: "System failed."});
    }
}

export const signIn = async (req, res) => {
    try {
        // input
        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(400).json({message: "Must fill in username ad password!"});
        }

        // compare hashed password to password 
        const user = await User.findOne({username})

        if(!user) {
            return res.status(401).json({message: "username or password not correct!"});
        }

        const correctPassword = await bcrypt.compare(password, user.hashedPassword);

        if (!correctPassword) {
            return res.status(401).json({message: "username or password not correct!"});
        }
        
        // create access token with jwt
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

        // refresh token 
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // create new session to save refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        // send refresh token via cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: REFRESH_TOKEN_TTL
        })

        // respond refresh token
        return res.status(200).json({message: `User ${user.displayName} has successfully logged in`, accessToken});
        
    } catch (error) {
        console.error("Failed in signin.", error);
        return res.status(500).json({message: "System failed."});
    }
}

export const signOut = async (req, res) => {
    try {
        // get refresh token from cookie
        const token = req.cookies?.refreshToken;

        if(token) {
            await Session.deleteOne({refreshToken: token});

            res.clearCookie("refreshToken");
        }
        
        return res.sendStatus(204);
    } catch (error) {
        console.error("Failed in sign out", error);
        return res.status(500).json({message: "Sytem failed"});
    }
}