const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp_model')

// @desc   Get all bootcamps
// @route  GET /api/vi/bootcamps
// @acess  public(you dont need any token or auth something link that) 
exports.getBootcamps = async (req,res,next)=>{
  try{
    const bootcamps = await Bootcamp.find()
    res.status(200).json({succes:true,count: bootcamps.length ,data:bootcamps})
  }
  catch(err){
    next(err)
  }
}

// @desc   Get single bootcamps
// @route  GET /api/vi/bootcamps/:id
// @acess  public
exports.getBootcamp = async(req,res,next)=>{
  try{
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp)
      next(err)

    res.status(200).json({succes : true, data : bootcamp})
  }
  catch(err)
  {
    next(err)
  }
}

// @desc   Create new bootcamp
// @route  POST /api/vi/bootcamps
// @acess  private
exports.createBootcamp = async(req,res,next)=>{
  try{
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
      succes:true,
      data : bootcamp
    })
  }
  catch(err){
    next(err)
  }
}

// @desc   Update bootcamp
// @route  PUT /api/vi/bootcampss/:id
// @acess  private
exports.updateBootcamp = async (req,res,next)=>{
  try{
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
      //원본이 아닌 수정 된 문서를 반환합니다. 기본값은 false
      new: true,
      //true 인 경우이 명령에서 업데이트 유효성 검사기를 실행합니다. 업데이트 유효성 검사기는 모델 스키마에 대해 업데이트 작업의 유효성을 검사
      runValidators: true
    })

    if(!bootcamp)
      next(err)
   
    res.status(200).json({succes:true,data:bootcamp})

  } catch(err){
    next(err)
  }
}

// @desc   Delete bootcamp
// @route  DELETE /api/vi/bootcampss/:id
// @acess  private
exports.deleteBootcamp = async (req,res,next)=>{
  try{
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if(!bootcamp)
      next(err)
   
    res.status(200).json({succes:true, data: {}})
    
  } catch(err){
    next(err)
  }
}