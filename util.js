const CHSIZE=16;
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
    image.addEventListener('load', function(e) {
		console.log(e);
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
  function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();
  
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
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
  function vec4tovec3(v){
    let c=v;
    c.pop();
    return c;
  }
   class Model{
    constructor() {
      this.init();
    }
    init(){}
    draw(mvp){

    }
  }
  function degToRad(d) {
    return d * Math.PI / 180;
  }
  function getOrSetNewMap(m,k){
    if(m.get(k)==null){
      m.set(k,new Map());
    }
    return(m.get(k));
  }