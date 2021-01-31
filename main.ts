
let tm = eniac.createTM1637()

let arr= [1,2,4,8,16,32,64]
//tm.showNumArray([2,-1,7,2])



let loc = 0
while(true)
{

let num=[]

for(let i=0;i<4;i++)
{
  num[i]=arr[(loc+i)%6]
}
tm.showSegArray(num)
loc=loc+1
basic.pause(100)
}
