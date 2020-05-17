const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err,req,res,next) =>{
  let error = { ...err }
  error.message = err.message

  // log to console for dev
  console.log(err)

  // find에서 쓰이는 ObjectID의 포멧이 잘못됫을때 생긱는 에러
  if(err.name === 'CastError'){
    const message = `not found with id of ${err.value}! ObjectID 형식을 수정하시오 !`
    error = new ErrorResponse(message,404)
  }

  // create 할때 포스트맨의 body부분이 같은값일때 생기는 에러
  // db에 같은 값을 또 !create!할때 생기는 에러
  if(err.code === 11000)
  {
    const message = '같은 값을 적용하였습니다 확인하시오'
    error = new ErrorResponse(message, 400)
  }

  // mongoose validation err(스키마의 해당값(required)을 다 채우지 않고 !create! 할때 생기는 에러)
  if(err.name === 'ValidationError')
  {
    // required에 채워지지지 않은 에러의 message만 필요하니깐 errors오브젝트의 모든 벨류를 밉팽해서
    // 문제 있는 val의 message만 추출한다.
    const message = Object.values(err.errors).map(val =>  val.message)

    error = new ErrorResponse(message,400)
  }

  // ID가 DB에 없을때 발생되는 에러
  if(err.name ==='ReferenceError'){
    let objectID = req.url.toString()
    objectID = objectID.split('/api/v1/bootcamps/')
    const message = `해당 ObjectId의 포멧은 맞으나, ${objectID}는 DB에서 찾을 수 없습니다`
    error = new ErrorResponse(message,404) 
  }


  res.status(error.statusCode || 500).json({
    success : false,
    error : error.message || 'Server Error'
  })
}

module.exports = errorHandler