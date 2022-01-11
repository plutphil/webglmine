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
    getRay(gl_mx,gl_my){
      let rayeye=vec4tovec3(
        multiplyMatrixAndPoint(
          mat4.invert(mat4.create(),this.matrixprojection),
          [gl_mx,gl_my,-1,1]));
      let raywor=vec3.normalize(vec3.create(),
      vec4tovec3(
        multiplyMatrixAndPoint(
          mat4.invert(mat4.create(),this.getModelViewMatrix()),
          [rayeye[0],rayeye[1],-1,0])));
          return raywor;
    }
    getMVP(){
      
      let matrixmodelviewprojection=mat4.create();
      mat4.multiply(matrixmodelviewprojection,this.matrixprojection,this.getModelViewMatrix());
      return matrixmodelviewprojection;
    }
  }