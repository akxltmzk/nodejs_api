/*
  튜토리얼에 준비되어있는 테스트 db 데이터를 수동으로 일일히 임포트하고 삭제하기 귀찮으니깐
  명령어로 자동 임포트 혹은 딜리트 하는 스크립트임!
*/

const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// load env vars
dotenv.config({
  path: './config/config.env'
})

// load models
const Bootcamp = require('./models/Bootcamp_model')
const Course = require('./models/Course_model')
const User = require('./models/User_model')
const Review = require('./models/Review_model')

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

// read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

// import into DB
const importData = async () => {
  try {

    await Bootcamp.create(bootcamps)
    await Course.create(courses)
    await User.create(users)
    await Review.create(reviews)

    //console에 칼라주기
    console.log('Data imported..'.green.inverse)
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

// delete data
const deleteData = async () => {
  try {

    await Bootcamp.deleteMany()
    await Course.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()

    console.log('Data Destroyed..'.red.inverse)
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

// node seeder -i 로 프로그램을 실행 할 경우
if (process.argv[2] === '-i') {
  importData()
}
// node seeder -d 로 프로그램을 실행 할 경우 
else if (process.argv[2] === '-d') {
  deleteData()
}