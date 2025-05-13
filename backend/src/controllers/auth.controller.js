import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import {generateToken} from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req,res)=>{
    const {fullName,email,password} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(500).json({message:"All fields are required"});
        }
        // create the user -> hashing the password -> create the token -> send the response
        const user = await User.findOne({email});
        if (user){
            return res.status(400).json({message:"User already exists"});
        }
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if(!gmailRegex.test(email)){
            return res.status(400).json({message:"Please enter a valid gmail address"});
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
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

export const login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }
        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })
    } catch (error) {
        console.log("Error in login controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("token","",{maxAge:0});
        res.status(200).json({message:"Logout successfull"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const {profilePic}=req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Please provide a profile picture"});
        }
        const uploadResoponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResoponse.secure_url},{new:true});
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}

export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}