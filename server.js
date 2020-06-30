//npm run dev

const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path: './config/config.env'})
const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')
const errorHandler = require('./middleware/error')

const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const connectDB = require('./config/db')


// connect db
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

/*
const logger = require('./middleware/logger')
app.use(logger)
if(process.env.NODE_ENV === 'development'){
  //@ desc 자동으로 requests정보를 콘솔에 찍어줌.
  app.use(morgan('dev'))
}
*/

// body parser
app.use(express.json())

// cookie parser
app.use(cookieParser())

// file uploading
app.use(fileupload())

// set static folder
app.use(express.static(path.join(__dirname , 'public')))


// mount router
app.use('/api/v1/bootcamps' , bootcamps)
app.use('/api/v1/courses' , courses)
app.use('/api/v1/auth' , auth)

// errorhandler middleware
app.use(errorHandler)

// npm run dev
const server = app.listen(PORT, console.log(`server running on ${process.env.NODE_ENV} 
                          mode on port ${PORT} `.yellow.bold))

// handle unhandled promise rejection
process.on('unhandledRejection',(err,promise)=>{
  console.log(`Error : ${err.message}`.red)
  // close server & exit process
  server.close(()=>process.exit(1))
})
