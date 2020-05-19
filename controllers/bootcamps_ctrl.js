const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp_model')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/async')

// @desc   Get all bootcamps
// @route  GET /api/vi/bootcamps
// @acess  public(you dont need any token or auth something link that) 
exports.getBootcamps = asyncHandler(async(req,res,next)=>{
  /*
  http://a.com/패스/?id=1(쿼리)

  @ query 빌더 @
  https://www.zerocho.com/category/MongoDB/post/59bd148b1474c800194b695a

  {{URL}}/api/v1/bootcamps?averageCost[lte]=10000 이렇게 들어왔다고 치면!
  이건 averageCost가 10000보다 작거나 같은것들만 db에서 찾는다.
   */

  let query

  // copy req.query
  const reqQuery = {...req.query}

  // fields to exclude
  const removeFields = ['select']

  // loop over removeFields and delte them from reqQuery
  removeFields.forEach(param => delete reqQuery[param])

  console.log(reqQuery)
  
  // create query string
  let queryStr = JSON.stringify(reqQuery)

  // create operators($gt, $gte, etc)
  console.log(queryStr) //->{"averageCost":{"lte":"10000"}} 
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match =>`$${match}`) 
  console.log(queryStr) //->{"averageCost":{"$lte":"10000"}}

  // finding resource
  query = Bootcamp.find(JSON.parse(queryStr))

  // excuting query
  const bootcamps = await query
  res.status(200).json({succes:true,count: bootcamps.length ,data:bootcamps})
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

  bootcamp.js에서 보면 .route('/radius/:zipcode/:distance') 되있어서 params에 이름을 명시할 수 있다.

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