const arr = [1,1,2,2,3,5,5,7,7]

let res = 0
for (let i = 0; i < arr.length; i++) {
  const cur = arr[i]
  res = res ^ cur
}

console.log('res>>>', res)