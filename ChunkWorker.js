
importScripts("util.js");
importScripts("perlin.js");
importScripts("ChunkMesh.js");
importScripts("Chunk.js");
importScripts("ChunkManager.js");
importScripts("Generator.js");
importScripts("Block.js");

let blockreg=new BlockRegistry();
blockreg.newBlock("grass",[3,0,2]);
blockreg.newBlock("stone",1);
blockreg.newBlock("dirt",2);
blockreg.newBlock("wood",4);
blockreg.newBlock("bricks",7);
blockreg.newBlock("cobble",16);
blockreg.addBlock(new BlockTypeFlower(28));
var chman=new ChunkManager();
chman.blockreg=blockreg;
var generator=new Generator();

var generator = new Generator();
onmessage = (e) => {
    //console.log("Message received from main script",e.data);

    const ch = Object.assign(new Chunk(),e.data);
    
    if(!ch.generated){
        generator.generateChunk(ch);
    }
    ch.cube = new ChunkMesh();
    ch.genMesh(chman);
    postMessage([ch,ch.cube]);
};
  