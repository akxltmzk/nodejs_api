const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp_model')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/async')

// @desc   Get all bootcamps
// @route  GET /api/vi/bootcamps
// @acess  public(you dont need any token or auth something link that) 
exports.getBootcamps = asyncHandler(async(req,res,next)=>{
  res.status(200).json(res.advancedResults)
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
  const bootcamp = await Bootcamp.findById(req.params.id)

  if(!bootcamp)
    next(err)

  bootcamp.remove()
  
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
    // geocode query operator
    location : { $geoWithin: {$centerSphere:[[lng, lat],radius]}}
  })

  res.status(200).json({
    succes:true,
    count: bootcamps.length,
    data: bootcamps
  })
})

// @desc   Upload photo for bootcamp
// @route  Put /api/vi/bootcampss/:id/photo
// @acess  private
exports.bootcampPhotoUpload = asyncHandler(async (req,res,next)=>{
  const bootcamp = await Bootcamp.findById(req.params.id)

  if(!bootcamp)
    next(err)

  if(!req.files)
    next(err)

  const file = req.files.file

  // make sure the image is a photo
  if(!file.mimetype.startsWith('image'))
    return next(new ErrorResponse(`Please upload an image file`) , 400)
  
  // check filesize
  if(file.size > process.env.MAX_FILE_UPLOAD){
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`) , 400)
  }

  // create custom filename(ext는 jpg, png 등의 확장자들)
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
  
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err => {
    if(err){
      console.error(err)
      return next(new ErrorResponse(`problem with file upload`) , 500)
    }
  })

  await Bootcamp.findByIdAndUpdate(req.params.id , {photo : file.name})

  res.status(200).json({
    succes: true,
    data:file.name
  })


})