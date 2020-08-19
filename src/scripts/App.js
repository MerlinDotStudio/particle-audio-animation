import WebGLView from "./webgl/WebGLView";
import GUIView from "./gui/GUIView";

export default class App {
  constructor() {}

  init() {
    this.initWebGL();
    // this.initGUI();
    this.addListeners();
    this.animate();
    this.resize();
    // this.audio();
  }

  initWebGL() {
    this.webgl = new WebGLView(this);
    document
      .querySelector(".container")
      .appendChild(this.webgl.renderer.domElement);
  }

  initGUI() {
    this.gui = new GUIView(this);
  }

  addListeners() {
    this.handlerAnimate = this.animate.bind(this);

    window.addEventListener("resize", this.resize.bind(this));
    // window.addEventListener('keyup', this.keyup.bind(this));

    const el = this.webgl.renderer.domElement;
    // el.addEventListener('click', this.click.bind(this));
  }

  animate() {
    this.update();
    this.draw();

    this.raf = requestAnimationFrame(this.handlerAnimate);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    if (this.webgl) this.webgl.update();
  }

  draw() {
    if (this.webgl) this.webgl.draw();
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (this.webgl) this.webgl.resize();
  }

  keyup(e) {
    // g
  }

  click(e) {
    this.webgl.next();
  }
  audio() {}
}
