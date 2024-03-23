const UserModel = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');

exports.createUser =  (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new UserModel({
            email: req.body.email,
            password: hash
        });

        user.save().then((result) => {
            res.status(201).json({
                message: "User account created Sucessfully!",
                result: result
            })
        }).catch((err) => {
            res.status(500).json({
                err: err
            })
        })
    });
};

exports.userLogin = (req, res, next)=>{
    let fetchedUser;
    user.findOne({email: req.body.email}).then((userDetails)=>{
        if(!userDetails){
            return res.status(401).json({
                message: "User not Found Ayuth Failed"
            })
        };
        fetchedUser = userDetails;
        return bcrypt.compare(req.body.password, userDetails.password)
    }).then((result)=>{
        if(!result){
            return res.status(401).json({
                message: "User not Found Ayuth Failed"
            })
        };
        const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, "SECRET_IT_SHOULD_BE_LONGER",{ expiresIn: '1h'})
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id
        })
    }).catch(err=>{
        res.status(401).json({
            message: "Invalid credentials!",
            err: err
        })
    })
};