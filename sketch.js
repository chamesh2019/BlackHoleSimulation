let width = window.innerWidth;
let height = window.innerHeight;
let running = true;
const dt = 1 / 10; // time step in seconds

const AU = 149597870.7; // Astronomical Unit in km
const G = 6.6743e-20; // Gravitational constant in km^3/kg/s^2
const c = 299792.458; // Speed of light in km/s
const M_sun = 1.98847e30; // Solar mass in kg

const simulatedWidth = 0.1 * AU;
const scale = simulatedWidth / width; // pixels per km
const simulatedHeight = height * scale; // in km

convertToSimulated = (pixels) => pixels * scale;
convertToPixels = (km) => km / scale;

let lightRays = [];
const maxTrails = 500;
const trailIndexing = 1;

// Mouse interaction variables
let mouseStartX, mouseStartY;
let isDragging = false;
let dragStartTime = 0;

const BlackHole = {
  mass: 10 ** 5 * M_sun, // 1 million solar masses
  position: { x: simulatedWidth / 2, y: simulatedHeight / 2 },
  positionPixels: function () {
    return {
      x: convertToPixels(this.position.x),
      y: convertToPixels(this.position.y),
    };
  },
  radius: function () {
    return (2 * G * this.mass) / (c * c); // Schwarzschild radius in km
  },
  radiusPixels: function () {
    return convertToPixels(this.radius());
  },

  draw: function () {
    let bhRadiusPixels = this.radiusPixels();
    let bhPos = this.positionPixels();


    // Glow effect for the accretion disc
    fill(255, 165, 0, 50);
    stroke(255, 165, 0, 50); // Soft, transparent orange
    strokeWeight(20);
    drawingContext.filter = 'blur(15px)';
    circle(bhPos.x, bhPos.y, bhRadiusPixels * 4);
    drawingContext.filter = 'none';

    fill(0);
    noStroke();
    drawingContext.filter = "blur(15px)";
    circle(bhPos.x, bhPos.y, bhRadiusPixels * 2);
    drawingContext.filter = "none";

    // Event horizon outline
    noFill();
    stroke(255, 255, 255, 50);
    strokeWeight(1);
    circle(bhPos.x, bhPos.y, bhRadiusPixels * 2);
  },
};

class LightRay {
  constructor(x, y, angle) {
    this.position = { x: x, y: y }; // in km
    this.angle = angle; // in radians
    this.speed = c; // speed of light in km/s
    this.fs = 0;

    this.updatePolar();

    this.trail = [];
  }
  updatePolar() {
    this.r = dist(
      this.position.x,
      this.position.y,
      BlackHole.position.x,
      BlackHole.position.y
    );
    this.phi = atan2(
      this.position.y - BlackHole.position.y,
      this.position.x - BlackHole.position.x
    );
    this.dr = this.speed * cos(this.angle - this.phi);
    this.dphi = (this.speed * sin(this.angle - this.phi)) / this.r;
  }

  updateCartesianFromPolar() {
    this.position.x = BlackHole.position.x + this.r * cos(this.phi);
    this.position.y = BlackHole.position.y + this.r * sin(this.phi);
  }

  update() {
    let state = [this.r, this.phi, this.dr, this.dphi];

    let k1 = derivatives(state);
    let k2 = derivatives(state.map((s, i) => s + 0.5 * dt * k1[i]));
    let k3 = derivatives(state.map((s, i) => s + 0.5 * dt * k2[i]));
    let k4 = derivatives(state.map((s, i) => s + dt * k3[i]));

    for (let i = 0; i < state.length; i++) {
      state[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }

    [this.r, this.phi, this.dr, this.dphi] = state;

    this.updateCartesianFromPolar();
    if (this.fs % trailIndexing === 0) {
      this.trail.push({ x: this.position.x, y: this.position.y });
    }
    if (this.trail.length > maxTrails) {
      this.trail.shift();
    }

    this.fs += 1;

    if (this.r <= BlackHole.radius()) {
      // Ray has crossed the event horizon
      lightRays = lightRays.filter((ray) => ray !== this);
      return;
    }

    if (
      this.position.x < 0 ||
      this.position.x > simulatedWidth ||
      this.position.y < 0 ||
      this.position.y > simulatedHeight
    ) {
      // Ray has exited the simulation area
      lightRays = lightRays.filter((ray) => ray !== this);
      return;
    }   
  }
  draw() {
    fill(255, 255, 0);
    noStroke();
    let posPixels = {
      x: convertToPixels(this.position.x),
      y: convertToPixels(this.position.y),
    };
    ellipse(posPixels.x, posPixels.y, 2, 2);

    for (let index = 0; index < this.trail.length; index++) {
      const element = this.trail[index];
      let alpha = map(index, 0, this.trail.length - 1, 50, 255);
      fill(255, 255, 0, alpha);
      ellipse(convertToPixels(element.x), convertToPixels(element.y), 1, 1);
    }
  }
}

function derivatives(state) {
  let [r, phi, dr, dphi] = state;
  let rs = BlackHole.radius();

  let ddr =
    r * dphi * dphi * (1 - (3 * rs) / (2 * r)) - (c * c * rs) / (2 * r * r);
  let ddphi = (-2 * dr * dphi) / r;

  return [dr, dphi, ddr, ddphi]; // derivatives of [r, phi, dr, dphi]
}

function setup() {
  let canvas = createCanvas(width, height);
  canvas.parent("sketch-container");
  background(0);

  // Initialize light rays
  //   for (let i = 0; i < 50; i++) {
  //     lightRays.push(new LightRay(100, (i * simulatedHeight) / 50, 0));
  //     }
  lightRays.push(new LightRay(100, (3.714784 * simulatedHeight) / 10, 0));
}



function keyPressed() {
  if (key === " ") {
    running = !running;
  }
}

function mousePressed() {
  mouseStartX = mouseX;
  mouseStartY = mouseY;
  isDragging = false;
  dragStartTime = millis();
}

function mouseDragged() {
  isDragging = true;
}

function mouseReleased() {
  // Convert mouse coordinates to simulated coordinates
  let startXSim = convertToSimulated(mouseStartX);
  let startYSim = convertToSimulated(mouseStartY);
  
  let angle;
  
  if (isDragging) {
    // Calculate angle based on drag direction
    let deltaX = mouseX - mouseStartX;
    let deltaY = mouseY - mouseStartY;
    angle = atan2(deltaY, deltaX);
  } else {
    // If just clicked (no drag), use a default angle (horizontal)
    angle = 0;
  }
  
  // Create new light ray at click position with calculated angle
  lightRays.push(new LightRay(startXSim, startYSim, angle));
}

function draw() {
  frameRate(60);

  if (!running) return;

  background(0);
  BlackHole.draw();

  // Draw trajectory preview while dragging
  if (isDragging && mouseIsPressed) {
    stroke(255, 255, 0, 150);
    strokeWeight(2);
    line(mouseStartX, mouseStartY, mouseX, mouseY);
    
    // Draw arrow head
    let angle = atan2(mouseY - mouseStartY, mouseX - mouseStartX);
    let arrowLength = 10;
    push();
    translate(mouseX, mouseY);
    rotate(angle);
    stroke(255, 255, 0, 200);
    strokeWeight(3);
    line(0, 0, -arrowLength, -arrowLength/2);
    line(0, 0, -arrowLength, arrowLength/2);
    pop();
    noStroke();
  }

  for (let ray of lightRays) {
    ray.update();
    ray.draw();
  }
}
