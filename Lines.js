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