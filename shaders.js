
class Shaders {
	getCubeShader() {
		if (this.cubeshader == null) {

			function loadCubeShader() {
				const vsrc = `
	
	uniform mat4 u_matrix;
	attribute vec4 aVertexPosition;
	attribute vec2 a_texcoord;
	attribute vec3 a_normal;

	uniform vec4 pointlight_pos;
	uniform vec3 pointlight_color;
	
	uniform vec3 dirlight_color;
	uniform vec3 dirlight_dir;
	
	varying vec2 vTextureCoord;
	varying vec3 vNormCord; 
	varying vec3 color;
	
	void main() {
	  
	  float l=dot(a_normal,normalize( 	vec3(0.3,1.,1.)));
	  //float d=distance(aVertexPosition.xyz,vec3(4,5,6));
	  //float maxd=5.1;
	  //l=max(l,d<maxd?1.-(d/maxd):0.);
	  //float add=0.5;
	  //l=add+(1.-add)*l;
	  vNormCord=a_normal;
	  vTextureCoord=a_texcoord/16.;
	  vec4 pos = u_matrix*aVertexPosition;
	  color=pointlight_color*max(0.,1.-distance(pos.xyz,pointlight_pos.xyz)/pointlight_pos.w);
	  gl_Position = pos;
	}
		  `;

				const fsrc = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec2 vTextureCoord;
uniform sampler2D u_texture;
uniform vec4 u_color;
varying vec3 vNormCord;

varying vec3 color;
void main() {
	vec4 texColor= texture2D(u_texture,vTextureCoord);
	if(texColor.a < 0.1)
        discard;
	//texColor=vec4(texColor.rgb*dot(vNormCord,vec3(1.,-1.,1.)),texColor.a);
  	gl_FragColor = vec4(texColor.xyz,texColor.a);//texture2D(uSampler,vTextureCoord)+vec4(vTextureCoord, 1.0, 1.0);
}
		  `;

				let prog = loadProgram(
					vsrc, fsrc
				);
				return prog;
			}

			this.cubeshader = loadCubeShader();
		}
		return this.cubeshader;
	}
}