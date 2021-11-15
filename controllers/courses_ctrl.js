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
    select: 'name website'
  })
  
  if(!course)
    return next(new ErrorResponse(`No courses with the id of ${req.params.id}`) , 404)
  

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
  body에 데이터를 JSON으로 넣고 add 할수 있다.

  req.params.bootcampId = 5d713a66ec8f2b88b8f830b8 인게
  bootcamp.js에서 라우팅을 router.use('/:bootcampId/courses', courseRouter) 이렇게 하고 있는데
  params :bootcampId 이부분을 가르키는것
  */
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  let bootcamp = await BootCamp.findById(req.params.bootcampId)

  if(!bootcamp){
    return next(new ErrorResponse(`No courses with the id of ${req.params.bootcampId}`) , 400)
  }

  // make sure user is bootcamp owener
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp.id}`,401))
  }

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
  
  if(!course){
    return next(new ErrorResponse(`No courses with the id of ${req.params.id}`) , 404)
  }

  // make sure user is bootcamp owener
  if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update ${course._id}`,401))
  }

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
  
  // make sure user is bootcamp owener
  if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete ${course._id}`,401))
  }


  // delete 할때 findByIdAndDelete를 안하는 이유는, 미들웨어로 처리할것이기 때문이다.
  // course를 하나 지우면 bootcamp의 averagecost가 달라지기 때문에 이것을 Course_model.js
  // 에서 미들웨어로 처리한다
  await course.remove()

  res.status(200).json({
    success : true,
    data: {}
  })
})