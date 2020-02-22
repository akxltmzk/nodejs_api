const express = require('express')
const dotenv = require('dotenv')
const bootcamps = require('./routes/bootcamps')

// const logger = require('./middleware/logger')
const morgan = require('morgan')

dotenv.config({path: './config/config.env'})

const app = express()
const PORT = process.env.PORT || 5000

// app.use(logger)
if(process.env.NODE_ENV === 'development'){
  //@ desc 자동으로 requests정보를 콘솔에 찍어줌.
  app.use(morgan('dev'))
}

// mount router
app.use('/api/v1/bootcamps',bootcamps)

app.listen(PORT, console.log(`server running on ${process.env.NODE_ENV} mode on port ${PORT} `))

