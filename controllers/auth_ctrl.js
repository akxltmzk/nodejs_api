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

  /* 
    create token(User_model.js에서 methods를 만들었기 때문에 이렇게 사용 가능
    (개개인의 user기 때문에 static으로는 사용안함!)
  
    body에 row로 설정하고 
    {
      "name":"John Doe",
      "email":"john@gmail.com",
      "password":"123456",
      "role":"publisher"
    }
    과 같은 json과 함께 user를 create하면

    sccess와 함께 token이 발행된다.
    그 token을 jwt.io에 입력해서 보면 userid를 출력해준다.
  */
  const token = user.getSignedJwtToken()

  res.status(200).json({
    success: true,
    token : token
  })
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
  const user = await User.findOne({email: email}).select('+password')

  if(!user)
    return next(new ErrorResponse('Invalid credentials'),401)

  // check if password matches
  const isMatch = await user.matchPassword(password)
  if(!isMatch)
    return next(new ErrorResponse('Invalid credentials'),401)

  const token = user.getSignedJwtToken()

  res.status(200).json({
    success: true,
    token : token
  })
})