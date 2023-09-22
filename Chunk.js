class Chunk extends Model {
  constructor(x, y, z) {
    super();
    this.neighbours = new Array(6);
    let data=null;

    //this.cube = new Cube();
    //this.cube.enabled = true;
    this.cube = new ChunkMesh();
    this.data = data;
    this.enabled = false;
    this.meshgen = false;
    this.generated = false;
    this.stored = false;
    this.updated = false;
    this.empty = true;
    if (x != null) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    this.structures = [];
  }
  initdata(){
    this.data = new Uint8Array(CHSIZE * CHSIZE * CHSIZE);
  }
  getblock(x, y, z) {
    if(this.empty)return 0;
    return this.data[x * CHSIZE * CHSIZE + y * CHSIZE + z];
  }
  setblock(x, y, z, i) {
    
    if(this.data==null){
      if(i!=0){
        this.initdata();
        this.empty = false;
      }
      return;
    }
    this.data[x * CHSIZE * CHSIZE + y * CHSIZE + z] = i;
  }
  update() {
    this.meshgen = false;
  }
  genMesh(chman) {
    if (!this.meshgen) {
      this.cube.clear();
      for (let x = 0; x < CHSIZE; x++) {
        for (let y = 0; y < CHSIZE; y++) {
          for (let z = 0; z < CHSIZE; z++) {
            if (this.getblock(x, y, z) != 0) {
              let b = this.getBlock(x, y, z, chman);
              if (b.isCustomBlock()) {
                this.cube.addFlower(x, y, z, b.tex);
              } else {
                for (let s = 0; s < 6; s++) {
                  let near = addDir(s, [x, y, z]);
                  let block = this.getBlock(near[0], near[1], near[2], chman);
                  if (block.isGlassBlock()) {
                    this.cube.addAABBSide(s, x, y, z, x + 1, y + 1, z + 1, b.getTextureSide(s));
                  }
                }
              }
            }

          }
        }
      }
      this.empty = this.cube.positions.length == 0;
      this.meshgen = true;
      this.stored = false;
      this.cube.convert();
    }

  }
  storeMesh() {
    //this.cube.enabled=false;
    //this.cube.store();
    this.stored = true;
    //this.cube.enabled=true;
  }
  isIn(x) {
    return (x >= 0) && (x < CHSIZE);
  }
  getHeighest(x, z) {
    if (this.isIn(x) && this.isIn(z))
      for (let y = CHSIZE - 1; y >= 0; y--) {
        if (this.data[x][y][z] != 0) return y;
      }
    return -1;
  }
  setBlock(x, y, z, i) {
    if (this.isIn(x) && this.isIn(z) && this.isIn(y)) {
      this.setblock(x, y, z, i);
    }
    this.meshgen = false;
    this.stored = false;
  }
  getBlockid(x, y, z, chman) {
    if (this.isIn(x) && this.isIn(z) && this.isIn(y)) {
      return this.getblock(x, y, z);
    } else {
      //console.log([x,y,z]);
      return chman.getBlock((this.x * CHSIZE) + x, (this.y * CHSIZE) + y, (this.z * CHSIZE) + z);

    }
  }
  getBlock(x, y, z, chman) {
    return chman.blockreg.getBlock(this.getBlockid(x, y, z, chman));
  }

  getRay(from, to, chman) {
    if(this.empty)return null;
    if (this.cube.positions.length == 0) { return null; }
    let pos = [this.x * CHSIZE, this.y * CHSIZE, this.z * CHSIZE];
    if (rayaabb(from, to, pos, vec4.add(vec3.create(), pos, [CHSIZE, CHSIZE, CHSIZE]))) {
      this.cube.col = [1, 1, 1, 1];
      let out = null;
      let dst = 1000000;
      let tmin = null;
      for (let x = 0; x < CHSIZE; x++) {
        for (let y = 0; y < CHSIZE; y++) {
          for (let z = 0; z < CHSIZE; z++) {

            let block = this.getBlock(x, y, z, chman);
            if (block.id != 0) {
              let bpos = vec3.add(vec3.create(), pos, [x, y, z]);
              let d = rayaabb(from, to, bpos, vec3.add(vec3.create(), bpos, [1, 1, 1]));
              if (d != null) {
                if (d < dst) {
                  out = [bpos[0], bpos[1], bpos[2], d, this, -1];
                  dst = d;
                  tmin = d;

                }
              }
            }

          }
        }
      }
      if (out != null) {
        let hit = [from[0] + to[0] * tmin, from[1] + to[1] * tmin, from[2] + to[2] * tmin];
        function eq(a, b, off = 0.0001) {
          return a > (b - off) && a < (b + off);
        }
        let relhit = [hit[0] - out[0], hit[1] - out[1], hit[2] - out[2]];
        let side = 0;
        if (eq(relhit[0], 1)) {
          side = 0;
        } else if (eq(relhit[0], 0)) {
          side = 1;
        }
        else if (eq(relhit[1], 1)) {
          side = 2;
        }
        else if (eq(relhit[1], 0)) {
          side = 3;
        }
        else if (eq(relhit[2], 1)) {
          side = 4;
        }
        else if (eq(relhit[2], 0)) {
          side = 5;
        }
        out[5] = side;
      }
      return out;


    }
    return null;


  }
  draw(mvp) {
    //this.cube.draw(mvp);
  }
  hasAllNeighbours(chman) {
    for (let i = 0; i < 6; i++) {
      let v = addDir(i, [this.x, this.y, this.z]);
      if (chman.getChunk(v[0], v[1], v[2]) == null) {

        return false;
      }
    }
    //console.log(true);
    return true;
  }
}