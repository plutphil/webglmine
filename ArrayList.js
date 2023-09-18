class ArrayList{
    constructor(type,pagesize){
        if(pagesize==undefined){
            pagesize=1024;
        }
        this.pagesize=pagesize;
        this.type=type;
        this.clear()
        this.index = 0;
    }
    clear(){
        this.data = new this.type(this.pagesize)
    }
    add(val){
        this.data[this.index++]=val;
        if(this.data.length>=this.index){
            let newarr = new this.type(this.data.length+this.pagesize);
            newarr.set(this.data);
            this.data = newarr;
        }
    }
};
class ArrayList2{
    constructor(type){
        this.pagesize=4096;
        this.type = type;
        this.arrays = [];
        this.newarray();
        this.arrayindex=0;
        this.index=0;
    }
    newarray(){
        this.arrays.push(new this.type(this.pagesize));
    }
    add(val){
        this.arrays[this.arrayindex][this.index++]=val;
        if(this.index>=this.pagesize){
            this.newarray();
            this.arrayindex++;
        }
    }
};