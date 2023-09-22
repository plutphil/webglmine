TEXTUREATLASGRIDWIDTH = 16;
class ChunkMesh {
    constructor() {
        this.clear()
    }
    convert(){
        this.positions = new Uint8Array(this.positions);
        this.normals = new Int8Array(this.normals);
        this.texcoords = new Uint8Array(this.texcoords);
        this.indices = new Uint16Array(this.indices);
    }
    clear() {
        this.positions = [];
        this.normals = [];
        this.texcoords = [];
        this.indices = [];
    }
    addV(v) {
        this.positions.push(v[0]);
        this.positions.push(v[1]);
        this.positions.push(v[2]);
    }
    addQuadGrid(a, b, c, d) {
        this.addV(a);
        this.addV(b);
        this.addV(c);
        this.addV(d);

        let l = Math.floor(this.positions.length /3);
        this.indices.push(l - 3);
        this.indices.push(l - 4);
        this.indices.push(l - 2);

        this.indices.push(l - 2);
        this.indices.push(l - 4);
        this.indices.push(l - 1);
    }
    addTC(tc) {
        this.texcoords.push(tc[0]);
        this.texcoords.push(tc[1]);
    }
    addTCQuad(tca, tcb, tcc, tcd) {
        this.addTC(tca);
        this.addTC(tcb);
        this.addTC(tcc);
        this.addTC(tcd);
    }
    addTCGridAtlas(texi) {
        let y = Math.floor(texi /TEXTUREATLASGRIDWIDTH);
        let x = texi - (y * TEXTUREATLASGRIDWIDTH);
        this.addTCQuad(
            [x, y],
            [x, y + 1],
            [x + 1, y + 1],
            [x + 1, y]
        );
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
}