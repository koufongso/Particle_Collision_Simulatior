class System {
    constructor(canvas) {

        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.wall = {
            xl: 0,
            xu: canvas.width,
            yl: 0,
            yu: canvas.height,
            zl: null,
            zu: null
        }
        this.fps = 200;
        this.freq = 1000 / this.fps;
        this.t = 0;
        this.pre = 0;
        this.end = 0;

        this.queue = new MinPQ();
        this.particles = [];
        this.isRunning = false;
    }

    addParticles(n) {
        if (this.isRunning)
            alert("Cannot add particle while the system is running");
        else
            for (let i = 0; i < n; i++) this.addParticle();
    }

    addParticle() {
        {
            for (let i = 0; i < 100; i++) { // try maixmum 100 times in case particles overlaping happen
                let overlaped = false;
                let particle = null;
                let m = 1;
                let r = 5;
                let coord = [Math.floor(Math.random() * (this.canvas.width - 2 * r)) + this.wall.xl + r,
                Math.floor(Math.random() * (this.canvas.height - 2 * r)) + this.wall.yl + r,
                    0];
                let v = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), 0];
                // let a = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20), 0];
                let a = [0, 0, 0];
                let c = `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},1)`;
                particle = new Particle(coord, v, a, m, r, c);

                for (let i = 0; i < this.particles.length; i++) {
                    let p = this.particles[i];
                    if (particle.distSquareTo(p) < (particle.r + p.r) * (particle.r + p.r)) {
                        overlaped = true;
                        break;
                    }
                };

                if (!overlaped) {
                    this.particles.push(new Particle(coord, v, a, m, r, c));
                    this.drawAll();
                    break;
                }
            }
        }
    }

    clearParticles() {
        if (this.isRunning) {
            alert("The system is running");
        } else {
            this.particles = null;
            this.particles = [];
        }
    }



    initialize(start, end) {
        this.particles.forEach(p => {
            this.predict(p, start, end);
        });
    }

    predict(a, start, end) {
        if (!a) return;
        this.particles.forEach(p => {
            // particle-particle collision
            let dt = a.timeToHit(p);
            if (start + dt * 1000 <= end) this.queue.insert(new CollisionEvent(start + dt * 1000, a, p, 1));

            // particle-wall collision
            let dtX = a.timeToHitWallX(this.wall);
            let dtY = a.timeToHitWallY(this.wall);
            let dtZ = a.timeToHitWallZ(this.wall);
            if (start + dtX * 1000 <= end) this.queue.insert(new CollisionEvent(start + dtX * 1000, a, null, 2));
            if (start + dtY * 1000 <= end) this.queue.insert(new CollisionEvent(start + dtY * 1000, a, null, 3));
            if (start + dtZ * 1000 <= end) this.queue.insert(new CollisionEvent(start + dtZ * 1000, a, null, 4));
        });
    }

    drawAll() {
        this.clear();
        this.particles.forEach(p => {
            this.draw(p);
        });
        //console.log(this.particles[0].x,this.particles[0].y)
    }

    draw(p) {
        this.context.beginPath();
        this.context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        this.context.fillStyle = p.c
        this.context.fill();
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    simulate(duration, cb) {
        if (this.isRunning) return;
        if (this.particles.length == 0) {
            alert("No particles to simulate!");
            cb();
            return;
        }
        console.log("Simulation Started!");
        this.isRunning = true;

        let startFrameTime;
        let endFrameTime;
        let currentEventTime;
        let preEventTime;
        let currentFrameTime;
        let preFrameTime;
        let event = null;

        window.requestAnimationFrame(() => { loop(this) }); // start animation

        function loop(this_) {
            if (startFrameTime == undefined) {
                startFrameTime = performance.now();
                endFrameTime = startFrameTime + duration * 1000;
                currentEventTime = startFrameTime;
                preEventTime = startFrameTime;
                currentFrameTime = startFrameTime;
                preFrameTime = startFrameTime;

                this_.initialize(startFrameTime, endFrameTime);
                if (!this_.queue.isEmpty()) {
                    event = this_.queue.delMin();
                }
            } else {
                currentEventTime = performance.now();
                currentFrameTime = currentEventTime;
            }

            let dt = currentFrameTime - preFrameTime;
            // normal draw event
            if (dt >= this_.freq) {
                this_.particles.forEach(p => {
                    p.move((currentEventTime - preEventTime) / 1000.0)
                });

                this_.drawAll();
                preEventTime = currentEventTime;
                preFrameTime = currentFrameTime;
                //console.log(currentEventTime);
            }


            // check collision event
            while (event && (event.t - currentFrameTime <= this_.freq)) {
                // console.log("in while")
                if (event.isValid()) {
                    currentEventTime = event.t;
                    dt = currentEventTime - preEventTime;
                    // if (dt < 0) {
                    //     console.log(currentEventTime + "-" + preEventTime + "=" + dt);
                    //     //throw "Missed event"
                    // }

                    this_.particles.forEach(p => {
                        p.move(dt / 1000.0)
                    });

                    let p1 = event.p1;
                    let p2 = event.p2;
                    switch (event.type) {
                        case 1:
                            p1.bounceOff(p2);
                            break;
                        case 2:
                            p1.bounceOffWallX();
                            break;
                        case 3:
                            p1.bounceOffWallY();
                            break;
                        case 4:
                            p1.bounceOffWallZ();
                            break;
                        default:
                            throw "Unknown collisionEvent type.";
                    }
                    if (p1.x < this_.wall.xl || p1.x > this_.wall.xu || p1.y < this_.wall.yl || p1.y > this_.wall.yu) console.log("out of wall");
                    this_.predict(p1, currentEventTime, endFrameTime);
                    this_.predict(p2, currentEventTime, endFrameTime);
                    preEventTime = currentEventTime;
                }

                event = (this_.queue.isEmpty() ? null : this_.queue.delMin());
            }

            if (currentEventTime < endFrameTime) {
                window.requestAnimationFrame(() => { loop(this_) });
            } else {
                console.log("Simulation Finished!");
                this_.isRunning = false;
                cb();
                return;
            }
        }
    }


}




class CollisionEvent {
    constructor(t, p1, p2, type) {
        this.t = t;
        this.p1 = p1;
        this.p2 = p2;
        this.type = type; // 0: draw, 1: particle-particle, 2:particle-wallX, 3:particle-wallY, 4:particle-wallZ
        if (p1) this.count1 = p1.count;
        if (p2) this.count2 = p2.count;
    }

    /**
     * Comparator for Event class
     * @param {*} that 
     */
    isGreater(that) {
        return this.t > that.t;
    }

    /**
     * To check if the event is still valid at the time is execute (avoid dulpicate event, out-dated event)
     */
    isValid() {
        if (this.p1 && this.p1.count != this.count1) return false;
        if (this.p2 && this.p2.count != this.count2) return false;
        return true;
    }
}





