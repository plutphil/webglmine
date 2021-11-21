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