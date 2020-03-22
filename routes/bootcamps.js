const express = require('express')
const { 
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp
  } = require('../controllers/bootcamps_ctrl')

  
const router = express.Router()

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp)
 
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp)


  module.exports = router