const Bootcamp = require('../models/Bootcamp')

// @desc   Get all bootcamps
// @route  GET /api/vi/bootcamps
// @acess  public(you dont need any token or auth something link that) 
exports.getBootcamps = (req,res,next)=>{
  res.status(200).json({succes : true, msg : 'show all bootcamps'})
}

// @desc   Get single bootcamps
// @route  GET /api/vi/bootcamps/:id
// @acess  public
exports.getBootcamp = (req,res,next)=>{
  res.status(200).json({succes : true, msg : `show bootcamp ${req.params.id}`})
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
    res.status(400).json({succes:false})
  }
}

// @desc   Update bootcamp
// @route  PUT /api/vi/bootcampss/:id
// @acess  private
exports.updateBootcamp = (req,res,next)=>{
  res.status(200).json({succes : true, msg : `Update bootcamp ${req.params.id}`})
}

// @desc   Delete bootcamp
// @route  DELETE /api/vi/bootcampss/:id
// @acess  private
exports.deleteBootcamp = (req,res,next)=>{
  res.status(200).json({succes : true, msg : `Delete bootcamp ${req.params.id}`})
}