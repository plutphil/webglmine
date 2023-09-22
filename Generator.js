class Generator {
    constructor() {
        this.hmap = new Map();
    }
    generateHMapAt(rx,rz){
        /*const freq = 50.;
        const amp = 5.;
        return Math.round(noise.simplex2(rx / freq, rz / freq) * amp + amp)*/

        
        noise.seed(71203);
        //const freq_freq = 510.;
        //const freq_amp = 50.;
        //const freq = noise.simplex2(rx / freq_freq, rz / freq_freq)*freq_amp;
        const freq = 50.;
        noise.seed(712312);
        const amp_freq = 500.;
        const amp_amp = 50.;
        
        const amp =noise.simplex2(rx / amp_freq, rz / amp_freq)*amp_amp

        noise.seed(123132);
        return Math.round(noise.simplex2(rx / freq, rz / freq) * amp + amp)
    }
    getHMap(x,z){
        if(x in this.hmap){
            if(!(z in this.hmap[x])){
                this.hmap[x][z]=this.generateHMapAt(x,z);
            }
        }else{
            this.hmap[x]={};
            this.hmap[x][z]=this.generateHMapAt(x,z);
        }
        return this.hmap[x][z];
    }
    generateChunk(ch) {
        let rx = 0;
        //let ry = 0;
        let rz = 0;
        if (!ch.generated) {
            for (let x = 0; x < CHSIZE; x++) {
                rx = x + (ch.x * CHSIZE);
                for (let z = 0; z < CHSIZE; z++) {
                    rz = z + (ch.z * CHSIZE);
                    let val = this.getHMap(rx,rz);
                    for (let y = 0; y < CHSIZE; y++) {
                        let ry = y + (ch.y * CHSIZE);
                        if (ry <= val) {
                            if (ry < val) {
                                ch.setblock(x, y, z, 2)
                            } else {
                                ch.setblock(x, y, z, 1);
                            }

                        } else {
                            if (ry == val + 1) {
                                if (Math.random() < 0.01)
                                    //this.data[x][y][z]=7;
                                    ch.setblock(x, y, z, 7)
                            } else {
                                ch.setblock(x, y, z, 0)
                                continue;
                            }
                        }
                        /*if (noise.simplex3(rx / 50., ry / 50., rz / 50.) > 0.5) {
                            ch.setblock(x, y, z, 0)
                        }*/
                        if(ry<0){
                            ch.setblock(x,y,z,5);
                        }


                    }

                }
            }
            ch.generated = true;
        }
    }
}