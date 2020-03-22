//npm run dev

const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middleware/error')
const bootcamps = require('./routes/bootcamps')
const connectDB = require('./config/db')

// load env var
dotenv.config({path: './config/config.env'})

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

// mount router
app.use('/api/v1/bootcamps',bootcamps)

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
