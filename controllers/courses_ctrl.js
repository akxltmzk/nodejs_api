const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course_model')
const BootCamp = require('../models/Bootcamp_model')
const asyncHandler = require('../middleware/async')

// @desc   Get courses
// @route  GET /api/v1/courses
// @route  GET /api/v1/bootcamps/:bootcampId/courses
// @acess  public
exports.getCourses = asyncHandler(async(req, res, next)=>{
  // /api/v1/bootcamps/:bootcampId/courses
  // 이렇게 특정 부트캠프의 코스를 전체 검색할때
  if(req.params.bootcampId){
    const courses = await Course.find({ bootcamp: req.params.bootcampId})

    return res.status(200).json({
      success : true,
      count : courses.length,
      data : courses
    })
  }
  // 그냥 코스 전체 검색할때
  else
  {
    res.status(200).json(res.advancedResults)   
  }
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

// @desc   Add Course
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @acess  Private
exports.addCourse = asyncHandler(async(req, res, next)=>{
  /*(포스트맨)
  {{URL}}/api/v1/bootcamps/5d713a66ec8f2b88b8f830b8/courses
  를 Post로 하고
  body에 데이터를 JSON으로 넣고 add 할수 있다
  */
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

// @desc   update Course
// @route  POST /api/v1/:id
// @acess  Private
exports.updateCourse = asyncHandler(async(req, res, next)=>{

  /*
  course중 업데이트하고 싶은 아이디를 GetCourses에서 가져온다음에
  ex) {{URL}}/api/v1/courses/5d725c84c4ded7bcb480eaa0 아이디로 url 설정후
  put 으로 설정, body에 업데이트하고 싶은 항목을 JSON으로 던지면 업데이트 된다.
  ex)
  {
    "tuition": 12000,
    "minimumSkill": "advanced"
  }
  
  */
  let course = await Course.findById(req.params.id)
  
  if(!course)
    return next(new ErrorResponse(`No courses with the id of ${req.params.id}`) , 404)
  

  course = await Course.findByIdAndUpdate(req.params.id, req.body,{
    new : true,
    runValidators: true
  })

  res.status(200).json({
    success : true,
    data: course
  })
})


// @desc   delete Course
// @route  DELETE /api/v1/:id
// @acess  Private
exports.deleteCourse = asyncHandler(async(req, res, next)=>{

  const course = await Course.findById(req.params.id)
  
  if(!course)
    return next(new ErrorResponse(`No courses with the id of ${req.params.id}`) , 404)
  
  await course.remove()

  res.status(200).json({
    success : true,
    data: {}
  })
})