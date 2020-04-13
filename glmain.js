function multiplyMatrixAndPoint(matrix, point) {
  // Give a simple variable name to each part of the matrix, a column and row number
  let c0r0 = matrix[ 0], c1r0 = matrix[ 1], c2r0 = matrix[ 2], c3r0 = matrix[ 3];
  let c0r1 = matrix[ 4], c1r1 = matrix[ 5], c2r1 = matrix[ 6], c3r1 = matrix[ 7];
  let c0r2 = matrix[ 8], c1r2 = matrix[ 9], c2r2 = matrix[10], c3r2 = matrix[11];
  let c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];
  
  // Now set some simple names for the point
  let x = point[0];
  let y = point[1];
  let z = point[2];
  let w = point[3];
  
  // Multiply the point against each part of the 1st column, then add together
  let resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);
  
  // Multiply the point against each part of the 2nd column, then add together
  let resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);
  
  // Multiply the point against each part of the 3rd column, then add together
  let resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);
  
  // Multiply the point against each part of the 4th column, then add together
  let resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);
  
  return [resultX, resultY, resultZ, resultW];
}


var gl = null;
function main() {
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
  function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();
  
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }
 
  
  function loadShader( type, source) {
    const shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function loadProgram(vsSource,fsSource){
    const vertexShader = loadShader( gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader( gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    return shaderProgram;
  }
  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }
  function loadTexture(src){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    
    // Asynchronously load an image
    var image = new Image();
    image.src = src;
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        // Check if the image is a power of 2 in both dimensions.
      let mipmaps="";
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          // Yes, it's a power of 2. Generate mips.
          gl.generateMipmap(gl.TEXTURE_2D);
          mipmaps="mipmaps";
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      
        } else {
          // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          
      }
      
      console.log("loaded tex:"+image.src+" to "+texture+" "+mipmaps);
      console.log(texture);
    });
    return texture;
  }
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
  class Model{
    constructor() {
      this.init();
    }
    init(){}
    draw(mvp){

    }
  }
  class Plane extends Model{
    init() {
      const vsrc=`
attribute vec4 aVertexPosition;
varying vec2 vTextureCoord;
void main() {
  gl_Position = aVertexPosition*0.5;
  vTextureCoord=aVertexPosition.xy;
}
      `;
      const fsrc=`
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_mousepos;
varying vec2 vTextureCoord;
void main() {
  
  gl_FragColor = distance(u_mousepos,vTextureCoord)<0.01?vec4(vec3(0.0),1.):vec4(vTextureCoord,0.5,1.)*distance(u_mousepos,vTextureCoord);//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
}
      `;
      this.prog=loadProgram(
        vsrc,fsrc
      );
      this.locv=gl.getAttribLocation(this.prog,"aVertexPosition");
      this.locump=gl.getUniformLocation(this.prog,"u_mousepos");
      const positions = [
          1.0,  1.0,
        -1.0,  1.0,
          1.0, -1.0,
        -1.0, -1.0,
      ];
      
      this.vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
    }
    draw(){
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
      gl.vertexAttribPointer(
          this.locv,
          2,
          gl.FLOAT,
          false,
          0,
          0);
      gl.enableVertexAttribArray(this.locv);
      gl.uniform2f(this.locump,gl_mx,gl_my);
     
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(this.locv);
    }
  }
  class Crosshair extends Model{
    init() {
      const vsrc=`
attribute vec4 aVertexPosition;
varying vec2 vTextureCoord;
void main() {
  gl_Position = aVertexPosition*0.5;
  vTextureCoord=aVertexPosition.xy;
}
      `;
      const fsrc=`
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_mousepos;
varying vec2 vTextureCoord;
uniform vec2 u_screen;
void main() {
  float ratio=u_screen.y/u_screen.x;
  vec2 ed=vTextureCoord;
  ed.x/=ratio;
  gl_FragColor = (
    (distance(u_mousepos,vec2(ed.x/10.,ed.y))<0.01)
    ^^(distance(u_mousepos,vec2(ed.x,ed.y/10.))<0.01)
    )
    ?vec4(0.1,0.1,0.1,1.0):vec4(0.5,0.5,0.5,0.0);
  //distance(u_mousepos,vTextureCoord)<0.01?vec4(vec3(0.0),1.):vec4(vTextureCoord,0.5,1.)*distance(u_mousepos,vTextureCoord);
  //texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
}
      `;
      this.prog=loadProgram(
        vsrc,fsrc
      );
      this.locv=gl.getAttribLocation(this.prog,"aVertexPosition");
      this.locump=gl.getUniformLocation(this.prog,"u_mousepos");
      this.locscr=gl.getUniformLocation(this.prog,"u_screen");
      const positions = [
          1.0,  1.0,
        -1.0,  1.0,
          1.0, -1.0,
        -1.0, -1.0,
      ];
      
      this.vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
    }
    draw(){
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
      gl.vertexAttribPointer(
          this.locv,
          2,
          gl.FLOAT,
          false,
          0,
          0);
      gl.enableVertexAttribArray(this.locv);
      gl.uniform2f(this.locump,gl_mx,gl_my);
      gl.uniform2f(this.locscr,gl.canvas.width,gl.canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(this.locv);
    }
  }
  class Cube extends Model{
    init(){
      this.dims=3;
      this.tex=null;
      this.gw=1;
      this.gh=1;
      
      this.mat=null;
      this.positions = [];
      this.normals = [];
      this.texcoords=[];
      this.indices=[];
      this.col=[1,1,1,1];
    }
    getAABB(){
      return this.aabbFromPoints(this.positions);
    }
    addTri(a,b,c,tca,tcb,tcc){
      this.positions=this.positions.concat(a);
      this.positions=this.positions.concat(b);
      this.positions=this.positions.concat(c);
      this.texcoords=this.texcoords.concat(tca);
      this.texcoords=this.texcoords.concat(tcb);
      this.texcoords=this.texcoords.concat(tcc);
      let l=Math.floor(this.positions.length/this.dims);
      this.indices.push(l-3);
      this.indices.push(l-2);
      this.indices.push(l-1);
    }
    addQuad2(a,b,c,d,tca,tcb,tcc,tcd){
      this.positions=this.positions.concat(a);
      this.positions=this.positions.concat(b);
      this.positions=this.positions.concat(c);
      this.positions=this.positions.concat(d);
      let l=Math.floor(this.positions.length/this.dims);
      this.texcoords=this.texcoords.concat(tca);
      this.texcoords=this.texcoords.concat(tcb);
      this.texcoords=this.texcoords.concat(tcc);
      this.texcoords=this.texcoords.concat(tcd);
      
      this.indices.push(l-3);
      this.indices.push(l-4);
      this.indices.push(l-2);
      
      this.indices.push(l-2);
      this.indices.push(l-4);
      
      this.indices.push(l-1);
      
    }
    addQuad(a,b,c,d){
      this.addQuad2(a,b,c,d,
        [0,0],
        [1,0],
        [1,1],
        [0,1]
        );
    }
    addQuadGrid(a,b,c,d,x,y,w,h){
      let xs=1/w*x;
      let xe=1/w*(x+1);
      let ys=1/h*y;
      let ye=1/h*(y+1);
      this.addQuad2(a,b,c,d,
        [xs,ys],
        [xs,ye],
        [xe,ye],
        [xe,ys]
        );
    }
    addNormal(x,y,z,t){
      if(t){
        for (let i = 0; i < t; i++) {
          this.normals=this.normals.concat([x,y,z]);
        }
      }else{
      this.normals=this.normals.concat([x,y,z]);
      }
    }
    addAABB(minx,miny,minz,maxx,maxy,maxz,texi){
      let gy=Math.floor(texi/this.gw);
      let gx=texi-(gy*this.gw);
      this.addQuadGrid(
        [minx,maxy,minz],
        [minx,miny,minz],
        [maxx,miny,minz], 
        [maxx,maxy,minz], 
       
        gx,gy,this.gw,this.gh
      );
      this.addQuadGrid( 
        [maxx,maxy,maxz], 
        [maxx,miny,maxz],
        [minx,miny,maxz],
        [minx,maxy,maxz],
        
        gx,gy,this.gw,this.gh
      );
      this.addQuadGrid(
        [maxx,miny,maxz], 
        
        [maxx,miny,minz], 
        [minx,miny,minz],
        [minx,miny,maxz],
        gx,gy,this.gw,this.gh
      );
      this.addQuadGrid(
        
        [maxx,maxy,minz], 
        [maxx,maxy,maxz], 
        [minx,maxy,maxz],
        [minx,maxy,minz],
        gx,gy,this.gw,this.gh
      );
      this.addQuadGrid(
        [maxx,maxy,minz], 
        [maxx,miny,minz],
        [maxx,miny,maxz],
        [maxx,maxy,maxz], 
       
       
        gx,gy,this.gw,this.gh
      );
      this.addQuadGrid(
        [minx,maxy,maxz],
        [minx,miny,maxz], 
        
        [minx,miny,minz], 
        [minx,maxy,minz],
        
        gx,gy,this.gw,this.gh
      );
    }
    addAABBSide(side,minx,miny,minz,maxx,maxy,maxz,texi){
      let gy=Math.floor(texi/this.gw);
      let gx=texi-(gy*this.gw);
      switch (side) {
        case 5:
          this.addQuadGrid(
            [minx,maxy,minz],
            [minx,miny,minz],
            [maxx,miny,minz], 
            [maxx,maxy,minz], 
            gx,gy,this.gw,this.gh
          );
          this.addNormal(0,0,-1,4);
          break;
          case 4:
 this.addQuadGrid( 
        [maxx,maxy,maxz], 
        [maxx,miny,maxz],
        [minx,miny,maxz],
        [minx,maxy,maxz],
        gx,gy,this.gw,this.gh
      );
      this.addNormal(0,0,1,4);
          break;
          case 3:
  this.addQuadGrid(
        [maxx,miny,maxz], 
        
        [maxx,miny,minz], 
        [minx,miny,minz],
        [minx,miny,maxz],
        gx,gy,this.gw,this.gh
      );
      this.addNormal(0,-1,0,4);
          break;
          case 2:
 this.addQuadGrid(
        
        [maxx,maxy,minz], 
        [maxx,maxy,maxz], 
        [minx,maxy,maxz],
        [minx,maxy,minz],
        gx,gy,this.gw,this.gh
      );
      this.addNormal(0,1,0,4);
          break;
          case 0:
 this.addQuadGrid(
        [maxx,maxy,minz], 
        [maxx,miny,minz],
        [maxx,miny,maxz],
        [maxx,maxy,maxz], 
        
       
        gx,gy,this.gw,this.gh
      );
      this.addNormal(1,0,0,4);
          break;
          case 1:
 this.addQuadGrid(
        [minx,maxy,maxz],
        [minx,miny,maxz], 
        
        [minx,miny,minz], 
        [minx,maxy,minz],
        
        gx,gy,this.gw,this.gh
      );
      this.addNormal(-1,0,0,4);
          break;
                                        
        default:
          break;
      }
      
     
    
     
     
     
    }
    store() {
      //console.log("pos l:",this.positions.length/3);
      //console.log("tc l:",this.texcoords.length/2);
      
      //console.log("ind l:",this.indices.length/3);
      
      
      if(this.vbuffer){
        if(this.tcbuffer){
          if(this.ibuffer){
            if(this.nbuffer){
              if(this.oldsize<this.indices.length){
                gl.deleteBuffer(this.vbuffer);
                gl.deleteBuffer(this.tcbuffer);
                gl.deleteBuffer(this.ibuffer);
                gl.deleteBuffer(this.nbuffer);
              }else{
                gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(this.positions));

                gl.bindBuffer(gl.ARRAY_BUFFER,this.tcbuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(this.texcoords));

                gl.bindBuffer(gl.ARRAY_BUFFER,this.nbuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(this.normals));
                
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
                gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,new Uint16Array(this.indices));
                this.oldsize=this.indices.length;
                return;
            
                
              }
            }
          }
        }
      }
      this.locv=gl.getAttribLocation(this.prog,"aVertexPosition");
      this.loctc=gl.getAttribLocation(this.prog,"a_texcoord");
      this.locnorm=gl.getAttribLocation(this.prog,"a_normal");
      this.locmat=gl.getUniformLocation(this.prog,"u_matrix");
      this.loctex=gl.getUniformLocation(this.prog,"u_texture");
      this.loccol=gl.getUniformLocation(this.prog,"u_color");
      this.vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.positions),gl.STATIC_DRAW);
      this.tcbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.tcbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.texcoords),gl.STATIC_DRAW);
      this.nbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.nbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.normals),gl.STATIC_DRAW);
      this.ibuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);
      this.oldsize=this.indices.length;
    }
    draw(mvp){
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
      gl.vertexAttribPointer(
          this.locv,
          3,
          gl.FLOAT,
          false,
          0,
          0);
         
      gl.enableVertexAttribArray(this.locv);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
      gl.vertexAttribPointer(
          this.locnorm,
          3,
          gl.FLOAT,
          false,
          0,
          0);
         
      gl.enableVertexAttribArray(this.locnorm);

      gl.bindBuffer(gl.ARRAY_BUFFER,this.tcbuffer);
      gl.vertexAttribPointer(
        this.loctc,
        2,
        gl.FLOAT,
        false,
        0,
        0);
      gl.enableVertexAttribArray(this.loctc);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer);
      //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positions.length/3);
      //console.log(mvp);
      gl.uniformMatrix4fv(this.locmat,false,mvp);

      gl.uniform1i(this.loctex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.uniform4f(this.loccol,this.col[0],this.col[1],this.col[2],this.col[3]);
      gl.drawElements(gl.TRIANGLES,this.indices.length,gl.UNSIGNED_SHORT,0);

      gl.disableVertexAttribArray(this.locv);
      gl.disableVertexAttribArray(this.tcbuffer);
    }
  }
  class Lines extends Model{
    init(){
      this.dims=3;
      this.mat=null;
      this.positions = [];
      this.indices=[];
    }
    addLine(a,b){
      this.positions=this.positions.concat(a);
      this.positions=this.positions.concat(b);
      let l=Math.floor(this.positions.length/this.dims);
      this.indices.push(l-2);
      this.indices.push(l-1);
    }
    store() {
      
      this.locv=gl.getAttribLocation(this.prog,"aVertexPosition");
      this.locmat=gl.getUniformLocation(this.prog,"u_matrix");
      this.loccol=gl.getUniformLocation(this.prog,"u_color");
      if(this.vbuffer){
        if(this.ibuffer){
          gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(this.positions));
          
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
          gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,new Uint16Array(this.indices));
          return;
        }
      }
      this.vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.positions),gl.STATIC_DRAW);
      
      this.ibuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.indices),gl.STATIC_DRAW);
    }
    draw(mvp){
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
      gl.vertexAttribPointer(
          this.locv,
          3,
          gl.FLOAT,
          false,
          0,
          0);
         
      gl.enableVertexAttribArray(this.locv);


      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer);
      //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positions.length/3);
      //console.log(this.mat);
      gl.uniformMatrix4fv(this.locmat,false,mvp);
      gl.uniform4f(this.loccol,1,0,0,1);

      gl.drawElements(gl.LINES,this.indices.length,gl.UNSIGNED_SHORT,0)
      
      gl.disableVertexAttribArray(this.locv);
    }
  }
  class Points extends Model{
    init(){
      this.dims=3;
      this.mat=null;
      this.positions = [];
      this.enabled=false;
    }
    addPoint(a){
      this.positions=this.positions.concat(a);
    }
    store() {
      
      this.locv=gl.getAttribLocation(this.prog,"aVertexPosition");
      this.locmat=gl.getUniformLocation(this.prog,"u_matrix");
      this.loccol=gl.getUniformLocation(this.prog,"u_color");
      if(this.vbuffer){
        if(this.ibuffer){
          gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(this.positions));
          
          return;
        }
      }
      this.vbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.positions),gl.STATIC_DRAW);
      
    }
    draw(){
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
      gl.vertexAttribPointer(
          this.locv,
          3,
          gl.FLOAT,
          false,
          0,
          0);
         
      gl.enableVertexAttribArray(this.locv);


      //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positions.length/3);
      //console.log(this.mat);
      gl.uniformMatrix4fv(this.locmat,false,this.mat);
      gl.uniform4f(this.loccol,0,0,0,1);
      gl.drawArrays(gl.Points,0,this.positions.length/3);
      gl.disableVertexAttribArray(this.locv);
    }
  }
  function loadCubeShader(){  
  const vsrc=`

uniform mat4 u_matrix;
attribute vec4 aVertexPosition;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
varying vec2 vTextureCoord;
varying vec3 vNormCord;
void main() {
  gl_Position = u_matrix*aVertexPosition;
  
  float l=dot(a_normal,normalize( 	vec3(0.3,1.,1.)))-0.2;
  float d=distance(aVertexPosition.xyz,vec3(4,5,6));
  float maxd=5.1;
  //l=max(l,d<maxd?1.-(d/maxd):0.);
  float add=0.5;
  l=add+(1.-add)*l;
  vNormCord=vec3(l);
  vTextureCoord=a_texcoord;
}
      `;
      const fsrc=`
#ifdef GL_ES
precision mediump float;
#endif
varying vec2 vTextureCoord;
uniform sampler2D u_texture;
uniform vec4 u_color;
varying vec3 vNormCord;
void main() {
  gl_FragColor = vec4(vNormCord,1.)*u_color*vec4(texture2D(u_texture,vTextureCoord));//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
}
      `;
      let prog=loadProgram(
        vsrc,fsrc
      );
        return prog;
    }
  //let p=new Plane();
  let cube=new Cube();
  cube.prog=loadCubeShader();
  cube.gh=16;
  cube.gw=16;
  cube.tex=loadTexture("atlasmc.png");
  const CHSIZE=8;
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
  function aabbFromPoints(points){
    if(points.empty())return new AABB(0,0,0,0,0,0);
    let minx=points[0][0];
    let miny=points[0][1];
    let minz=points[0][2];
    let maxx=minx;
    let maxy=miny;
    let maxz=minz;
    for (let i = 3; i < points.length-2; i+=3) {
      const element = points[i];
      minx=Math.min(minx,points[i]);
      miny=Math.min(miny,points[i+1]);
      minz=Math.min(minz,points[i+2]);
      
      maxx=Math.min(maxx,points[i]);
      maxy=Math.min(maxx,points[i+1]);
      maxz=Math.min(maxx,points[i+2]);
    }
    return new AABB(minx,miny,minz,maxx,maxy,maxz);
    
  }
  class AABB{
    constructor(minx,miny,minz,maxx,maxy,maxz){
      this.minx=minx;
      this.miny=miny;
      this.minz=minz;
      
      this.maxx=maxx;
      this.maxy=maxy;
      this.maxz=maxz;
      
    }

  }
  
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
  function addDir(d,pin){
    let p=[0,0,0];
    if(pin)p=pin;
    switch (d) {
      case 0:
        p[0]++;
        return p;
        break;
        case 1:
        p[0]--;
        return p;
        break;
        case 2:
        p[1]++;
        return p;
        break;
        case 3:
        p[1]--;
        return p;
        break;
        case 4:
        p[2]++;
        return p;
        break;
        case 5:
        p[2]--;
        return p;
        break;
        
      default:
        break;
    }
  }
  class BlockType{
    constructor(){
      this.id=0;
      this.glassblock=false;
      this.tex=3;
      this.textures=[-1,-1,-1,-1,-1,-1];    
    }
    isGlassBlock(){
      return this.glassblock;
    }
    getTextureSide(s){
        if(this.textures[s]!=-1){
          return this.textures[s];
        }else{
          return this.tex;
        }
      	
    }
  }

  class BlockRegistry{
    constructor(){
      this.blocks=[];
      let air=new BlockType();
      air.glassblock=true;
      this.addBlock(air);
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
    }
  }
 
  let blockreg=new BlockRegistry();

  

  let stone=new BlockType();
  stone.tex=3;
  stone.textures[2]=0;
  stone.textures[3]=2;
  
  blockreg.addBlock(stone);

  stone=new BlockType();
  stone.tex=1;
  blockreg.addBlock(stone);


  function rayaabb(from,to,bmin,bmax){
    let t=0;
    let r={
      dir:{x:to[0],y:to[1],z:to[2]},
      org:{x:from[0],y:from[1],z:from[2]},
    };
    //console.log(r);
    let rt={x:bmax[0],y:bmax[1],z:bmax[2]};
    let lb={x:bmin[0],y:bmin[1],z:bmin[2]};
    let dirfrac={x:0,y:0,z:0};
    
    dirfrac.x = 1.0 / r.dir.x;
    dirfrac.y = 1.0 / r.dir.y;
    dirfrac.z = 1.0 / r.dir.z;
    // lb is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    // r.org is origin of ray
    let t1 = (lb.x - r.org.x)*dirfrac.x;
    let t2 = (rt.x - r.org.x)*dirfrac.x;
    let t3 = (lb.y - r.org.y)*dirfrac.y;
    let t4 = (rt.y - r.org.y)*dirfrac.y;
    let t5 = (lb.z - r.org.z)*dirfrac.z;
    let t6 = (rt.z - r.org.z)*dirfrac.z;
    
    let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    
    // if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
    if (tmax < 0)
    {
        t = tmax;
        return null;
    }
    
    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax)
    {
        t = tmax;
        return null;
    }
    
    t = tmin;
    return t;
  }
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
                  if(noise.simplex3(rx / 50., ry / 50.,rz/50.)>0.5){
                    this.data[x][y][z]=0;
                  }
                }else{
                  this.data[x][y][z]=0;
                }
                  
                
               
              }
              
          }
        } 
      }
      this.generated=true;
    }
    update(){
      this.meshgen=false;
    }
    genMesh(){
      if(!this.meshgen){
      this.cube.positions = [];
      this.cube.texcoords=[];
      this.cube.indices=[];
      this.cube.normals=[];
      for (let x = 0; x < CHSIZE; x++) {
        for (let y = 0; y < CHSIZE; y++) {
          for (let z = 0; z < CHSIZE; z++) {
            if(this.data[x][y][z]!=0){
              for (let s = 0; s < 6; s++) {
                let near=addDir(s,[x,y,z]);
                let block=this.getBlock(near[0],near[1],near[2]);
                if(block.isGlassBlock()){
                  this.cube.addAABBSide(s,x,y,z,x+1,y+1,z+1,this.getBlock(x,y,z).getTextureSide(s));
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
        if(this.data[x][y][z]!=0)return z;
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
    getBlockid(x,y,z){
      if(this.isIn(x)&&this.isIn(z)&&this.isIn(y)){
        return this.data[x][y][z];
      }else{
        //console.log([x,y,z]);
        return chman.getBlock((this.x*CHSIZE)+x,(this.y*CHSIZE)+y,(this.z*CHSIZE)+z);
        
      }
    }
    getBlock(x,y,z){
      
      return blockreg.getBlock(this.getBlockid(x,y,z));
    }
    
    getRay(from,to){
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
             
              let block=this.getBlock(x,y,z);
              if(!block.isGlassBlock()){
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
    hasAllNeighbours(){
      for (let i = 0; i < 6; i++) {
       let v=addDir(i,[this.x,this.y,this.z]);
       if(chman.getChunk(v[0],v[1],v[2])==null){
        
        return false;
        }
      }
      console.log(true);
      return true;
    }
  }
  
  function getOrSetNewMap(m,k){
    if(m.get(k)==null){
      m.set(k,new Map());
    }
    return(m.get(k));
  }
  noise.seed(Math.random());

  class ChunkManager {
    constructor(){
      this.chunks=new Map();
      this.pos=[0,0,0];
      this.loadlimit=1;
      this.loaded=0;
    }
    
    addChunk(c){
      let m=getOrSetNewMap(getOrSetNewMap(this.chunks,c.x),c.y);
      m.set(c.z,c);
    }
    getChunk(x,y,z){
      let mx=this.chunks.get(x);
      if(mx!=null){
        let my=mx.get(y);
        if(my!=null){
          return my.get(z);
        }
      }
      return null;
    }
    updateChunk(x,y,z){
      let c=this.getChunk(x,y,z);
      if(c!=null)c.update();
    }
    setBlock(x,y,z,i){
      let cx=Math.floor(x/CHSIZE);
      let cy=Math.floor(y/CHSIZE);
      let cz=Math.floor(z/CHSIZE);
      let c=null;
      c=this.getChunk(cx,cy,cz);
      if(c!=null){
        let rx=x-cx*CHSIZE;
        let ry=y-cy*CHSIZE;
        let rz=z-cz*CHSIZE;
        c.setBlock(rx,ry,rz,i);
        if(rx==0){
          this.updateChunk(cx-1,cy,cz);
        }
        if(ry==0){
          this.updateChunk(cx,cy-1,cz);
        }
        if(rz==0){
          this.updateChunk(cx,cy,cz-1);
        }
        if(rx==(CHSIZE-1)){
          this.updateChunk(cx+1,cy,cz);
        }
        if(ry==(CHSIZE-1)){
          this.updateChunk(cx,cy+1,cz);
        }
        
        if(rz==(CHSIZE-1)){
          this.updateChunk(cx,cy,cz+1);
        }

        
      }
      return c;
    }
    getBlock(x,y,z){
      let cx=Math.floor(x/CHSIZE);
      let cy=Math.floor(y/CHSIZE);
      let cz=Math.floor(z/CHSIZE);
      let c=null;
      c=this.getChunk(cx,cy,cz);
      if(c!=null){
        return c.getBlockid(x-cx*CHSIZE,y-cy*CHSIZE,z-cz*CHSIZE);
      }
      return null;
    }
    loadChunk(x,y,z){
      if(this.getChunk(x,y,z)==null){
        let c=new Chunk(x,y,z);
        c.cube.prog=cube.prog;
        c.cube.gh=16;
        c.cube.gw=16;
        c.cube.tex=texatlas;
        this.addChunk(c);
        //console.log([x,y,z]);
        return c;
      }
      
    }
    foreachChunk(x,y,z,d,f){
        
        for (let a = 0; a <d; a++) {
          for (let b = 0; b < a; b++) {
            for (let c = 0; c < b; c++) {
              f(x+ a-b,y+ b-c,z+ c);
              f(x-(a-b)+1,y+ b-c,z+ c);
              f(x-(a-b)+1,y- (b-c)+1,z+ c);
              
              f(x+ a-b,y- (b-c)+1,z+ c);

              f(x+ a-b,y- (b-c)+1,z- c-1);
              f(x+ a-b,y+ b-c,z- c-1);
              f(x-(a-b)+1,y+ b-c,z- c-1);
              f(x-(a-b)+1,y- (b-c)+1,z- c-1);
              /*
              f(1-x+a-b,1-b-c+y,c+b+z);
              f(x+a-b,1-b-c+y,c+b+z);
              
              f(x+a-b,b-c+y,1-c+b+z);
              f(1-x+a-b,b-c+y,1-c+b+z);
              
              f(1-x+a-b,1-b-c+y,1-c+b+z);
              f(x+a-b,1-b-c+y,1-c+b+z);
              */
          }
        }
      }
    }

    setPos(x,y,z){
      x=Math.round(x/CHSIZE);
      y=Math.round(y/CHSIZE);
      z=Math.round(z/CHSIZE);
      if(this.pos[0]!=x||this.pos[1]!=y||this.pos[2]!=z){
        this.pos=[x,y,z];
        
       
        
        //console.log(this.chunks);
      }
    }
    generate(x,y,z){
      let loaddistance=5;
      this.foreachChunk(this.pos[0],this.pos[1],this.pos[2],loaddistance,function(x,y,z){
        //chman.loadChunk(x,y,z).generate();
        console.log([x,y,z]);
      });
    }
    drawChunk(x,y,z,mvp){
      ch=this.getChunk(x,y,z);
      if(ch!=null){
        if(ch.generated){
          if(ch.meshgen){
            if(ch.updated){

            }else{
              if(ch.hasAllNeighbours()){
                ch.meshgen=false;
                ch.updated=true;
              }
            }
          }else{
            if(this.loaded<this.loadlimit){
              ch.genMesh();
              this.loaded++;
            }
            
          }
          
          if(ch.stored){
            
          }else{
            ch.storeMesh();
          }
          ch.draw(mat4.translate(mat4.create(),mvp,[x*CHSIZE,y*CHSIZE,z*CHSIZE]));
        }else{
          if(this.loaded<this.loadlimit){
          ch.generate();
          this.loaded++;
          }
        }
        
        
      }
    }
    draw(mvp){
      let renderdistance=5;
      this.foreachChunk(this.pos[0],this.pos[1],this.pos[2],renderdistance,function(x,y,z){
        chman.loadChunk(x,y,z);
        chman.drawChunk(x,y,z,mvp);
      });
      
    }
    getRay(from,to){
      var from =from;
      var to =to;
      var out=null;
      var d=1000000;
      this.foreachChunk(this.pos[0],this.pos[1],this.pos[2],4,function(x,y,z){
       let ch=chman.getChunk(x,y,z);
       if(ch!=null){
       let r=ch.getRay(from,to);
       if(r!=null){
        if(r[3]<d){
          d=r[3];
          hitchunk=ch;
          out=r;
        }
       }
      }
     });
     return out;
    }
    
  }
  var chman=new ChunkManager();
  

  var ch=new Chunk(0,0,0);
  ch.generate();
  ch.cube.prog=loadCubeShader();
  ch.cube.gh=16;
  ch.cube.gw=16;
 
  var texatlas=loadTexture("atlasmc.png"); 
  ch.cube.tex=texatlas;
  ch.genMesh();
  ch.storeMesh();
  var hitchunk=null;
  
  chman.setPos(0,0,0);
  chman.generate(0,0,0);
  function degToRad(d) {
    return d * Math.PI / 180;
  }
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
  
  function vec4tovec3(v){
    let c=v;
    c.pop();
    return c;
  }
  
  class Camera{
    constructor(){
      this.rot=[0,0,0];
      this.pos=[0,0,10];
      this.matrixprojection=mat4.create();
    }
    move(x,y,z){
      let matrot=mat4.rotate(mat4.create(),mat4.create(),degToRad(this.rot[1]),[0,1,0]);
      mat4.rotate(matrot,matrot,degToRad(this.rot[0]),[1,0,0]);
      mat4.rotate(matrot,matrot,degToRad(this.rot[2]),[0,0,1]);
      //console.log(matrot);
      let out=vec4tovec3(multiplyMatrixAndPoint(matrot,[x,y,z,1]));
      this.translate(out[0],out[1],out[2]);
      
    }
    rotate(x,y,z){
      this.rot=[Math.min(90,Math.max(-90.,this.rot[0]+x)),this.rot[1]+y,this.rot[2]+z];
    }
    setRotation(x,y,z){
      this.rot=[x,y,z];
    }
    setPosition(x,y,z){
      this.pos=[x,y,z];
    }
    translate(x,y,z){
      this.pos=[this.pos[0]+x,this.pos[1]+y,this.pos[2]+z];
    }
    getModelViewMatrix(){
      let matrixmodelview=mat4.create();
      mat4.translate(matrixmodelview,matrixmodelview,this.pos);

      mat4.rotate(matrixmodelview,matrixmodelview,degToRad(this.rot[1]),[0,1,0]);
      mat4.rotate(matrixmodelview,matrixmodelview,degToRad(this.rot[0]),[1,0,0]);
      mat4.rotate(matrixmodelview,matrixmodelview,degToRad(this.rot[2]),[0,0,1]);
      
      mat4.invert(matrixmodelview,matrixmodelview);
      return matrixmodelview;
    }
    getRay(){
      let rayeye=vec4tovec3(
        multiplyMatrixAndPoint(
          mat4.invert(mat4.create(),camera.matrixprojection),
          [gl_mx,gl_my,-1,1]));
      let raywor=vec3.normalize(vec3.create(),
      vec4tovec3(
        multiplyMatrixAndPoint(
          mat4.invert(mat4.create(),camera.getModelViewMatrix()),
          [rayeye[0],rayeye[1],-1,0])));
          return raywor;
    }
    getMVP(){
      
      let matrixmodelviewprojection=mat4.create();
      mat4.multiply(matrixmodelviewprojection,this.matrixprojection,this.getModelViewMatrix());
      return matrixmodelviewprojection;
    }
  }
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
 
  let maxfps=15;
  console.log( ch);
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
    if(keys[85]){
      let ch=chman.getChunk(chman.pos[0],chman.pos[1],chman.pos[2]);
      if(ch!=null){
        ch.meshgen=false;
        ch.stored=false;
      }
    }
    if(mbutton.get( 0)) {
      if(bpos!=null){
        let c=chman.setBlock(bpos[0],bpos[1],bpos[2],0);
        
        if(c!=null){
        c.genMesh();
        c.storeMesh();
        }
      }
    }
    if(mbutton.get(2)) {
      
    if(bpos!=null){
      console.log(bpos);
      let nb=vec3.add(vec3.create(),bpos,addDir(bpos[5]));
      let c=chman.setBlock(nb[0],nb[1],nb[2],1);
      if(c!=null){
        c.genMesh();
        c.storeMesh();
      }
    }
    }
    
    //let inverted=mat4.invert(mat4.create(),matrixmodelviewprojection);
    let mvp=camera.getMVP();
    
   


    bpos=chman.getRay(camera.pos,camera.getRay());
    if(bpos!=null){
      lines.draw(mat4.translate(mat4.create(),mvp,bpos));
      //let pts=rayaabbintersection(camera.pos,camera.getRay(),bpos,vec3.add(vec3.create(),bpos,[1,1,1]));
      
    }
    chman.setPos(camera.pos[0],camera.pos[1],camera.pos[2]);
    chman.loaded=0;
    chman.draw(mvp);
    //ch.draw(mvp);
    pointa.mat=mat4.translate(mat4.create(),mvp,vecpa);
    pointa.draw();
    
    
    //
    chair.draw();
    //chman.getChunk(0,0,0).cube.draw(mvp);
    
    //defaultBatch.draw(mvp);
    
    setTimeout(update, delay);
  }
  update();
  
}