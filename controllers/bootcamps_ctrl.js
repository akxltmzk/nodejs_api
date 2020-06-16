const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp_model')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/async')

// @desc   Get all bootcamps
// @route  GET /api/vi/bootcamps
// @acess  public(you dont need any token or auth something link that) 
exports.getBootcamps = asyncHandler(async(req,res,next)=>{

  /*
  @ query 빌더 @
  https://www.zerocho.com/category/MongoDB/post/59bd148b1474c800194b695a
  */

  let query
  
  // copy req.query
  const reqQuery = {...req.query}

  // fields to exclude(데이터에 select와 sort...등과 같이 없는 값은 query에서 일단 뺀다.)
  const removeFields = ['select','sort','page','limit']

  // loop over removeFields and delte them from reqQuery
  removeFields.forEach( param =>delete reqQuery[param])


  //create query string
  let queryStr = JSON.stringify(reqQuery)


  /*
  create operator($gt, $gte, etc...)

  {{URL}}/api/v1/bootcamps?averageCost[lte]=10000 이렇게 들어왔다고 치면!
  이건 averageCost가 10000보다 작거나 같은것들만 db에서 찾는다.
  */
  console.log(queryStr)//->{"averageCost":{"lte":"10000"}}
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match =>`$${match}`) 
  console.log(queryStr) //->{"averageCost":{"$lte":"10000"}}

  
  // finding resources
  query = Bootcamp.find(JSON.parse(queryStr))

  // select fields
  if(req.query.select){
    // select를 쓰려면 [name, description]이아니라 name description 형식으로 바꿔야함
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)    
  }

  // sort
  if(req.query.sort){
    const sortBy = req.query.sort.split(',').join('')
    query = query.sort(sortBy)
  }else{
    //쿼리에 sort가 따로 없으면 createAt을 기준으로 정렬한다
    query = query.sort('-createdAt')
  }

  // pagination
  // parseInt -> 만약 page를 적지 않았을 경우 기본값은 1으로 설정
  // pareInt의 두번째 파라미터는 radix -> 진법 , 여기서는 10진법
  const page = parseInt(req.query.page , 10) || 1
  const limit = parseInt(req.query.limit , 10) || 25
  const startIndex = (page - 1)*limit
  const endIndex = page*limit
  const total = await Bootcamp.countDocuments()

  // limit->  메소드를 통하여 보이는 출력물의 갯수를 제한
  // skip-> 출력 할 데이터의 시작부분을 설정할 때 사용
  query = query.skip(startIndex).limit(limit)

  // executing query
  const bootcamps = await query

  // pagination result
  const pagination = {}
  if(endIndex < total){
    pagination.next = {
      page : page + 1 ,
      limit
    }
  }

  if(startIndex > 0){
    pagination.prev = {
      page: page-1,
      limit
    }
  }

    
  res.status(200).json(
    { succes:true , 
      count: bootcamps.length , 
      pagination ,
      data:bootcamps})
})

// @desc   Get single bootcamps
// @route  GET /api/vi/bootcamps/:id
// @acess  public
exports.getBootcamp = asyncHandler(async(req,res,next)=>{
  const bootcamp = await Bootcamp.findById(req.params.id)

  if(!bootcamp)
    next(err)

  res.status(200).json({succes : true, data : bootcamp})
})

// create는 포스트맨의 body부분에 필요한 값을 적고 만든다.
// @desc   Create new bootcamp
// @route  POST /api/vi/bootcamps
// @acess  private
exports.createBootcamp = asyncHandler(async(req,res,next)=>{
  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({
    succes:true,
    data : bootcamp
  })
})

// @desc   Update bootcamp₩
// @route  PUT /api/vi/bootcampss/:id
// @acess  private
exports.updateBootcamp = asyncHandler(async (req,res,next)=>{
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
      //원본이 아닌 수정 된 문서를 반환합니다. 기본값은 false
      new: true,
      //true 인 경우이 명령에서 업데이트 유효성 검사기를 실행합니다. 업데이트 유효성 검사기는 모델 스키마에 대해 업데이트 작업의 유효성을 검사
      runValidators: true
    })

    if(!bootcamp)
      next(err)
   
    res.status(200).json({succes:true,data:bootcamp})
})

// @desc   Delete bootcamp
// @route  DELETE /api/vi/bootcampss/:id
// @acess  private
exports.deleteBootcamp = asyncHandler(async (req,res,next)=>{
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

  if(!bootcamp)
    next(err)
  
  res.status(200).json({succes:true, data: {}})
})

// @desc   Get bootcamps whitin a radius
// @route  GET /api/vi/bootcampss/radius/:zipcode/:distance
// @acess  private
exports.getBootcampsInRadius = asyncHandler(async (req,res,next)=>{
  /*
  기준이 되는 zipcode를 params로 받아서(유저가 원하는 기준) 원하는 거리(distancec)내의 데이터를
  DB안에서 찾는 펑션

  ex){{URL}}/api/v1/bootcamps/radius/02118/100
  -> 02118인 zipcode에서 location이 100마일 이내인 db데이터를 찾아라!!
 */
  const { zipcode, distance} = req.params

  // get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // calc radius using radians
  // divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location : { $geoWithin: {$centerSphere:[[lng, lat],radius]}}
  })

  res.status(200).json({
    succes:true,
    count: bootcamps.length,
    data: bootcamps
  })
})