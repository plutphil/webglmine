
importScripts("util.js");
importScripts("perlin.js");
importScripts("Chunk.js");
importScripts("Generator.js");

var generator = new Generator();
onmessage = (e) => {
    console.log("Message received from main script",e.data);
    const ch = Object.assign(new Chunk(),e.data);
    ch.genMesh();
    
    postMessage(ch);
};
  