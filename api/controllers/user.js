  
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');


  const User = require('../models/user');

  exports.user_signup = (req, res, next) =>{
      User.find({email: req.body.email})
      .exec()
      .then(user => {
        if(user.length >= 1){
          return res.status(409).json({
            message: 'Email exists'
          });
        }else{
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if(err){
              return res.status(500).json({ 
                error: err
              });
            }else{
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            }); 
            user
            .save() 
            .then(result => {
              console.log(result);
              res.status(201).json({
                message: 'User created'
              });
            }) 
            .catch(err => {
              console.log(err);
              res.status(500).json({
                  error: err
              });
            });
          }
        });
        }
      });
    }

    exports.user_login =  (req, res, next) => {
      console.log("Email:", req.body.email); 
      console.log("Password:", req.body.password);
    
      User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
          if (!user) {
            return res.status(401).json({
              message: 'Authorization failed: Email not found'
            });
          }
          bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err || !result) {
              return res.status(401).json({
                message: 'Authorization failed: Incorrect password'
              });
            }
            const token = jwt.sign({
              email: user.email,
              userId: user._id
            }, "secret", { expiresIn: "1h" });
    
            res.status(200).json({
              message: 'Auth successful',
              token: token
            });
          });
        })
        .catch(err => {
          console.log("Error:", err); 
          res.status(500).json({
            error: err
          });
        });
    }

    exports.user_delete = (req, res, next) =>{
      User.deleteOne({_id: req.params.userId}) 
      .exec()
      .then(result => { 
        res.status(200).json({
          message: 'User deleted'
        })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
      });
    }