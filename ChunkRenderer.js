const GPUMesh=()=>{
    return {
        vbuffer:null,
        tcbuffer:null,
        ibuffer:null,
        nbuffer:null,
        oldsize:0,
        indicieslength:0
    }
}
class ChunkRenderer {
    constructor(shaderprogram, tex) {
        console.log(shaderprogram,tex)
        this.prog = shaderprogram;
        this.tex = tex;
        this.col = [1, 1, 1, 1];
    }
    store(chmesh, gpumesh) {
        if (gpumesh.vbuffer) {
            if (gpumesh.tcbuffer) {
                if (gpumesh.ibuffer) {
                    if (gpumesh.nbuffer) {
                        if (gpumesh.oldsize < chmesh.indices.length) {
                            gl.deleteBuffer(gpumesh.vbuffer);
                            gl.deleteBuffer(gpumesh.tcbuffer);
                            gl.deleteBuffer(gpumesh.ibuffer);
                            gl.deleteBuffer(gpumesh.nbuffer);
                        } else {
                            gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.vbuffer);
                            gl.bufferSubData(gl.ARRAY_BUFFER, 0, chmesh.positions);

                            gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.tcbuffer);
                            gl.bufferSubData(gl.ARRAY_BUFFER, 0, chmesh.texcoords);

                            gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.nbuffer);
                            gl.bufferSubData(gl.ARRAY_BUFFER, 0, chmesh.normals);

                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpumesh.ibuffer);
                            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, chmesh.indices);
                            gpumesh.oldsize = chmesh.indices.length;
                            return;


                        }
                    }
                }
            }
        }


        gpumesh.vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chmesh.positions, gl.STATIC_DRAW);
        gpumesh.tcbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.tcbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chmesh.texcoords, gl.STATIC_DRAW);
        gpumesh.nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chmesh.normals, gl.STATIC_DRAW);
        gpumesh.ibuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpumesh.ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, chmesh.indices, gl.STATIC_DRAW);
        gpumesh.oldsize = chmesh.indices.length;
        gpumesh.indicieslength = chmesh.indices.length;
    }
    setattributes() {
        this.locv = gl.getAttribLocation(this.prog, "aVertexPosition");
        this.loctc = gl.getAttribLocation(this.prog, "a_texcoord");
        this.locnorm = gl.getAttribLocation(this.prog, "a_normal");

        this.locmat = gl.getUniformLocation(this.prog, "u_matrix");
        this.loctex = gl.getUniformLocation(this.prog, "u_texture");
        this.loccol = gl.getUniformLocation(this.prog, "u_color");

        this.unipointlight_pos = gl.getUniformLocation(this.prog, "pointlight_pos");
        this.unipointlight_color = gl.getUniformLocation(this.prog, "pointlight_color");
        this.unidirlight_color = gl.getUniformLocation(this.prog, "dirlight_color");
        this.unidirlight_dir = gl.getUniformLocation(this.prog, "dirlight_dir");
    }
    draw(gpumesh, mvp) {
        gl.useProgram(this.prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.vbuffer);
        //console.log(this.locv, this.locnorm, this.loctc)
        gl.vertexAttribPointer(
            this.locv,
            3,
            gl.UNSIGNED_BYTE,
            false,
            0,
            0);

        gl.enableVertexAttribArray(this.locv);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.nbuffer);
        gl.vertexAttribPointer(
            this.locnorm,
            3,
            gl.BYTE,
            false,
            0,
            0);

        gl.enableVertexAttribArray(this.locnorm);

        gl.bindBuffer(gl.ARRAY_BUFFER, gpumesh.tcbuffer);
        gl.vertexAttribPointer(
            this.loctc,
            2,
            gl.UNSIGNED_BYTE,
            false,
            0,
            0);

        gl.enableVertexAttribArray(this.loctc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpumesh.ibuffer);
        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positions.length/3);
        //console.log(mvp);
        gl.uniformMatrix4fv(this.locmat, false, mvp);

        gl.uniform1i(this.loctex, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform4f(this.loccol, this.col[0], this.col[1], this.col[2], this.col[3]);

        gl.uniform4fv(this.unipointlight_pos, new Float32Array([0., 0, 0., 30.]));
        gl.uniform3fv(this.unipointlight_color, new Float32Array([1, 1, 1]));
        gl.uniform3fv(this.unidirlight_dir, new Float32Array([1, 1, 1]));
        gl.uniform3fv(this.unidirlight_color, new Float32Array([1, 1, 1]));

        gl.drawElements(gl.TRIANGLES, gpumesh.indicieslength, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(this.locv);
        gl.disableVertexAttribArray(this.tcbuffer);
    }
}