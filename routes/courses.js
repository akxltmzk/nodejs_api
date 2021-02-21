const express = require('express')
const Course = require('../models/Course_model')
const advancedResults = require('../middleware/advancedResults')
/*
  {{URL}}/api/v1/bootcamps/5d713a66ec8f2b88b8f830b8/courses 로 request가 들어오면
  bootcamps.js에 라우팅 됬다가, 거기서 여기로 re-route시켜야하니깐 mergeParams:true를 한다.
*/
const router = express.Router({mergeParams: true})
const { protect } = require('../middleware/auth_middleware')
const { 
  getCourses,
  getCourse ,
  addCourse,
  updateCourse,
  deleteCourse
  } = require('../controllers/courses_ctrl')

router
    .route('/')
    .get(advancedResults(Course, {
      // populate할때 이렇게 객체를 던질 수 있다.
      path : 'bootcamp',
      select: 'name description'
    }),getCourses)
    .post(protect,addCourse)


router
  .route('/:id')
  .get(getCourse)
  .put(protect,updateCourse)
  .delete(protect,deleteCourse)

module.exports = router