const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User_model')

// @desc   Register user
// @route  POST /api/v1/auth/register
// @acess  public 
exports.register = asyncHandler(async(req,res,next)=>{
  const {name, email, password, role} = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role
  })
  // token 발행
  sendTokenResponse(user, 200, res)
})

// @desc   Login user
// @route  Post /api/v1/auth/login
// @acess  public 
exports.login = asyncHandler(async(req,res,next)=>{
  /*
    post맨에서 body에서 row로 하고 
    {
      "email":"john@gmail.com",
      "password":"123456"
    }
    로 테스트
  */
  const {email, password} = req.body;

  // validate email & password
  if(!email || !password)
    return next(new ErrorResponse('Please provide an email and password'),400)
  
  // check for user
  // User_model.js보면 password는 select = false로 금지시켜놨는데 로그인 시에는 필요하다 어떡하지.
  // +password로 하면된다.
  const user = await User.findOne({email: email}).select('+password')

  if(!user)
    return next(new ErrorResponse('Invalid credentials'),401)

  // check if password matches(User_model안에 있는 method)
  const isMatch = await user.matchPassword(password)
  if(!isMatch)
    return next(new ErrorResponse('Invalid credentials'),401)

  sendTokenResponse(user, 200, res)
})

// @desc   get current logged in user
// @route  Post /api/v1/auth/me
// @acess  private
exports.getMe = asyncHandler(async(req, res, next)=>{
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success:true,
    data: user
  })

})

// @desc   Log user out / clear cookie
// @route  GET /api/v1/auth/logout
// @acess  private
exports.logout = asyncHandler(async(req, res, next)=>{
  res.cookie('token','none',{
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly:true
  })

  res.status(200).json({
    success:true,
    data: {}
  })

})

// @desc   update user details
// @route  PUT /api/v1/auth/updatedetails
// @acess  private
exports.updateDetails = asyncHandler(async(req, res, next)=>{

  const fieldsToUpdate = {
    name : req.body.name,
    email : req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  })


  res.status(200).json({
    success:true,
    data: user
  })
})

// @desc   Update password
// @route  Post /api/v1/auth/updatepassword
// @acess  private
exports.updatePassword = asyncHandler(async(req, res, next)=>{
  const user = await User.findById(req.user.id).select('+password')

  // check currnet password
  if(!(await user.matchPassword(req.body.currentPassword))){
    return next(new ErrorResponse('Password is incorrect', 401))
  }

  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc   Forgot password
// @route  POST /api/v1/auth/forgotpassword
// @acess  public
exports.forgotPassword = asyncHandler(async(req, res, next)=>{
  const user = await User.findOne({email: req.body.email})

  if(!user){
    return next(new ErrorResponse('There is no user with that email',404))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({validateBeforeSave : false})

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

  const message = `You are receiving this email because you(or someone else) has
  requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try{
    await sendEmail({
      email : user.email,
      subject: 'Password reset token',
      message
    })
    res.status(200).json({success:true, data:"Email sent"})
  }
  catch(err){
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpired = undefined 

    await user.save({validateBeforeSave : false})
    return next(new ErrorResponse('Email could not be sent'),500)
  }

  // res.status(200).json({
  //   success:true,
  //   data: user
  // })

})

// @desc   Reset password
// @route  PUT /api/v1/auth/resetpassword/:resettoken
// @acess  public
exports.resetPassword = asyncHandler(async(req, res, next)=>{
  // Get hashed toke
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{ $gt : Date.now()  }
  })

  if(!user){
    return next(new ErrorResponse('Invalid token' , 400))
  }

  // set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendTokenResponse(user, 200, res)

})

// get token form model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) =>{

  // create token(User_model에 있는 moethods, 해석하면 UserId가 나오는 토큰)
  const token = user.getSignedJwtToken()

  const options = { 
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV ==='production')
    options.secure = true

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success:true,
      token
    })
}

