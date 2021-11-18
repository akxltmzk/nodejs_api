const express = require('express')
const Review = require('../models/Review_model')
const advancedResults = require('../middleware/advancedResults')
const router = express.Router({
  mergeParams: true
})
const {
  protect,
  authorize
} = require('../middleware/auth_middleware')
const {
  getReviews,
  getReview
} = require('../controllers/reviews_ctrl')

router
  .route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)

router
  .route('/:id')
  .get(getReview)

module.exports = router