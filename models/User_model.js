const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name:{
    type : String,
    required : [true, 'Please add a name']
  },
  email:{
    type: String,
    required : [true,'please add a email'],
    unique : true,
    match : [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ,'Please add valid email'
    ]
  },
  role: {
    type : String,
    enum : ['user','publisher'],
    default : 'user'
  },
  password:{
    type : String,
    required : [true, 'please add a password'],
    minlength : 6,
    // querybuilder select false(비번이닝께)
    select : false
  },
  resetPasswordToken : String,
  resetPasswordExpire : Date,
  createdAt : {
    type : Date,
    default : Date.now
  }
})

// encrypt password bring bcrypt(패스워드 암호화!!)
UserSchema.pre('save',async function(next){

  // 만약에 reset password 가 아니 password를 저장할때만 
  // 이 함수를 사용해라 
  if(!this.isModified('password')){
     next() 
  }

  // 암호화 정도 설정(10정도의 암호화)
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password , salt)
})

// User id를 갖고있는 토큰발행
// https://jwt.io/
UserSchema.methods.getSignedJwtToken = function(){
  return jwt.sign(
    { id : this._id}
    ,process.env.JWT_SECRET
    ,{expiresIn: process.env.JWT_EXPIRE}
  )
}

// match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function(enteredPassword){
  // 여기서 this.password의 this는 auth_ctrl.js에서 이 함수를 부르는 특정 user
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex') 

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
 
  // set expire
  this.resetPasswordExpire = Date.now() + 10 * 60  *1000
  
  return resetToken
}

module.exports = mongoose.model('User',UserSchema)