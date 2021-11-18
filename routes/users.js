const express = require('express')
const User = require('../models/User_model')

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users_ctrl')

const advancedResults = require('../middleware/advancedResults')
const { protect,authorize } = require('../middleware/auth_middleware')
const router = express.Router()

// 모든 라우터에 protect middle ware 가 작동하게
router.use(protect)
router.use(authorize('admin'))

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router