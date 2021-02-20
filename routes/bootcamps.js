const express = require('express')
const router = express.Router()

const { 
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
  } = require('../controllers/bootcamps_ctrl')

const Bootcamp = require('../models/Bootcamp_model')
const advancedResults = require('../middleware/advancedResults')

// include other resources routers
const courseRouter = require('./courses')

const { protect } = require('../middleware/auth_middleware')

// re-route into other resource routers
// {{URL}}/api/v1/bootcamps/5d713a66ec8f2b88b8f830b8/courses 이런 request가 들어오면  v1/bootcamp 여기에서 라우터를 받아야 하는데,
// 그래도 course관련된 request이기 때문에 courses.js 라우터에서 받고 싶다. 그래서 courses.js로 re-router 시키는것!!
router.use('/:bootcampId/courses', courseRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(protect , bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses') , getBootcamps)
  .post(protect, createBootcamp)
 
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp)

module.exports = router