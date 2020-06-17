const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course_model')
const BootCamp = require('../models/Bootcamp_model')
const asyncHandler = require('../middleware/async')

// @desc   Get courses
// @route  GET /api/v1/courses
// @route  GET /api/v1/bootcamps/:bootcampId/courses
// @acess  public
exports.getCourses = asyncHandler(async(req, res, next)=>{

  let query
  
  if(req.params.bootcampId){
    query = Course.find({ bootcamp: req.params.bootcampId})
  }else{
    query = Course.find().populate({
      // bootcamp model에서 description만 select
      path: 'bootcamp',
      select: 'description'
    })
  }

  const courses = await query

  res.status(200).json({
    success : true,
    count : courses.length,
    data: courses
  })
})


// @desc   Get single course
// @route  GET /api/v1/courses/:id
// @acess  public
exports.getCourse = asyncHandler(async(req, res, next)=>{
  const course = await Course.findById(req.params.id).populate({
    path : 'bootcamp',
    select: 'name description'
  })
  
  if(!course)
    return next(new ErrorResponse(`No courses with the id of ${req.params.id}`) , 400)
  

  res.status(200).json({
    success : true,
    data: course
  })
})

// @desc   Add
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @acess  Private
exports.addCourse = asyncHandler(async(req, res, next)=>{
  req.body.bootcamp = req.params.bootcampId

  const bootCamp = await BootCamp.findById(req.params.bootcampId)
  
  if(!bootCamp)
    return next(new ErrorResponse(`No courses with the id of ${req.params.bootcampId}`) , 400)
  
  const course = await Course.create(req.body)
  

  res.status(200).json({
    success : true,
    data: course
  })
})