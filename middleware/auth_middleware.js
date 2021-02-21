const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User_model')

// protect routes
exports.protect = asyncHandler(async(req, res, next)=>{
  let token
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
  {
    /*
    create bootcamp를 할때
    Headers에 Bearer +token을 쳐서 보내기 때문에
    Bearer과 token을 에서 ' '를 나누고 [1]을 가져오면 token만 싹 가져온다.
    */
    token = req.headers.authorization.split(' ')[1]
  }

  // else if(req.cookies.token){
  //   token = req.cookies.token
  // }

  // make sure token exists
  if(!token)
    return next(new ErrorResponse('Not authorize to access this route',401))
  
  try{
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded) // { id: '5efad161fdd5cd30a053e14a', iat: 1593495905, exp: 1596087905 }
    req.user = await User.findById(decoded.id)
    next()
  }
  catch(err){
    return next(new ErrorResponse('Not authorize to access this route',401))
  }
  
})
