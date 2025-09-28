# Black Hole Simulation

This project is an interactive simulation of light rays bending around a massive black hole, visualizing gravitational lensing and the event horizon. Built with p5.js, it provides an educational and visually engaging way to explore general relativity concepts.

## Features
- **Black Hole Visualization**: Sharp event horizon, glowing accretion disc, and starry background.
- **Light Ray Simulation**: Click to add light rays, drag to set their trajectory.
- **Realistic Physics**: Light rays follow curved paths due to the black hole's gravity.
- **Responsive UI**: Full-screen layout with clear controls and explanations.

## Controls
- **Spacebar**: Pause/resume the simulation.
- **Mouse Click**: Add a light ray at the clicked position.
- **Mouse Drag**: Set the trajectory of the new light ray by dragging.

## How It Works
- The black hole is rendered at the center with a sharp event horizon and a glowing accretion disc.
- Light rays are simulated using relativistic equations and are removed if they cross the event horizon or exit the simulation area.
- The background is filled with randomly placed stars for a realistic space effect.

## Technologies Used
- [p5.js](https://p5js.org/) for graphics and interaction
- HTML/CSS for layout and styling

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/chamesh2019/BlackHoleSimulation.git
   ```
2. Open `index.html` in your browser.

## Customization
- You can adjust the black hole mass, accretion disc style, and star density in `sketch.js`.
- The simulation is easily extensible for more advanced physics or visual effects.

## License
MIT License

---
Enjoy exploring the mysteries of black holes and gravitational lensing!
