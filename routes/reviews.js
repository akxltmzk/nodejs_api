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
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews_ctrl')

router
  .route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)
  .post(protect, authorize('user', 'admin'), addReview)

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router