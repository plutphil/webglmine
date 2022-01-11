class BlockType{
    constructor(){
      this.id=0;
	  this.name="Block";
    }
    isGlassBlock(){
      return false;
    }
	isCustomBlock(){
		return false;
	}
    getTextureSide(s){
       return 1;
    }

  }
class BlockTypeAir extends BlockType{
	constructor(){
      super();
	  this.name="Air";
    }
	isGlassBlock(){
      return true;
    }
}
class BlockTypeStandard extends BlockType{
	constructor(t){
      super();
		this.tex=3;
    }
	getTextureSide(s){
       return this.tex;
    }
}
class BlockTypeCustomSide extends BlockType{
	constructor(){
		super();
		this.textures=[-1,-1,-1,-1,-1,-1];    
	}
	getTextureSide(s){
     return this.textures[s];
	}
}
class BlockTypeComlumn extends BlockType{
	constructor(){
		super();
		this.top=0;
		this.bottom=0;
	}
	getTextureSide(s){
		if(s==2)return this.top;
		if(s==3)return this.bottom;
		return this.tex;
	}
	
}
class BlockTypeFlower extends BlockType{
	constructor(t){
		super();
		this.tex=t;
	}
	
	isGlassBlock(){
		return true;
	}
	isCustomBlock(){
		return true;
	}
}
class BlockRegistry{
	constructor(){
		this.blocks=[];
		this.addBlock(new BlockTypeAir());
	}
	getBlock(id){
		if(id==null)return this.blocks[0];
		if(id>0&&id<this.blocks.length){
		return this.blocks[id];
		}
		return this.blocks[0];
		
	}
	addBlock(b){
		b.id=this.blocks.length;
		this.blocks.push(b);
		return b;
	}
	newBlock(name,tex){
		let b = {};
		if(typeof tex =="number"){
			b = new BlockTypeStandard();
			b.tex = tex;
		}else{
			if(tex.length==3){
				b = new BlockTypeComlumn();
				b.tex = tex[0];
				b.top = tex[1];
				b.bottom = tex[2];
				
			}
			else if(tex.length==6){
				b= new BlockTypeCustomSide();
				b.textures=tex;
			}
		}
		b.name=name;
		return this.addBlock(b);
	}
}