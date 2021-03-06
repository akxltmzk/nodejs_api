const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User_model')

// @desc   Register user
// @route  POST /api/vi/auth/register
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
// @route  Post /api/vi/auth/login
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

// get token form model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) =>{
  // create token(User_model에 있는 moethods, 해석하면 UserId가 나오는 토큰)
  const token = user.getSignedJwtToken()

  const options = { 
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 100),
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

// @desc   get current logged in user
// @route  Post /api/vi/auth/me
// @acess  private
exports.getMe = asyncHandler(async(req, res, next)=>{
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success:true,
    data: user
  })

})