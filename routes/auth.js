const express = require('express')
const {
  register,
  login,
  getMe
} = require('../controllers/auth_ctrl')

const { protect } = require('../middleware/auth_middleware')
const router = express.Router()

router.post('/register',register)
router.post('/login',login)
router.get('/me', protect, getMe)

module.exports = router