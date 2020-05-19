const mongoose = require('mongoose')

/*
슬러그(Slug)란 원래 신문이나 잡지 등에서 제목을 쓸 때, 
중요한 의미를 포함하는 단어만을 이용해 제목을 작성하는 방법을 말합니다. 
조사나 전치사 등을 빼고
핵심 의미를 담고 있는 단어를 조합해서 긴 제목을 간단 명료하게 표현하는 것
*/
const slugify = require('slugify')

const geocoder = require('../utils/geocoder')

const BootCampSchema = new mongoose.Schema({
  name : {
    type: String,
    required:[true,'Please add name'],
    unique: true,
    trim: true,
    maxlength:[50,'Name can not be more than 50 characters']
  },

  slug: String,

  description:{
    type: String,
    required: [true, 'Please add description'],
    maxlength:[500,'Description can not be more than 500 characters']
  },

  website:{
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
      ,'Please use valid URL with HTTP or HTTPs'
    ]
  },

  phone:{
    type: String,
    maxlength:[20,'Phone number can not be more than 20 characters']
  },

  email:{
    type: String,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ,'Please add valid email'
    ]
  },

  address:{
    type: String,
    required: [true, 'Please add an address' ]
  },

  location:{
    // geojson Point
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      // required: true
    },
    coordinates: {
      type: [Number],
      // required: true,
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    country: String
  },

  careers:{
    type:[String],
    required:true,
    enum:[
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },

  averageRating:{
    type: Number,
    min: [1,'Rating must be at least 1'],
    max: [10, 'Rating must can not be more than 10']
  },

  averageCost: Number,

  photo:{
    type: String,
    default:'no-photo.jpg'
  },

  housing:{
    type: Boolean,
    default: false
  },

  jobAssistance:{
    type: Boolean,
    default: false
  },

  jobGuarantee:{
    type: Boolean,
    default: false
  },

  acceptGi:{
    type: Boolean,
    default: false
  },

  createAt:{
    type: Date,
    default: Date.now
  }
})

/*
  pre - 데이터 생성전에,
  post - 데이터 생성 후에,
  slugify - 자동으로 불리는 미들웨어
 */
// Create bootcamp slug from the name
BootCampSchema.pre('save',function(){
  // create되는 db의 name을 !소문자로해서! slug를 채운뒤 db를 create한다.
  this.slug = slugify(this.name, {lower:true})
  next()
})

// geocode & create location field
// geomapp 미들웨어. 자동으로 create 할때 location 부분을 채워준다.
BootCampSchema.pre('save',async function(next){
  const loc = await geocoder.geocode(this.address)
  // 스키마의 빈부분인 location 채우기!
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  // dont save address in db
  // location에 상세한 주소가 기입되니깐, db에 address는 저장하지 않도록한다.
  this.address = undefined

  next()
})

module.exports = mongoose.model('Bootcamp',BootCampSchema)