const canvas = document.getElementById("screen");
//const system = new System(canvas);
const system = new SystemV2(canvas);
let duration = 0;

// timer
const timer = document.getElementById("timer");
let timerHandle
let counter = 0;

// button
const button_run = document.getElementById("button_run");
const button_set_num = document.getElementById("button_set_num");
const button_set_duration = document.getElementById("button_set_duration");

// input
const input_num = document.getElementById("num_particles");
const input_duration = document.getElementById("duration");

button_run.addEventListener("click",run);
button_set_num.addEventListener("click",setParticles);
button_set_duration.addEventListener("click",setDuration);

function setParticles(event){
    event.preventDefault();
    const n = input_num.value;
    if(n>=0 && n<=1000){
        this.parentElement.getElementsByClassName("warning")[0].style.display = "none";
        system.clearParticles();
        system.addParticles(n);
    }else{
        this.parentElement.getElementsByClassName("warning")[0].style.display = "inline";
    }
}

function setDuration(event){
    event.preventDefault();
    const n = input_duration.value;
    if(n>=0){
        this.parentElement.getElementsByClassName("warning")[0].style.display = "none";
        duration = n;
        counter = duration;
        timer.innerText = duration;
    }else{
        this.parentElement.getElementsByClassName("warning")[0].style.display = "inline";
    }
}

// simulation
function cb_simulation(){
    button_run.innerText = "Run";
}

function run(){
    button_run.innerText = "Running...";
    counter = duration;
    timer.innerText = duration;
    system.simulate(duration,cb_simulation);
    timerHandle = setInterval(()=>{
        counter--;
        timer.innerText = counter;
        if(counter<=0) clearInterval(timerHandle);
    },1000);
}




