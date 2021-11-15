const advancedResults = (model , populate) => async (req, res, next) => {
  /*
    <사전지식>

    - mongoose operator with query builder
    example site ) https://www.zerocho.com/category/MongoDB/post/59bd148b1474c800194b695a

    - gt,gte,lt,lte 
    {{URL}}/api/v1/bootcamps?averageCost[lte]=10000 
    이렇게 들어왔다고 치면! 이건 averageCost가 10000보다 작거나 같은것들만 db에서 찾는다.

    - sort, where, and .. 등 다양하게 있음
  */

  let query

  // query란 ? 뒤에 붙는것들, ex reqQuery는 { select: 'website', limit: '2' } 이런식의 객체가 된다
  const reqQuery = {...req.query}

  /* --------------- remove query builder from reqQuery --------------------- */

  const removeFields = ['select','sort','page','limit']
  removeFields.forEach( param => delete reqQuery[param])

  /* --------------- 1. set 'query' data with compare query ----------------- */

  // create query string
  let queryStr = JSON.stringify(reqQuery)
  /*
  만약에 , ?select=email&name="Devcentral Bootcamp" 이렇게 query가 들어오면,
  select는 바로 위에서 delete 되니깐 , {"name":"Devcentral Bootcamp"}만 들어온다
  그리고 밑에서 replace를 하는건 어떤 값 이상, 이하, 미만, 뭐 이런거 찾을때만 정규식이 작동되고
  위와 같이 name을 찾는 것과 같은 경우는 밑에 두개의 콘솔이 같음.
  */
  // console.log(queryStr)  {"averageCost":{"lte":"10000"}}
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match =>`$${match}`) 
  // console.log(queryStr)  {"averageCost":{"$lte":"10000"}}
  // finding resources

  query = model.find(JSON.parse(queryStr))

  /* ------------------ 2. set 'query' data  with select -------------------- */
 
  if(req.query.select){
    // {{URL}}/api/v1/bootcamps?select=name,description
    // select를 쓰려면 name, description 이아니라 name description 형식으로 바꿔야함
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)    
  }

  //* ------------------ 3. set 'query' data  with sort -------------------- */
  
  if(req.query.sort){
    const sortBy = req.query.sort.split(',').join('')
    query = query.sort(sortBy)
  }else{
    //쿼리에 sort가 따로 없으면 createAt을 기준으로 정렬한다
    query = query.sort('-createdAt')
  }

  //* -------- 4. set 'query' data  with limit,skip for pagimation ---------- */

  // {{URL}}/api/v1/bootcamps?page=3
  // 여기에는 page를 적었음으로 truty값임으로 왼쪽 피연산자를 리턴
  // 만약 page를 안적으면 NaN인 falsy값임으로 오른쪽 피연산자 리턴

  const page = parseInt(req.query.page , 10) || 1
  const limit = parseInt(req.query.limit , 10) || 25
  const startIndex = (page - 1)*limit
  const endIndex = page * limit

  // mongoose 기본 펑션, 모든 다큐먼트의 수를 셀 수 있음
  const total = await model.countDocuments()

  // limit->  메소드를 통하여 보이는 출력물의 갯수를 제한
  // skip-> 출력 할 데이터의 시작부분을 설정할 때 사용
  // mongodb의 다큐먼트를 다루는 펑션들
  query = query.skip(startIndex).limit(limit)
  
  //* -------- 6. populate 할 것 있을때는 해준다 ---------- */
  
  if(populate){
    query = query.populate(populate)
  }
  
  //*----- 7. finally, excuting query and save with 'results' variable ------- */
  const results = await query

  /*---------------- 8. for the frontend, make next, prev data ---------------- */
  
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

  /*------------------------ 9. save this all results------------------------ */
  
  res.advancedResults = {
    success : true,
    count : results.length,
    pagination,
    data : results
  }

  next()
}

module.exports = advancedResults