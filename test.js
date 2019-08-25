
const assert = require('assert');
const rpm = require('./rpm');
/*
class A {
    constructor(){
        this.attr1 = 1
    }
}

//import remote object from client 1
rpm.require_remote('http://localhost:8000')
.then(async remote => {
    await remote.setAttr1(5)
    console.log("Result:", await remote.getAttr1())
    console.log("Result:", await remote.attr3.hhh.rrr.__value__)
    const  rrr  = await remote.attr3.hhh.__obj__
    console.log("Result:", rrr)
    const  attr2  = await remote.attr2.__obj__
    console.log("Result:", attr2)
    
    const elm1  = await remote.attr2[0].__obj__
    console.log("Result:", elm1)
    remote.__subscribe__({
        attr1: (newValue) => {
            console.log(newValue)
        }
    })
    remote.setAttr1(20)
    //callback
    remote.callbackable((message, message2) => {
        console.log(message, message2)
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
    //const obj  = await remote.getObject.__call__()
    //console.log("Result:", await obj.__obj__)
    remote.close()
})*/

rpm.require_remote('http://localhost:8002')
.then(async remote => {
    let a =  await new remote.A()
    console.log(a)
})