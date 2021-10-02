import * as math from 'mathjs';
import {range} from 'lodash';
const noise = require('simplenoise');

class PerlinMatrix {
    // Number of nodes in the grid
    GRID_SIZE;
    // Lower number = noisier
    NOISE_FACTOR;
    NOISE_STEP_SIZE;
    constructor(GRID_SIZE, NOISE_FACTOR, NOISE_STEP_SIZE) {
        this.GRID_SIZE = GRID_SIZE;
        this.NOISE_FACTOR = NOISE_FACTOR;
        this.NOISE_STEP_SIZE = NOISE_STEP_SIZE;
    }

    buildPerlinMatrix3D = () => {
        // Init matrix
        const coords = math.zeros([this.GRID_SIZE,this.GRID_SIZE]);

        // Seed noise
        noise.seed(Math.random());

        const STEP_SIZE = 2/this.GRID_SIZE;

        const xCoords = range(-1,1 + STEP_SIZE, STEP_SIZE);
        const yCoords = range(-1,1 + STEP_SIZE, STEP_SIZE);

        return math.map(coords, (e, i) => {
            const x = xCoords[i[0]];
            const y = yCoords[i[1]];
            const z = noise.perlin2((i[0]/this.NOISE_FACTOR), i[1]/this.NOISE_FACTOR);
            return {x,y,z,};
        })
    };

    shiftNoiseX = (coords, step) => {
        return math.map(coords, (c, i) => {
            const x = c.x;
            const y = c.y;
            const z = noise.perlin2((i[0]/this.NOISE_FACTOR) - (this.NOISE_STEP_SIZE * step), i[1]/this.NOISE_FACTOR);
            return {x,y,z};
        });
    };

    shiftNoiseY = (coords, step) => {
        return math.map(coords, (c, i) => {
            const x = c.x;
            const y = c.y;
            const z = noise.perlin2(i[0]/this.NOISE_FACTOR, (i[1]/this.NOISE_FACTOR) - (this.NOISE_STEP_SIZE * step));
            return {x,y,z};
        });
    };

    shiftNoiseXY = (coords, step) => {
        return math.map(coords, (c, i) => {
            const x = c.x;
            const y = c.y;
            const z = noise.perlin2(
                (i[0]/this.NOISE_FACTOR),
                (i[1]/this.NOISE_FACTOR) + (this.NOISE_STEP_SIZE * step)
            );
            return {x,y,z};
        });
    };

    forEachRow = (matrix, callback) => {
        const len = math.size(matrix)[1];
        for(let i = 0; i < len; i++){
            const row = math.row(matrix, i);
            callback(row[0]);
        }
    };

    forEachCol = (matrix, callback) => {
        const len = math.size(matrix)[1];
        for(let i = 0; i < len; i++){
            const col = math.column(matrix, i);
            callback(col.flat());
        }
    };
}






export {PerlinMatrix};