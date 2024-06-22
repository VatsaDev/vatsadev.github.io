let flock;
let goldenBoid;
let themeAudio;

// Initialize audio
themeAudio = new Audio('theme.mp3');
themeAudio.loop = true;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  createP("The special boid controls the theme song");

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 100; i++) {
    let b = new Boid(width / 2, height / 2);
    flock.addBoid(b);
  }
  
  // Create the golden boid
  goldenBoid = new GoldenBoid(width / 2, height / 2);
  flock.addBoid(goldenBoid);
}

function draw() {
  background(18, 18, 18);
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

function mousePressed() {
  if (goldenBoid.contains(mouseX, mouseY)) {
    if (themeAudio.paused) {
      themeAudio.play();
    } else {
      themeAudio.pause();
    }
  }
}

// Flock object
function Flock() {
  this.boids = [];
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
};

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
};

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 3; // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};

Boid.prototype.applyForce = function (force) {
  this.acceleration.add(force);
};

Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
};

Boid.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
};

Boid.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
};

Boid.prototype.render = function () {
  let theta = this.velocity.heading() + radians(90);
  fill(211, 136, 226);
  stroke(170, 136, 255);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
};

Boid.prototype.borders = function () {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
};

Boid.prototype.separate = function (boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < desiredseparation)) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steer.div(count);
  }
  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
};

Boid.prototype.align = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Boid.prototype.cohesion = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
};

// GoldenBoid class
function GoldenBoid(x, y) {
  Boid.call(this, x, y);
  this.r = 5.0;
  this.baseSpeed = 10;
  this.maxspeed = this.baseSpeed;
}

GoldenBoid.prototype = Object.create(Boid.prototype);
GoldenBoid.prototype.constructor = GoldenBoid;

GoldenBoid.prototype.render = function() {
  let theta = this.velocity.heading() + radians(90);
  fill(255, 0, 255); // Gold color
  stroke(218, 165, 32);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
};

GoldenBoid.prototype.contains = function(x, y) {
  return dist(x, y, this.position.x, this.position.y) < this.r * 2;
};

GoldenBoid.prototype.flock = function(boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);

  // Count nearby boids
  let nearbyBoids = 0;
  let crowdDist = 50;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < crowdDist) {
      nearbyBoids++;
    }
  }

  // Adjust speed based on nearby boids
  this.maxspeed = map(nearbyBoids, 0, 20, this.baseSpeed, 0.5);
  this.maxspeed = constrain(this.maxspeed, 0.5, this.baseSpeed);
};
