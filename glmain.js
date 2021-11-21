var gl = null;


function main() {
    var ch;
  const canvas = document.querySelector("#glcanvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cursor = 'none';
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
  console.log(cube);
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

  

  let stone=new BlockType();
  stone.tex=3;
  stone.textures[2]=0;
  stone.textures[3]=2;
  
  blockreg.addBlock(stone);

  stone=new BlockType();
  stone.tex=1;
  blockreg.addBlock(stone);


  
  
  
  function getOrSetNewMap(m,k){
    if(m.get(k)==null){
      m.set(k,new Map());
    }
    return(m.get(k));
  }
  noise.seed(Math.random());

  
  var chman=new ChunkManager();
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
  chman.generate(0,0,0);
  
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
  camera.rotate(-movementY/10,-movementX/10,0);
  //console.log([gl_mx,gl_my]);
  //console.log(e); 
});

  //let campos=[0,2,10];
  //let camrot=[0,0,0];
  
  //let plane=new Plane();
  
  var keys = {};

  window.addEventListener('keydown',function(e) { keys[e.keyCode] = true;
    //alert(e.keyCode);
  },false);
  window.addEventListener('keyup',function(e) { keys[e.keyCode] = false; },false);
  
 
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
  canvas.addEventListener("click",function() {
    
    
    canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    canvas.requestPointerLock();
    
  },false);
 
  let maxfps=60;
  console.log( ch);
	console.log(chman);
  function update(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var currentTime = (new Date).getTime();
    if (lastSquareUpdateTime) {
      var delta = currentTime - lastSquareUpdateTime;
      squareRotation += (30 * delta) / 1000.0;
    }
    let delay=0;
    if(delta<(1000/maxfps)){
      delay=(1000/maxfps)-delta;
    }
    
    lastSquareUpdateTime = currentTime;
    delta=delta/10;
    
      if(keys[37])  camera.rotate(0,1*delta,0); 
      if(keys[38])  camera.rotate(1*delta,0,0);
        if(keys[39])  camera.rotate(0,-1*delta,0); 
          if(keys[40])  camera.rotate(-1*delta,0,0);
      if(keys[83])camera.move(0,0,0.1*delta);
        if(keys[87])camera.move(0,0,-0.1*delta);
          if(keys[65])camera.move(-0.1*delta,0,0);
            if(keys[68])camera.move(0.1*delta,0,0);
      
      if(keys[72])camera.pos[1]=ch.getHeighest(Math.floor(camera.pos[0]),Math.floor(camera.pos[2]))+1.1;
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
      /*if(c!=null){
        c.genMesh();
        c.storeMesh();
      }*/
    }
    }
    
    //let inverted=mat4.invert(mat4.create(),matrixmodelviewprojection);
    let mvp=camera.getMVP();
    
   


    bpos=chman.getRay(camera.pos,camera.getRay(gl_mx,gl_my));
    if(bpos!=null){
      lines.draw(mat4.translate(mat4.create(),mvp,bpos));
      //let pts=rayaabbintersection(camera.pos,camera.getRay(),bpos,vec3.add(vec3.create(),bpos,[1,1,1]));
      
    }
    chman.setPos(camera.pos[0],camera.pos[1],camera.pos[2]);
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