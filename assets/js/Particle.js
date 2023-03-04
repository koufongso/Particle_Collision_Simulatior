const PRECISION = 1e-3;

class Particle {
    constructor(coord, velocity, accel, mass, radius, color) {
        // coordinate
        this.x = coord[0];
        this.y = coord[1];
        this.z = coord[2];

        // velocity
        this.vx = velocity[0];
        this.vy = velocity[1];
        this.vz = velocity[2];

        // acceleration
        this.ax = accel[0];
        this.ay = accel[1];
        this.az = accel[2];

        // other properties
        this.m = mass;
        this.r = radius;
        this.c = color;
        this.count = 0;     // hit count
    }

    /**
     * Calculte the time to hit the other particle under constant/zero acceleration
     * Reference:https://en.wikipedia.org/wiki/Quartic_function
     * @param {Particle} that other particle object
     */
    timeToHit(that) {
        const dp = [this.x - that.x, this.y - that.y, this.z - that.z];
        const sigma = this.r + that.r;

        // (high chance) to avoid the error due to small computation/rounding error
        if (Math.abs(dp[0] * dp[0] + dp[1] * dp[1] + dp[2] * dp[2] - sigma * sigma) < PRECISION) return Infinity;

        const da = [this.ax - that.ax, this.ay - that.ay, this.az - that.az];
        const dv = [this.vx - that.vx, this.vy - that.vy, this.vz - that.vz];

        // compute the quartic equation coefficient
        const a = (da[0] * da[0] + da[1] * da[1] + da[2] * da[2]) / 4;
        const b = dv[0] * da[0] + dv[1] * da[1] + dv[2] * da[2];
        const c = (dp[0] * da[0] + dp[1] * da[1] + dp[2] * da[2]) + (dv[0] * dv[0] + dv[1] * dv[1] + dv[2] * dv[2]);
        const d = 2 * (dp[0] * dv[0] + dp[1] * dv[1] + dp[2] * dv[2]);
        const e = (dp[0] * dp[0] + dp[1] * dp[1] + dp[2] * dp[2]) - ((sigma) * (sigma));

        //solve a*t^4+b*t^3+c*t^2+d*t+e=0 (constant/zero acceleration)
        let dt = Infinity;
        solve_p4(a, b, c, d, e).forEach(val => {
            if (val && val >= 0 && val < dt) dt = val;
        });
        return dt;
    }

    timeToHitWall(x, v, a, r, xl, xu) {
        let tl = Infinity;
        let dl = -xl + x + Math.sign(xl - x) * r;
        if(Math.abs(dl)>PRECISION){
            solve_p2(0.5 * a, v, dl).forEach(val => {
                if (val && val >= 0 && val < tl) tl = val;
            });
        }

        let tu = Infinity;
        let du = -xu + x + Math.sign(xu - x) * r;
        if(Math.abs(du)>PRECISION){
            solve_p2(0.5 * a, v, du).forEach(val => {
                if (val && val >= 0 && val < tu) tu = val;
            });
        }

        return Math.min(tl, tu);
    }

    /**
     * Calculate the time to hit the wall on x-axis
     * @param {*} wall 
     */
    timeToHitWallX(wall) {
        return this.timeToHitWall(this.x, this.vx, this.ax, this.r, wall.xl, wall.xu);
    }

    /**
     * Calculate the time to hit the wall on y-axis
     * @param {*} wall 
     */
    timeToHitWallY(wall) {
        return this.timeToHitWall(this.y, this.vy, this.ay, this.r, wall.yl, wall.yu);
    }

    /**
     * Calculate the time to hit the wall on z-axis
     * @param {*} wall 
     */
    timeToHitWallZ(wall) {
        return this.timeToHitWall(this.z, this.vz, this.az, this.r, wall.zl, wall.zu);
    }


    /**
     * particle dynamics under constant acceleration
     * @param {*} dt time step
     */
    move(dt) {
        // update position
        this.x += this.vx * dt + 0.5 * this.ax * dt * dt;
        this.y += this.vy * dt + 0.5 * this.ay * dt * dt;
        this.z += this.vz * dt + 0.5 * this.az * dt * dt;

        // update speed
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.vz += this.az * dt;
    }

    /**
     * Calculate the two particles' velocity after elastic collision
     * @param {*} that
     */
    bounceOff(that) {
        const dv = [this.vx - that.vx, this.vy - that.vy, this.vz - that.vz];
        const dp = [this.x - that.x, this.y - that.y, this.z - that.z];
        const sigma = this.r + that.r;
        const j = 2 * this.m * that.m * (dv[0] * dp[0] + dv[1] * dp[1] + dv[2] * dp[2]) / (sigma * sigma * (this.m + that.m));
        const J = [j * dp[0], j * dp[1], j * dp[2]];

        this.vx -= J[0] / this.m;
        this.vy -= J[1] / this.m;
        this.vz -= J[2] / this.m;

        that.vx += J[0] / that.m;
        that.vy += J[1] / that.m;
        that.vz += J[2] / that.m;

        this.count++;
        that.count++;
    }

    bounceOffWallX() {
        this.vx = -this.vx;
        this.count++;
    }

    bounceOffWallY() {
        this.vy = -this.vy;
        this.count++;

    }

    bounceOffWallZ() {
        this.vz = -this.vz;
        this.count++;
    }

    distSquareTo(that) {
        const dp = [this.x - that.x, this.y - that.y, this.z - that.z];
        return dp[0] * dp[0] + dp[1] * dp[1] + dp[2] * dp[2];
    }


    print() {
        console.log("x,y,z:" + this.x, this.y, this.z);
        console.log("vx,vy,vz:" + this.vx, this.vy, this.vz);
        console.log("ax,ay,az:" + this.ax, this.ay, this.az);
    }
}
