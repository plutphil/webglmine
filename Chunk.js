class Chunk extends Model{
    constructor(x,y,z){
      super();
      this.neighbours=  [];
      let data=new Array(CHSIZE);
      for (let x = 0; x < CHSIZE; x++) {
        data[x]=new Array(CHSIZE);
        for (let y = 0; y < CHSIZE; y++) {
          data[x][y]=new Array(CHSIZE);
          for (let z = 0; z < CHSIZE; z++) {
            //data[x][y].push(0);
            data[x][y][z]=0;
          }
            
        }
      } 
      this.cube=new Cube();
      this.cube.enabled=true;
      this.data=data;
      this.enabled=false;
      this.meshgen=false;
      this.generated=false;
      this.stored=false;
      this.updated=false;
      this.empty=false;
      if(x!=null){
        this.x=x;
        this.y=y;
        this.z=z;
      }
	  this.structures=[];
    }
    generate(){
      let rx=0;
      let ry=0;
      let rz=0;
      if(!this.generated){
        for (let x = 0; x < CHSIZE; x++) {
            rx=x+(this.x*CHSIZE);
            for (let z = 0; z < CHSIZE; z++) {
              rz=z+(this.z*CHSIZE);
              let val=Math.round(noise.simplex2(rx / 50., rz / 50.)*5+5);
              for (let y = 0; y < CHSIZE; y++) {
                let ry=y+(this.y*CHSIZE);
                if(ry<=val){
                  if(ry<val){
                    this.data[x][y][z]=2;
                  }else{
                    this.data[x][y][z]=1;
                  }
                  
                }else{
                  if(ry==val+1){
                    if(Math.random()<0.01)
                    this.data[x][y][z]=7;
                  }else{
                    this.data[x][y][z]=0;
                  }
                }
                if(noise.simplex3(rx / 50., ry / 50.,rz/50.)>0.5){
                  this.data[x][y][z]=0;
                }
                
               
              }
              
          }
        }
		/*let numtrees = Math.round(Math.random()*10.);
		for(let i = 0;i<numtrees;i++){
			let x = Math.round(Math.random()*CHSIZE);
			let z = Math.round(Math.random()*CHSIZE);
			while()
		}*/
      }
      this.generated=true;
    }
    update(){
      this.meshgen=false;
    }
    genMesh(chman){
      
      if(!this.meshgen){
        this.cube.clear();
        for (let x = 0; x < CHSIZE; x++) {
          for (let y = 0; y < CHSIZE; y++) {
            for (let z = 0; z < CHSIZE; z++) {
              if(this.data[x][y][z]!=0){
                let b = this.getBlock(x,y,z,chman);
                if(b.isCustomBlock()){
                  this.cube.addFlower(x,y,z,b.tex);
                }else{
                  for (let s = 0; s < 6; s++) {
                    let near=addDir(s,[x,y,z]);
                    let block=this.getBlock(near[0],near[1],near[2],chman);
                    if(block.isGlassBlock()){
                      this.cube.addAABBSide(s,x,y,z,x+1,y+1,z+1,b.getTextureSide(s));
                    }
                  }
                }
              }
              
            }
          }
        }
        this.empty=this.cube.positions.length==0;
        this.meshgen=true;
        this.stored=false;
      }
     
    }
    storeMesh(){
      //this.cube.enabled=false;
      this.cube.store();
      this.stored=true;
      //this.cube.enabled=true;
    }
    isIn(x){
      return (x>=0)&&(x<CHSIZE);
    }
    getHeighest(x,z){
      if(this.isIn(x)&&this.isIn(z))
      for (let y = CHSIZE-1; y >=0 ; y--) {
        if(this.data[x][y][z]!=0)return y;
      }
      return -1;
    }
    setBlock(x,y,z,i){
      if(this.isIn(x)&&this.isIn(z)&&this.isIn(y)){
        this.data[x][y][z]=i;
      }
      this.meshgen=false;
      this.stored=false;
    }
    getBlockid(x,y,z,chman){
      if(this.isIn(x)&&this.isIn(z)&&this.isIn(y)){
        return this.data[x][y][z];
      }else{
        //console.log([x,y,z]);
        return chman.getBlock((this.x*CHSIZE)+x,(this.y*CHSIZE)+y,(this.z*CHSIZE)+z);
        
      }
    }
    getBlock(x,y,z,chman){
      
      return chman.blockreg.getBlock(this.getBlockid(x,y,z,chman));
	}
    
    getRay(from,to,chman){
      if(this.cube.positions.length==0){return null;}
      let pos=[this.x*CHSIZE,this.y*CHSIZE,this.z*CHSIZE];
      if(rayaabb(from,to,pos,vec4.add(vec3.create(),pos,[CHSIZE,CHSIZE,CHSIZE]))){
        this.cube.col=[1,1,1,1];
        let out=null;
        let dst=1000000;
        let tmin=null;
        for (let x = 0; x < CHSIZE; x++) {
          for (let y = 0; y < CHSIZE; y++) {
            for (let z = 0; z < CHSIZE; z++) {
             
              let block=this.getBlock(x,y,z,chman);
              if(block.id!=0){
                let bpos=vec3.add(vec3.create(),pos,[x,y,z]);
                let d=rayaabb(from,to,bpos,vec3.add(vec3.create(),bpos,[1,1,1]));
                if(d!=null){
                  if(d<dst){
                    out=[bpos[0],bpos[1],bpos[2],d,this,-1];
                    dst=d;
                    tmin=d;
                    
                  }
                }
              }

            }
          }
        }
        if(out!=null){
          let hit=[from[0]+to[0]*tmin,from[1]+to[1]*tmin,from[2]+to[2]*tmin];
          function eq(a,b,off=0.0001){
            return a>(b-off)&&a<(b+off);
          }
          let relhit=[hit[0]-out[0],hit[1]-out[1],hit[2]-out[2]];
          let side = 0;
          if(eq(relhit[0],1)){
            side=0;
          }else if(eq(relhit[0],0)){
            side=1;
          }
          else if(eq(relhit[1],1)){
            side=2;
          }
          else if(eq(relhit[1],0)){
            side=3;
          }
          else if(eq(relhit[2],1)){
            side=4;
          }
          else if(eq(relhit[2],0)){
            side=5;
          }
          out[5]=side;
        }
        return out;


      }
      return null;
      
      
    }
    draw(mvp){
      this.cube.draw(mvp);
    }
    hasAllNeighbours(chman){
      for (let i = 0; i < 6; i++) {
       let v=addDir(i,[this.x,this.y,this.z]);
       if(chman.getChunk(v[0],v[1],v[2])==null){
        
        return false;
        }
      }
      //console.log(true);
      return true;
    }
  }