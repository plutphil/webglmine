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
      //gl.uniform2f(this.locump,1.,1.);
      gl.uniform2f(this.locscr,gl.canvas.width,gl.canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(this.locv);
    }
  }