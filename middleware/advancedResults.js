const advancedResults = (model , populate) => async (req, res, next) => {
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
  removeFields.forEach( param => delete reqQuery[param])

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

  
  // finding resources(courses의 리소스를 reverse-populate시킴)
  query = model.find(JSON.parse(queryStr))

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

  // mongoose 기본 펑션, 모든 다큐먼트의 수를 셀 수 있음
  const total = await model.countDocuments()

  // limit->  메소드를 통하여 보이는 출력물의 갯수를 제한
  // skip-> 출력 할 데이터의 시작부분을 설정할 때 사용
  query = query.skip(startIndex).limit(limit)

  if(populate){
    query = query.populate(populate)
  }

  // executing query
  const results = await query

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

  res.advancedResults = {
    success : true,
    count : results.length,
    pagination,
    data : results
  }

  next()
}

module.exports = advancedResults