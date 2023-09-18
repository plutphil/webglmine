class Cube extends Model {
  init() {
    this.dims = 3;
    this.tex = null;
    this.gw = 1;
    this.gh = 1;

    this.mat = null;
    this.clear();
    this.col = [1, 1, 1, 1];
    //this.prog=shaders.getCubeShader();

    this.indiceslength = 0;
  }
  setShader(prog) {
    this.prog = prog;
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
  getAABB() {
    return this.aabbFromPoints(this.positions);
  }
  addTri(a, b, c, tca, tcb, tcc) {
    this.positions = this.positions.concat(a);
    this.positions = this.positions.concat(b);
    this.positions = this.positions.concat(c);
    this.texcoords = this.texcoords.concat(tca);
    this.texcoords = this.texcoords.concat(tcb);
    this.texcoords = this.texcoords.concat(tcc);
    let l = Math.floor(this.positions.length / this.dims);
    this.indices = this.indices.concat([l-3,l-2,l-1]);
    /*this.indices.push(l - 3);
    this.indices.push(l - 2);
    this.indices.push(l - 1);*/
  }
  addV(v) {
    this.positions.push(v[0]);
    this.positions.push(v[1]);
    this.positions.push(v[2]);
  }
  addTC(tc) {
    this.texcoords.push(tc[0]);
    this.texcoords.push(tc[1]);
  }
  addQuad2(a, b, c, d) {
    this.addV(a);
    this.addV(b);
    this.addV(c);
    this.addV(d);

    let l = Math.floor(this.positions.length / this.dims);
    /*
    this.texcoords=this.texcoords.concat(tca);
    this.texcoords=this.texcoords.concat(tcb);
    this.texcoords=this.texcoords.concat(tcc);
    this.texcoords=this.texcoords.concat(tcd);
    */
    this.indices.push(l - 3);
    this.indices.push(l - 4);
    this.indices.push(l - 2);

    this.indices.push(l - 2);
    this.indices.push(l - 4);
    this.indices.push(l - 1);


  }
  addTCQuad(tca, tcb, tcc, tcd) {
    this.addTC(tca);
    this.addTC(tcb);
    this.addTC(tcc);
    this.addTC(tcd);
  }
  addTCGridAtlas(texi) {
    let y = Math.floor(texi / this.gw);
    let x = texi - (y * this.gw);
    this.addTCQuad(
      [x, y],
      [x, y+1],
      [x+1, y+1],
      [x+1, y]
    );
  }
  addQuad(a, b, c, d) {
    this.addQuad2(a, b, c, d,
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    );
  }
  addQuadGrid(a, b, c, d) {

    this.addQuad2(a, b, c, d/*,
        [xs,ys],
        [xs,ye],
        [xe,ye],
        [xe,ys]*/
    );
  }
  addFlower(x, y, z, tex) {
    this.addQuadGrid(
      [x + 1, y + 1, z + 1],
      [x + 1, y, z + 1],
      [x, y, z],
      [x, y + 1, z]);

    this.addTCGridAtlas(tex);
    this.addQuadGrid(
      [x, y + 1, z],
      [x, y, z],
      [x + 1, y, z + 1],
      [x + 1, y + 1, z + 1]
    );
    this.addTCGridAtlas(tex);

    this.addQuadGrid(
      [x + 1, y + 1, z],
      [x + 1, y, z],
      [x, y, z + 1],
      [x, y + 1, z + 1]);

    this.addTCGridAtlas(tex);
    this.addQuadGrid(
      [x, y + 1, z + 1],
      [x, y, z + 1],
      [x + 1, y, z],
      [x + 1, y + 1, z]
    );
    this.addTCGridAtlas(tex);
  }
  addNormal(x, y, z) {
    this.normals.push(x);
    this.normals.push(y);
    this.normals.push(z);
  }
  add4Normal(x, y, z) {
    this.addNormal(x, y, z);
    this.addNormal(x, y, z);
    this.addNormal(x, y, z);
    this.addNormal(x, y, z);
  }
  addAABB(minx, miny, minz, maxx, maxy, maxz, texi) {
    let gy = Math.floor(texi / this.gw);
    let gx = texi - (gy * this.gw);
    this.addQuadGrid(
      [minx, maxy, minz],
      [minx, miny, minz],
      [maxx, miny, minz],
      [maxx, maxy, minz]


    );

    this.addQuadGrid(
      [maxx, maxy, maxz],
      [maxx, miny, maxz],
      [minx, miny, maxz],
      [minx, maxy, maxz]

    );
    this.addQuadGrid(
      [maxx, miny, maxz],

      [maxx, miny, minz],
      [minx, miny, minz],
      [minx, miny, maxz]
    );
    this.addQuadGrid(

      [maxx, maxy, minz],
      [maxx, maxy, maxz],
      [minx, maxy, maxz],
      [minx, maxy, minz]
    );
    this.addQuadGrid(
      [maxx, maxy, minz],
      [maxx, miny, minz],
      [maxx, miny, maxz],
      [maxx, maxy, maxz]


    );
    this.addQuadGrid(
      [minx, maxy, maxz],
      [minx, miny, maxz],

      [minx, miny, minz],
      [minx, maxy, minz]
    );
    this.addTCGridAtlas(texi);
    this.addTCGridAtlas(texi);
    this.addTCGridAtlas(texi);
    this.addTCGridAtlas(texi);
    this.addTCGridAtlas(texi);
    this.addTCGridAtlas(texi);
  }
  addAABBSide(side, minx, miny, minz, maxx, maxy, maxz, texi) {
    //
    switch (side) {
      case 5:
        this.addQuadGrid(
          [minx, maxy, minz],
          [minx, miny, minz],
          [maxx, miny, minz],
          [maxx, maxy, minz]
        );
        this.addTCGridAtlas(texi);
        this.add4Normal(0, 0, -1);
        break;
      case 4:
        this.addQuadGrid(
          [maxx, maxy, maxz],
          [maxx, miny, maxz],
          [minx, miny, maxz],
          [minx, maxy, maxz]
        );
        this.addTCGridAtlas(texi);
        this.add4Normal(0, 0, 1);
        break;
      case 3:
        this.addQuadGrid(
          [maxx, miny, maxz],
          [maxx, miny, minz],
          [minx, miny, minz],
          [minx, miny, maxz]
        );
        this.addTCGridAtlas(texi);
        //this.addNormal(0,-1,0,4);
        this.add4Normal(0, -1, 0);
        break;
      case 2:
        this.addQuadGrid(

          [maxx, maxy, minz],
          [maxx, maxy, maxz],
          [minx, maxy, maxz],
          [minx, maxy, minz]
        );
        this.addTCGridAtlas(texi);
        //this.addNormal(0,1,0,4);
        this.add4Normal(0, 1, 0);
        break;
      case 0:
        this.addQuadGrid(
          [maxx, maxy, minz],
          [maxx, miny, minz],
          [maxx, miny, maxz],
          [maxx, maxy, maxz]
        );
        this.addTCGridAtlas(texi);
        //this.addNormal(1,0,0,4);
        this.add4Normal(1, 0, 0);
        break;
      case 1:
        this.addQuadGrid(
          [minx, maxy, maxz],
          [minx, miny, maxz],

          [minx, miny, minz],
          [minx, maxy, minz]
        );
        this.addTCGridAtlas(texi);
        //this.addNormal(-1,0,0,4);
        this.add4Normal(-1, 0, 0);
        break;

      default:
        break;
    }
  }
  clear() {
    this.positions = [];
    this.normals = [];
    this.texcoords = [];
    this.indices = [];
  }
  store() {
    //console.log("pos l:",this.positions.length/3);
    //console.log("tc l:",this.texcoords.length/2);

    //console.log("ind l:",this.indices.length/3);


    if (this.vbuffer) {
      if (this.tcbuffer) {
        if (this.ibuffer) {
          if (this.nbuffer) {
            if (this.oldsize < this.indices.length) {
              gl.deleteBuffer(this.vbuffer);
              gl.deleteBuffer(this.tcbuffer);
              gl.deleteBuffer(this.ibuffer);
              gl.deleteBuffer(this.nbuffer);
            } else {
              gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Uint8Array(this.positions));

              gl.bindBuffer(gl.ARRAY_BUFFER, this.tcbuffer);
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Uint8Array(this.texcoords));

              gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Int8Array(this.normals));

              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer);
              gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(this.indices));
              this.oldsize = this.indices.length;
              return;


            }
          }
        }
      }
    }


    this.vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(this.positions), gl.STATIC_DRAW);
    this.tcbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tcbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(this.texcoords), gl.STATIC_DRAW);
    this.nbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int8Array(this.normals), gl.STATIC_DRAW);
    this.ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    this.oldsize = this.indices.length;

    //console.log(this);
  }
  draw(mvp) {
    gl.useProgram(this.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
    //console.log(this.locv, this.locnorm, this.loctc)
    gl.vertexAttribPointer(
      this.locv,
      3,
      gl.UNSIGNED_BYTE,
      false,
      0,
      0);

    gl.enableVertexAttribArray(this.locv);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
    gl.vertexAttribPointer(
      this.locnorm,
      3,
      gl.BYTE,
      false,
      0,
      0);

    gl.enableVertexAttribArray(this.locnorm);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tcbuffer);
    gl.vertexAttribPointer(
      this.loctc,
      2,
      gl.UNSIGNED_BYTE,
      false,
      0,
      0);

    gl.enableVertexAttribArray(this.loctc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer);
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

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(this.locv);
    gl.disableVertexAttribArray(this.tcbuffer);
  }
}