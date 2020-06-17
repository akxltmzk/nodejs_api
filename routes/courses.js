const express = require('express')
// {{URL}}/api/v1/bootcamps/5d713a66ec8f2b88b8f830b8/courses 로 request가 들어오면
// bootcamps.js에 라우팅 됬다가, 거기서 여기로 re-route시켜야하니깐 mergeParams:true를 한다.
const router = express.Router({mergeParams: true})

const { 
  getCourses,
  getCourse ,
  addCourse
  } = require('../controllers/courses_ctrl')

router
    .route('/')
    .get(getCourses)
    .post(addCourse)

router.route('/:id')
  .get(getCourse)

module.exports = router