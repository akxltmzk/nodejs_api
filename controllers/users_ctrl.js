const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User_model')


// @desc   Get all users
// @route  Get /api/v1/auth/users
// @acess  Private/Admin 
exports.getUsers = asyncHandler(async(req,res,next)=>{
  res.status(200).json(res.advancedResults)
})

// @desc   Get single user
// @route  Get /api/v1/auth/users/:id
// @acess  Private/Admin 
exports.getUser = asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.params.id)

  res.status(200).json({
    success: true,
    data : user
  })
})

// @desc   Create user
// @route  POST /api/v1/auth/users
// @acess  Private/Admin 
exports.createUser = asyncHandler(async(req,res,next)=>{
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data : user
  })
})

// @desc   Update user
// @route  PUT /api/v1/auth/users/:id
// @acess  Private/Admin 
exports.updateUser = asyncHandler(async(req,res,next)=>{
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new : true,
    runValidators : true
  })

  res.status(200).json({
    success: true,
    data : user
  })
})

// @desc   Delete user
// @route  DELETE /api/v1/auth/users/:id
// @acess  Private/Admin 
exports.deleteUser = asyncHandler(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.params.id)

  res.status(200).json({
    success: true,
    data:{}
  })
})