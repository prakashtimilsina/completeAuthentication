const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');
//const { transporter } = require('../config/emailconfig');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");

dotenv.config()




class UserController{
    static userRegistration = async (req, res)=>{
        const {name, email, password, password_confirmation, tc} = req.body;
        const user = await UserModel.findOne({email: email});
        if (user){
            res.send({"status":"failed", "message": "Email already exists"})
        }else{
            if(name && email && password && password_confirmation && tc){
                if(password === password_confirmation){
                    try{
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt)
                        const userdoc = new UserModel({
                        name: name,
                        email: email,
                        password: hashPassword,
                        tc: tc
                    })
                    await userdoc.save()
                    const savedUser = await UserModel.findOne({ email : email});

                    //Generate JWT Token
                    const token = jwt.sign({userID:savedUser._id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

                    res.status(201).send({"status": "Success", "message" : "Registration Success", "token" : token })
                    }catch(error){
                        console.log(error)
                        res.send({"status": "failed", "message":"Unable to Register"})
                    }

                }else{
                    res.send({"status":"failed", "message": "password and confirm passowrd donot match"})
                }
            }else{
                res.send({"status":"failed", "message": "All fields are required."})
            }
        }
    }

    static userLogin = async (req, res) =>{
        try {
            const {email, password} = req.body;
            if ( email && password ){
                const user = await UserModel.findOne({ email : email });
                if (user != null){
                    const isMatch = await bcrypt.compare(password, user.password);
                    if(user.email === email && isMatch){
                        //Generate JWT Token
                        const token = jwt.sign({ userID: user._id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn : '5m' })
                        res.status(200).send({ "status" : "Success", "message" : "Login is successful" , "token" : token })
                    }else {
                        res.status(404).send({"status": "failed", "message":"Email or password is not valid"})
                    }
                }else{
                    res.status(404).send({ "status" : "failed", "message" : "You are not a registered user"})
                }

            }else{
                res.status(404).send({"status":"failed", "message": "All fields are mandatory"})
            }
        } catch (error) {
            console.log(error)
            res.status(404).send({"status":"failed", "message":"Unable to login"})
        }
    }

    static changeUserPassword = async(req, res) => {
        const { password, password_confirmation } = req.body
        if(password && password_confirmation){
            if (password !== password_confirmation){
                res.send({ "status" : "failed", "message" : "New Password and confirm new password does not match"})
            }else{
                const salt = await bcrypt.genSalt(10)
                const newhashPassword = await bcrypt.hash(password, salt)

                // console.log(req.user)
                await UserModel.findByIdAndUpdate(req.user._id, { $set: {
                    password: newhashPassword
                }})

                res.send({ "status" : "success", "message" : "Password changed successfully"})

            }
        }else{
            res.send({ "status" : "failed", "message" : "All fields are required"})
        }
    }

    static loggedUser = async (req, res)=>{
        res.send({"user" : req.user});
    }

    static sendUserPasswordResetEmail = async (req, res)=>{
        const { email } = req.body
        if(email){
            const user = await UserModel.findOne({ email : email })
            if (user){
                const secret = user._id + process.env.ACCESS_TOKEN_SECRET
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '30m' })
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                console.log(link)
                //Send reset link email
                //for gmail -  generate app password and save into dotenv file
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER, //Admin Gmail ID
                        pass: process.env.EMAIL_PASS, //Admin Gmail password
                    }
                })          
                const mailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject:"TestShop - Password Reset link",
                    html: `<a href= ${link}>Click here</a> to reset your password`
                }         
                await transporter.sendMail(mailOptions, (err, result) => {
                    if (err){
                    console.log(err)
                    res.send({"status":"failed", "message": "Error occurred while sending email", "error-description": err.message })
                    } else{
                        res.send({"status":"success", "message": "reset email is sent. please check your email.", "info" : result})
                    }
                })
            }else{
                res.send({"status":"failed", "message": "Email does not exist."})
            }
        }else{
            res.send({"status":"failed", "message": "Email field is required."})
        }

    }

    static userPasswordReset = async (req, res)=>{
        const{ password, password_confirmation } = req.body;
        const { id , token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.ACCESS_TOKEN_SECRET
        try {
            jwt.verify(token, new_secret)
            if(password && password_confirmation ){
                if(password !== password_confirmation){
                    res.send({"status":"failed", "message": "password and confirm password do not match."})
                }else{
                    const salt = await bcrypt.genSalt(10)
                    const newhashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(user._id, { $set: {
                        password: newhashPassword
                    }})

                    res.send({"status":"success", "message": "password is successfully reset."})
                }
            }else{
                res.send({"status":"failed", "message": "all fields are required."})
            }
        } catch (error) {
            console.log(error)
            res.send({"status":"failed", "message": "link is expired or invalid token."})

        }
    }
}

module.exports = UserController