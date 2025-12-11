import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { promisify } from 'util';

const verifyToken = promisify(jwt.verify);

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        
        if(!token) {
            return res.status(401).json({message: "Access token not found!"});
        }

        const decodedUser = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedUser.userId).select('-hashedPassword');

        if (!user) {
            return res.status(404).json({message: "User not exists"});
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({message: "Invalid or expired token"});
        }
        console.error("Auth middleware error:", error);
        return res.status(500).json({message: "System failed!"});
    }
}