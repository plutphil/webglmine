function k(){

    let f=[1.333,0.3343234,0.312312];
    let steps=500000;
    //takes way to long
    /*
    var t0 = performance.now()
    let arr=[];
    for (let i = 0; i < steps; i++) {
        arr=arr.concat(f);
    }
    var t1 = performance.now()
    console.log("concat 3 float took " + (t1 - t0) + " milliseconds.")
    */
    var t0 = performance.now()
    arr=[];
    for (let i = 0; i < steps; i++) {
        f.forEach(element => {
            arr.push(element);
        });
        
    }
    var t1 = performance.now()
    console.log("push foreach 3 float took " + (t1 - t0) + " milliseconds.")
    
    
    var t0 = performance.now()
    arr=[];
    for (let i = 0; i < steps; i++) {
        
        arr.push(f[0]);
        arr.push(f[1]);
        arr.push(f[2]);
        
    }
    var t1 = performance.now()
    console.log("push hardcode 3 float took " + (t1 - t0) + " milliseconds.")
    
    var t0 = performance.now()
    
    for (let i = 0; i < steps; i++) {
        
        arr[i*3]=f[0];
        arr[i*3+1]=f[1];
        arr[i*3+2]=f[2];
        
    }
    var t1 = performance.now()
    console.log("hardcode update 3 float took " + (t1 - t0) + " milliseconds.")
    
    
    let index=0;
    let l=arr.length;
    function smartpush(v){
        if(index<l){
            arr[index]=v;
            index++;
        }else{
            arr.push(v);
        }
    }
    var t0 = performance.now()
    
    index=0;
    for (let i = 0; i < steps; i++) {
        
        smartpush(f[0]);
        smartpush(f[1]);
        smartpush(f[2]);
        
    }
    var t1 = performance.now()
    console.log("smartpush update 3 float took " + (t1 - t0) + " milliseconds.")
    };k();