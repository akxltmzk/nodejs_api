
/*@ desc  모든 routes가 작동하기 전에 !중간에! 미리 작동한다. 모든 router에서 req.hello값에 접근 가능.
          next()를 해야 미들웨어 후에 작업이 진행됨.
          즉, next()에후에 get,post 등등이 작동함.
*/
const logger = (req,res,next)=>{
  // req.hello = 'Hello world'

  // 들어오는 라우터 정보를 얻어올수 있다.
  // 출력 예: ) GET undefined://localhost:5000/api/v1/bootcamps
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  )
  next()
}

module.exports = logger

// 그냥 커스텀 미들웨어 만드는 방법, 이거 안쓰로 morgan쓸거임.