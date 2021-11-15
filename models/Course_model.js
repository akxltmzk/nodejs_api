const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title:{
    type : String,
    trim : true,
    required : [true, 'please add a course title'] 
  },
  description : {
    type : String,
    required: [true, 'Please add a description']
  },
  weeks : {
    type : String,
    required: [true, 'Please add number of weeks']
  },  
  tuition : {
    type : Number,
    required: [true, 'Please add a tuition Cost']
  },  
  minimumSkill : {
    type : String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner','intermediate','advanced']
  },  
  scholarshipAvailable: {
    type : Boolean,
    default : false
  },
  createAt : {
    type: Date,
    default : Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})
/*
static method to get avg of course tuitions
static으로 모델 자체에 함수를 만들어 줄 수 있다.
즉, 전체 Course모델데이터에 관해서 쓸때 (averageCost처럼)
하나의 course데이터에다가 하려고 했으면,
const course = await. Course.findone ..뭐이런식으로 하나찾고
course.methods.함수명 / 이렇게 mothods를 써야함.
참, 스키마에서 this는 만들어진 'Course 데이터 자기 자신'을 가르킨다.
때문에, this.bootcamp, this.createAt 뭐 이런식으로 쓸 수 있다
*/
CourseSchema.statics.getAverageCost = async function(bootcampId){

  console.log('Calculating avg cost..'.blue)

  // obj -> [{_id : 5d725c84c4ded7bcb480eaa0 , averageCost: 12250}]
  // 뭐이런식으로 객체배열을 반환해준다.
  const obj = await this.aggregate([
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group:{
        _id:'$bootcamp',
        averageCost:{$avg:'$tuition'}
      }
    }
  ])

  try{
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      // 소수점 없이 딱떨어지게
      averageCost: Math.ceil(obj[0].averageCost/10) * 10
    })
  } catch(err){
    console.error(err)
  }
}


// call getAverageCost after save
CourseSchema.post('save',function(){
  this.constructor.getAverageCost(this.bootcamp)
})

// call getAverageCost before remove
CourseSchema.post('remove',function(){
  this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course',CourseSchema)