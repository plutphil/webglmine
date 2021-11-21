
class Shaders{
getCubeShader(){
  if(this.cubeshader==null){
	
	function loadCubeShader(){  
	  const vsrc=`
	
	uniform mat4 u_matrix;
	attribute vec4 aVertexPosition;
	attribute vec2 a_texcoord;
	varying vec2 vTextureCoord;
	//varying vec3 vNormCord;
	void main() {
	  gl_Position = u_matrix*aVertexPosition;
	  
	  //float l=dot(a_normal,normalize( 	vec3(0.3,1.,1.)))-0.2;
	  //float d=distance(aVertexPosition.xyz,vec3(4,5,6));
	  //float maxd=5.1;
	  //l=max(l,d<maxd?1.-(d/maxd):0.);
	  //float add=0.5;
	  //l=add+(1.-add)*l;
	  //vNormCord=vec3(l);
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
//varying vec3 vNormCord;
void main() {
  gl_FragColor = u_color*vec4(texture2D(u_texture,vTextureCoord));//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
}
		  `;	
		  
		  let prog=loadProgram(
			vsrc,fsrc
		  );
			return prog;
		}
  
	this.cubeshader=loadCubeShader();
  }
  return this.cubeshader;
}
}