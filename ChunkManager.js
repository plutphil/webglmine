class ChunkManager {
  constructor() {
    this.chunks = new Map();
    this.pos = [0, 0, 0];
    this.loadlimit = 2;
    this.loaded = 0;
    this.cube = undefined;
    this.blockreg = undefined;
    this.drawlist = [];
    this.blockcache = [];
    this.blockcache2 = [];
  }

  addChunk(c) {
    let m = getOrSetNewMap(getOrSetNewMap(this.chunks, c.x), c.y);
    m.set(c.z, c);
  }
  getChunk(x, y, z) {
    let mx = this.chunks.get(x);
    if (mx != null) {
      let my = mx.get(y);
      if (my != null) {
        return my.get(z);
      }
    }
    return null;
  }
  updateChunk(x, y, z) {
    let c = this.getChunk(x, y, z);
    if (c != null) c.update();
  }
  setBlock(x, y, z, i) {
    let cx = Math.floor(x / CHSIZE);
    let cy = Math.floor(y / CHSIZE);
    let cz = Math.floor(z / CHSIZE);
    let c = null;
    c = this.getChunk(cx, cy, cz);
    this.blockcache2 = [];
    if (c != null) {
      let rx = x - cx * CHSIZE;
      let ry = y - cy * CHSIZE;
      let rz = z - cz * CHSIZE;
      c.setBlock(rx, ry, rz, i);
      if (rx == 0) {
        this.updateChunk(cx - 1, cy, cz);
      }
      if (ry == 0) {
        this.updateChunk(cx, cy - 1, cz);
      }
      if (rz == 0) {
        this.updateChunk(cx, cy, cz - 1);
      }
      if (rx == (CHSIZE - 1)) {
        this.updateChunk(cx + 1, cy, cz);
      }
      if (ry == (CHSIZE - 1)) {
        this.updateChunk(cx, cy + 1, cz);
      }

      if (rz == (CHSIZE - 1)) {
        this.updateChunk(cx, cy, cz + 1);
      }


    }
    return c;
  }
  getBlock(x, y, z) {
    const cx = Math.floor(x / CHSIZE);
    const cy = Math.floor(y / CHSIZE);
    const cz = Math.floor(z / CHSIZE);
    const c = this.getChunk(cx, cy, cz);

    if (c != null) {
      const id = c.getBlockid(x - cx * CHSIZE, y - cy * CHSIZE, z - cz * CHSIZE);
      return id;
    }
    return null;
  }
  getBlockCached2(x, y, z) {
    for (let i = 0; i < this.blockcache2.length; i++) {
      let e = this.blockcache2[i];
      if (e[0] == x && e[1] == y && e[2] == z) {
        return e[3];
      }
    }
    const cx = Math.floor(x / CHSIZE);
    const cy = Math.floor(y / CHSIZE);
    const cz = Math.floor(z / CHSIZE);
    const c = this.getChunk(cx, cy, cz);

    if (c != null) {
      const id = c.getBlockid(x - cx * CHSIZE, y - cy * CHSIZE, z - cz * CHSIZE);
      if (this.blockcache2.length > 100) {
        this.blockcache2 = [];
        console.log("cleared block cache2");
      }
      this.blockcache2.push([x, y, z, id]);
      return id;
    }
    return null;
  }
  loadChunk(x, y, z) {
    let ch = this.getChunk(x, y, z);
    if (ch == null) {
      let c = new Chunk(x, y, z);
      return this.loadch(c);
    }
    return ch;
  }
  loadch(c) {
    c.cube.setShader(this.cube.prog);
    c.cube.gh = 16;
    c.cube.gw = 16;
    c.cube.tex = this.cube.tex;
    this.addChunk(c);
    //console.log([x,y,z]);
    return c;
  }
  foreachChunk(x, y, z, d, f) {

    for (let a = 0; a < d; a++) {
      for (let b = 0; b < a; b++) {
        for (let c = 0; c < b; c++) {
          f(x + a - b, y + b - c, z + c, this);
          f(x - (a - b) + 1, y + b - c, z + c, this);
          f(x - (a - b) + 1, y - (b - c) + 1, z + c, this);

          f(x + a - b, y - (b - c) + 1, z + c, this);

          f(x + a - b, y - (b - c) + 1, z - c - 1, this);
          f(x + a - b, y + b - c, z - c - 1, this);
          f(x - (a - b) + 1, y + b - c, z - c - 1, this);
          f(x - (a - b) + 1, y - (b - c) + 1, z - c - 1, this);
          /*
          f(1-x+a-b,1-b-c+y,c+b+z);
          f(x+a-b,1-b-c+y,c+b+z);
          
          f(x+a-b,b-c+y,1-c+b+z);
          f(1-x+a-b,b-c+y,1-c+b+z);
          
          f(1-x+a-b,1-b-c+y,1-c+b+z);
          f(x+a-b,1-b-c+y,1-c+b+z);
          */
        }
      }
    }
  }

  setPos(x, y, z) {
    x = Math.round(x / CHSIZE);
    y = Math.round(y / CHSIZE);
    z = Math.round(z / CHSIZE);


    let renderdistance = 8;
    if (this.pos[0] != x || this.pos[1] != y || this.pos[2] != z) {
      this.pos = [x, y, z];
      this.drawlist = [];
      //console.log(this.chunks);
      this.foreachChunk(this.pos[0], this.pos[1], this.pos[2], renderdistance, function (x, y, z, chman) {
        chman.drawlist.push(chman.loadChunk(x, y, z))
      });
    }
  }
  generate(x, y, z) {
    let loaddistance = 10;
    this.foreachChunk(this.pos[0], this.pos[1], this.pos[2], loaddistance, function (x, y, z, chman) {
      let ch = chman.loadChunk(x, y, z);
      ch.generate();
      //console.log([x,y,z]);
      chman.drawlist.push(ch);
    });
  }
  drawChunk(ch, mvp) {
    if (ch != null) {
      if (ch.generated) {
        if (ch.meshgen) {
          if (ch.updated) {

          } else {
            if (ch.hasAllNeighbours(this)) {
              ch.meshgen = false;
              ch.updated = true;
            } else {
              this.loadChunk(ch.x + 1, ch.y, ch.z);
              this.loadChunk(ch.x - 1, ch.y, ch.z);
              this.loadChunk(ch.x, ch.y + 1, ch.z);
              this.loadChunk(ch.x, ch.y - 1, ch.z);
              this.loadChunk(ch.x, ch.y, ch.z + 1);
              this.loadChunk(ch.x, ch.y, ch.z - 1);

            }
          }
        } else {
          if (this.loaded < this.loadlimit) {
            var t0 = performance.now()

            ch.genMesh(this);

            var t1 = performance.now()
            //console.log("genmesh " + (t1 - t0) + " milliseconds.")
            this.loaded++;
          }

        }

        if (ch.stored) {

        } else {

          var t0 = performance.now()
          ch.storeMesh();
          var t1 = performance.now()
          //console.log("stor " + (t1 - t0) + " milliseconds.")
        }
        ch.draw(mat4.translate(mat4.create(), mvp, [ch.x * CHSIZE, ch.y * CHSIZE, ch.z * CHSIZE]));
      } else {
        if (this.loaded < this.loadlimit) {
          if (!ch.generated) {
            var t0 = performance.now()
            ch.generate();
            var t1 = performance.now()
            //console.log("genwor " + (t1 - t0) + " milliseconds.")
          }
          this.loaded++;
        }
      }


    }
  }
  draw(mvp) {
    for (let i = 0; i < this.drawlist.length; i++) {
      //this.loadch(this.drawlist[i]);
      this.drawChunk(this.drawlist[i], mvp);
    }
  }
  getRay(from, to) {
    var from = from;
    var to = to;
    var out = null;
    var d = 1000000;
    for (let i = 0; i < this.drawlist.length; i++) {
      let ch = this.drawlist[i];
      let r = ch.getRay(from, to, chman);
      if (r != null) {
        if (r[3] < d) {
          d = r[3];
          let hitchunk = ch;
          out = r;
        }
      }

    }

    return out;
  }

}