'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var formidable = require('formidable');
var fileupload = require('express-fileupload');
var multer = require('multer');

const isset = require('isset-php');

var mongoose = require('mongoose'),
User = mongoose.model('user');

var mongoose = require('mongoose'),
Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};




exports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  Task.findByemail(req.body.email, function(err, task) {
   if (task == null) {
    new_task.save(function(err, task) {
      if (err)
        res.send(err);
      res.json(task);
    });
  }else{
    res.json(['msg','user exit']);

  }
});





};

// exports.regester1 = function(req, res) {
//   var new_user = new User({email:req.body.email,number:req.body.number,name:req.body.name});
//  // var new_user = new User(req.body);
//  User.findByemail(req.body.email, function(err, user) {
//   User.findBynumber(req.body.number, function(err, user1) {

//        // res.json(user);

//        if (user == null) {
//          if (user1 == null) {
//           new_user.save(function(err, user) {
//             if (err)
//               res.send(err);
//             res.json(user);
//           });
//         }else{
//           res.json({"msg":"Number alrady in db"});

//         }
//       }else{
//         res.json({"msg":"email alrady in db"});

//       }
//     });
// });

// };


exports.regester = function(req, res, next) {
  var email = req.body.email;
  var name  = req.body.name;
  var number = req.body.number;
  var password = req.body.password;
  User.findByemail(email, function(err, user) {
    User.findBynumber(number, function(err, user1) {
     if (user == null) {
       if (user1 == null) {
        bcrypt.hash(password, 10, function(err, hash) {
          if (err) {
            return res.json({
              message:"something went worng ",
              error:err
            });
          }else{
            var new_user = new User({email:email,number:number,name:name,password:hash});
            new_user.save().then(doc=>{
              const token =  jwt.sign({user_id:doc._id},'test');
              var data = [{
                id  :doc._id,
                name  :doc.name,
                email :doc.email,
                number:doc.number,
                token :token,
              }];
              res.status(201).json({
                message:"user regester successfully",
                results:data,
              })
            });
          }
        });
      }else{
        return res.json({
          message:"number alrady exist",
          error:err
        });
      }
    }else{
     return res.json({
      message:"email alrady exist",
      error:err
    });
   }
 });
  });
};



exports.login = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  User.find({email:email})
  .exec()
  .then(user_info=>{
    if (user_info.length < 1) {
      res.status(401).json({
        message:"user not exist",
      })
    }else{
      bcrypt.compare(password, user_info[0].password, function(err, result) {
        if (!result) {
          res.status(401).json({
            message:"password not match",
          })
        }
        if (result) {
          const token =  jwt.sign({user_id:user_info[0]._id},'test');
          var data = [{
            id   :user_info[0]._id,
            name  :user_info[0].name,
            email :user_info[0].email,
            number:user_info[0].number,
            token :token,
          }];
          res.status(200).json({
            message:"Login successfully",
            user_data:data,
          })
        }
      });
    }
  });
};

exports.get_profile = function(req, res) {
  var token = req.body.token;
  const decoded = jwt.verify(token, "test");  
  var user_id = decoded.user_id;
  User.find({_id:user_id})
  .exec()
  .then(user_info=>{
    if (user_info.length < 1) {
      res.status(401).json({
        message:"user not found",
      })
    }else{
      var data = [{
        id   :user_info[0]._id,
        name  :user_info[0].name,
        email :user_info[0].email,
        number:user_info[0].number,
        token :token,
      }];
      res.status(200).json({
        message:"successfully",
        user_data:data,
      })
    }
  });
};

exports.profile_update = function(req, res, next) {
   //console.log(req.files.img.name);

   var token = req.body.token;
   var name = req.body.name;
   const decoded = jwt.verify(token, "test");  
   var user_id = decoded.user_id;
   User.find({_id:user_id})
   .exec()
   .then(user_info=>{
    if (user_info.length < 1) {
      res.status(401).json({
        message:"user not found",
      })
    }else{
  //  console.log(img);
  if (req.files) {
   var img = req.files.img;
   img.mv('./uploads/' + img.name);
   var full_img = img.name;
   var data_to_update = {
    name    :name,
    img    :full_img,
  };
}else{
 var data_to_update = {
  name    :name,
};
}
   //console.log(data_to_update);
   var update = User.findByIdAndUpdate(user_id,data_to_update);
   update.exec(function(err,data_update){
    if (data_update) {
      User.find({_id:user_id})
      .exec()
      .then(user_new_data=>{
        var data = [{
          id    :user_new_data[0]._id,
          name  :user_new_data[0].name,
          email :user_new_data[0].email,
          number:user_new_data[0].number,
          img   :user_new_data[0].img,
          token :token,
        }];
        res.status(200).json({
          message:"Update successfully",
          user_data:data,
        })
      });
    }
  })
 }
});
 };



 exports.read_a_task = function(req, res) {
  Task.findById(req.params.taskId, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};

