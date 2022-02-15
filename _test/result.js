function promise (){
	return new Promise((resolve,reject)=>{
      resolve('test')
    })
}
promise.then(res=>{
  console.log('test1');
})

promise.then(res=>{
  console.log('test2');
}).catch(err=>{
  console.log('err');
})


promise.then(res=>{
  console.log('test3');
  promise.then(res=>{
    console.log('test3');
  })
}).catch(err=>{
  console.log('err');
})

promise.then(function(res){
  console.log('test4');
  promise.then(res=>{
    console.log('test4');
  })
}).then(res=>{
  console.log('test4');
})