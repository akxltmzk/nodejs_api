const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course_model')
const asyncHandler = require('../middleware/async')

// @desc   Get courses
// @route  GET /api/vi/courses
// @route  GET /api/vi/bootcamps/:bootcampId/courses
// @acess  public
exports.getCourses = asyncHandler(async(req, res, next)=>{

  let query
  
  if(req.params.bootcampId){
    query = Course.find({ bootcamp: req.params.bootcampId})
  }else{
    query = Course.find()
  }

  const courses = await query

  res.status(200).json({
    success : true,
    count : courses.length,
    data: courses
  })

})
