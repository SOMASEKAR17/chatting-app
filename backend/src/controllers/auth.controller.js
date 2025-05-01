import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import {generateToken} from '../lib/utils.js'

export const signup = async (req,res)=>{
    const {fullName,email,password} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(500).json({message:"All fields are required"});
        }
        // create the user -> hashing the password -> create the token -> send the response
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        const user = await User.findOne({email});
        if (user){
            return res.status(400).json({message:"User already exists"});
        }
        if (!regex.test(password)){
            return res.status(400).json({message:"Password is weak"});
        }
       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
            // generating jwt token
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
        }else{
            return res.status(400).json({message:"Invalid user data"});
        }
    } catch (error) {
        console.log("error in signup controller",error.message);
        return res.status(500).json({message:"internal server error"});
    }
}

export const login = (req,res)=>{
    res.send('login route');
}

export const logout = (req,res)=>{
    res.send('logout route');
}