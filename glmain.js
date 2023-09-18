var gl = null;
var chman = null;

function main() {
  var ch;
  const canvas = document.querySelector("#glcanvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  //canvas.style.cursor = 'none';
  gl = canvas.getContext("webgl");
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  var mpos = (0,0);
  var gl_mx=0;
  var gl_my=0;
  let shaders=new Shaders();
  
  class ModelBatch{
    constructor() {
      this.models=[];
    }
    draw(mvp){
      this.models.forEach(e => {
        if(e.enabled){
        e.mat=mvp;
        e.draw();
        }
      });
    }
  }
  //var defaultBatch=new ModelBatch();
 
  
  //let p=new Plane();
  var texatlas=loadTexture("atlas.png");
  let cube=new Cube();
  cube.setShader(shaders.getCubeShader());
  cube.gh=16;
  cube.gw=16;
  cube.tex=texatlas;
  cube.addAABB(0,0,0,10,10,10,5);
  cube.store();
  //console.log(cube);
  function loadLineShader(){
    const vsrc=`
  
  uniform mat4 u_matrix;
  attribute vec4 aVertexPosition;
  
  void main() {
    gl_Position = u_matrix*aVertexPosition;
  }
        `;
        const fsrc=`
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
  }
        `;
        let prog=loadProgram(
          vsrc,fsrc
        );
          return prog;
      }
  function loadPointShader(){
    const vsrc=`
  
  uniform mat4 u_matrix;
  attribute vec4 aVertexPosition;
  
  void main() {
    gl_Position = u_matrix*aVertexPosition;
    gl_PointSize = 10.0;
  }
        `;
        const fsrc=`
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
  }
        `;
        let prog=loadProgram(
          vsrc,fsrc
        );
          return prog;
      }
  let lines=new Lines();
  lines.prog=loadLineShader();
  
  
  
  let pointa=new Points();
  pointa.prog=loadPointShader();
  pointa.addPoint([0,0,0]);
  pointa.store();
  let pointb=new Points();
  pointb.prog=pointa.prog;
  pointb.addPoint([0,0,0]);
  pointb.store();
  let vecpa=[0,0,0];
  let vecpb=[0,0,0];
  let side=-1;
  
  
 
  let blockreg=new BlockRegistry();
  blockreg.newBlock("grass",[3,0,2]);
  blockreg.newBlock("stone",1);
  blockreg.newBlock("dirt",2);
  blockreg.newBlock("wood",4);
  blockreg.newBlock("bricks",7);
  blockreg.newBlock("cobble",16);
  blockreg.addBlock(new BlockTypeFlower(28));
  //blockreg.newBlock("",);

  function getOrSetNewMap(m,k){
    if(m.get(k)==null){
      m.set(k,new Map());
    }
    return(m.get(k));
  }
  noise.seed(Math.random());

  
  chman=new ChunkManager();
  chman.cube = cube;
  chman.blockreg=blockreg;
  ch=new Chunk(0,0,0);
  ch.generate();
  ch.cube.prog=shaders.getCubeShader();
  ch.cube.gh=16;
  ch.cube.gw=16;
 
  
  ch.cube.tex=texatlas;
  ch.genMesh(chman);
  ch.storeMesh();
  var hitchunk=null;
  
  chman.setPos(0,0,0);
  let starttime = performance.now();
  chman.generate(0,0,0);
  console.log("generation time",(performance.now()-starttime)/1000);
  //cube.addAABB(-0.5,-0.5,-0.5,0.5,0.5,0.5,0);//Math.round(Math.random()*100.));
  //cube.store();
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
  gl.clearColor(0.5, 0.5, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Turn on culling. By default backfacing triangles
  // will be culled.
  gl.enable(gl.CULL_FACE);

  // Enable the depth buffer
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var lastSquareUpdateTime=null;
  var squareRotation=0;
  //let matrixprojection=m4.perspective(degToRad(50), gl.canvas.clientWidth / gl.canvas.clientHeight,0.1,100);
  
  
  
  
  let camera = new Camera();

  // assumes target or event.target is canvas
  function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
    target = target || event.target;
    var pos = getRelativeMousePosition(event, target);
    event.preventDefault();
    pos.x = pos.x * target.width  / target.clientWidth;
    pos.y = pos.y * target.height / target.clientHeight;
    //console.log(event);
    event.x=canvas.width/2;
    event.y=canvas.height/2;
    
    return pos;  
  }
  var cameramoving = false;
window.addEventListener('mousemove', e => {

  //mpos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, gl.canvas);
  // pos is in pixel coordinates for the canvas.
  // so convert to WebGL clip space coordinates
  //gl_mx = mpos.x / gl.canvas.width *2-1  ;
  //gl_my =1- mpos.y / gl.canvas.height *2 ;
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0,
  movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;
      if(cameramoving)
  camera.rotate(-movementY/10,-movementX/10,0);
  //console.log([gl_mx,gl_my]);
  //console.log(e); 
});

  //let campos=[0,2,10];
  //let camrot=[0,0,0];
  
  //let plane=new Plane();
  
  var keys = {};

  window.addEventListener('keydown',function(e) { 
    e.preventDefault();
    keys[e.keyCode] = true;
    if(e.keyCode==27){
      cameramoving = false;
    }
    //alert(e.keyCode);
  },false);
  window.addEventListener('keyup',function(e) {
     keys[e.keyCode] = false; 
     //console.log(e);
    },false);
  
 
  window.addEventListener('resize', resizeCanvas, false);
  let d=-0.01;
  let dp=1+(-d);
  let p1=[d,d,d];
  
  let p2=[dp,d,d];
  let p3=[d,dp,d];
  let p4=[d,d,dp];
  
  let p5=[dp,dp,d];
  let p6=[d,dp,dp];
  let p7=[dp,d,dp];
  
  let p8=[dp,dp,dp];



  lines.addLine(p1,p2);
  lines.addLine(p1,p3);
  lines.addLine(p1,p4);

  lines.addLine(p2,p5);
  lines.addLine(p3,p6);
  lines.addLine(p4,p7);
  
  lines.addLine(p2,p7);
  lines.addLine(p3,p5);
  lines.addLine(p4,p6);

  lines.addLine(p8,p5);
  lines.addLine(p8,p6);
  lines.addLine(p8,p7);
  
  lines.store();
  
  

  let bpos=null;
    //console.log([rayeye,raywor]);
  let chair=new Crosshair();

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    mat4.perspective(camera.matrixprojection,degToRad(50), gl.canvas.clientWidth / gl.canvas.clientHeight,0.1,100);
    // Redraw everything after resizing the window
    
  }
  resizeCanvas();
  
  let element=canvas;
 
  
  var mbutton=new Map();
  canvas.addEventListener('mousedown', function(evt) {
    mbutton.set(evt.button,1);
    
  });
  canvas.addEventListener('mouseup', function(evt) {
    mbutton.set(evt.button,0);
    
  });
  document.addEventListener('pointerlockchange', (e)=>{
    //console.log(e);
    if(document.pointerLockElement!==canvas){
      cameramoving=false;
    }
  }, false);
  canvas.addEventListener("click",function() {
    
    
    canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    canvas.requestPointerLock();
    cameramoving=true;
    
  },false);
 
  let maxfps=60;
  //console.log( ch);
	//console.log(chman);
  let lastcamrot = camera.rot;
  let lastcampos = camera.pos;
  let rgbodypos = new Float32Array([5,20,6]);
  var delta = 1;
  let vy = 0.;
  var onground= false;
  function update(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var currentTime = (new Date).getTime();
    if (lastSquareUpdateTime) {
      delta = currentTime - lastSquareUpdateTime;
      squareRotation += (30 * delta) / 1000.0;
    }
    let delay=0;
    if(delta<(1000/maxfps)){
      delay=(1000/maxfps)-delta;
    }
    
    lastSquareUpdateTime = currentTime;
    delta=delta/10;
    let rotspeed=1.;
    let speed=0.1;
    //console.log(delta);
    
    if(!onground){
      vy += -0.007*delta;
      vy = Math.max(vy,-1);
    }
    if(keys[32]){
      if(onground){
        vy=0.2;
        onground=false;
      }
    }
    let vx = 0;
    let vz = 0;
    let rbspeed = 0.1;
    if(keys[37])   vx=-delta*rbspeed;
    if(keys[39])  vx=delta*rbspeed; 
    if(keys[38])  vz=-delta*rbspeed; 
    if(keys[40]) vz=delta*rbspeed; 
    let ax = 0;
    let ay = 0;
    if(keys[83])ay=1;
    if(keys[87])ay=-1;
    if(keys[65])ax=-1;
    if(keys[68])ax=1;
    let a = degToRad(-camera.rot[1]);
    vx = (ax*Math.cos(a)-ay*Math.sin(a))*delta*rbspeed;
    vz = (ax*Math.sin(a)+ay*Math.cos(a))*delta*rbspeed;
    
    if(keys[81]){
      rgbodypos=[0,20,0];
    }
    let sx = 0.8;
    let sy = 1.8;
    let sz = 0.8;
    let checkcolliding=()=>{
      
      let bsx = Math.ceil(sx);
      let bsy = Math.ceil(sy);
      let bsz = Math.ceil(sz);
      let bx = Math.floor(rgbodypos[0]);
      let by = Math.floor(rgbodypos[1]);
      let bz = Math.floor(rgbodypos[2]);
      for (let x = 0; x < bsx+1; x++) {
        for (let y = 0; y < bsy+1; y++) {
          for (let z = 0; z < bsz+1; z++) {
            let b = chman.getBlockCached2(bx+x,by+y,bz+z);
            if(b !=0){
              if(aabbaabbcollide(bx+x,by+y,bz+z,bx+x+1,by+y+1,bz+z+1,
                rgbodypos[0],rgbodypos[1],rgbodypos[2],
                rgbodypos[0]+sx,rgbodypos[1]+sy,rgbodypos[2]+sz
                ))
              return true;
            }
          }
        }
      }
      return false;
    };
    onground=false;
    rgbodypos[1]+=vy;
    if(checkcolliding()){
      rgbodypos[1]-=vy;
      if(vy<0){
        onground=true;
        //console.log("onground");
      }
    }
    rgbodypos[0]+=vx;
    if(checkcolliding()){
      rgbodypos[0]-=vx;
    }
    rgbodypos[2]+=vz;
    if(checkcolliding()){
      rgbodypos[2]-=vz;
    }
    
    if(keys[17])speed=1.;
      /*if(keys[37])  camera.rotate(0,rotspeed*delta,0); 
      if(keys[38])  camera.rotate(rotspeed*delta,0,0);
      if(keys[39])  camera.rotate(0,-rotspeed*delta,0); 
      if(keys[40])  camera.rotate(-rotspeed*delta,0,0);*/
      /*if(keys[83])camera.move(0,0,speed*delta);
      if(keys[87])camera.move(0,0,-speed*delta);
      if(keys[65])camera.move(-speed*delta,0,0);
      if(keys[68])camera.move(speed*delta,0,0);*/

      //if(keys[16])camera.translate(0,-speed*delta,0);
      //if(keys[32])camera.translate(0,speed*delta,0);
      if(keys[69]){
        //camera.setPosition(rgbodypos[0],rgbodypos[1],rgbodypos[2]);
        rgbodypos=[0,20,0];
      }
      camera.setPosition(rgbodypos[0]+sx/2.,rgbodypos[1]+1.7,rgbodypos[2]+sx/2.);
      // key h 
      if(keys[72]){
        let ch2 = chman.getChunk(
          Math.floor(camera.pos[0]/CHSIZE),
          Math.floor(camera.pos[1]/CHSIZE),
          Math.floor(camera.pos[2]/CHSIZE)
        );
        camera.pos[1]=ch2.
          getHeighest(
            Math.floor(camera.pos[0])-ch2.x*CHSIZE,
            Math.floor(camera.pos[2])-ch2.z*CHSIZE
          )+1.1;
      }
  /*  if(keys[85]){
      let ch=chman.getChunk(chman.pos[0],chman.pos[1],chman.pos[2]);
      if(ch!=null){
        ch.meshgen=false;
        ch.stored=false;
      }
    }*/
    if(mbutton.get( 0)) {
      if(bpos!=null){
        let c=chman.setBlock(bpos[0],bpos[1],bpos[2],0);
        
        /*if(c!=null){
        c.genMesh();
        c.storeMesh();
        }*/
      }
    }
    if(mbutton.get(2)) {
      
    if(bpos!=null){
      console.log(bpos);
      let nb=vec3.add(vec3.create(),bpos,addDir(bpos[5]));
      let c=chman.setBlock(nb[0],nb[1],nb[2],1);
      /*if(c!=nulleqffhh){
        c.genMesh();
        c.storeMesh();
      }*/
    }
    }
    //let inverted=mat4.invert(mat4.create(),matrixmodelviewprojection);
    let mvp=camera.getMVP();
    if(lastcamrot!=camera.rot){
      bpos=chman.getRay(camera.pos,camera.getRay(gl_mx,gl_my));
      lastcamrot=camera.rot;
    }
    if(lastcampos!=camera.pos){
      bpos=chman.getRay(camera.pos,camera.getRay(gl_mx,gl_my));
      lastcampos=camera.pos;
      chman.setPos(camera.pos[0],camera.pos[1],camera.pos[2]);
    }
    if(bpos!=null){
      lines.draw(mat4.translate(mat4.create(),mvp,bpos));
      //let pts=rayaabbintersection(camera.pos,camera.getRay(),bpos,vec3.add(vec3.create(),bpos,[1,1,1]));
      
    }
    //rgbodypos-=0.01;
    //lines.draw(mat4.scale(mat4.create(),mat4.translate(mat4.create(),mvp,rgbodypos),[sx,sy,sz]));
    
    chman.loaded=0;
    chman.draw(mvp);
    //ch.draw(mvp);
    //pointa.mat=mat4.translate(mat4.create(),mvp,vecpa);
    //pointa.draw();
    
    //cube.draw(mvp);
    //
    chair.draw();
    //chman.getChunk(0,0,0).cube.draw(mvp);
    
    //defaultBatch.draw(mvp);
    
    
    window.requestAnimationFrame(update);
  }
  update();
  
}