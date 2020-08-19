import * as THREE from "three";
import { gsap } from "gsap";
import SplitText from "../../SplitText";

const glslify = require("glslify");

export default class Particles {
  constructor(webgl) {
    this.webgl = webgl;
    this.container = new THREE.Object3D();
    this.mapBass = 0;
    this.mapTremble = 0;
    this.mapMid = 0;
    this.mapLowMid = 0;
    this.mapHighMid = 0;
    this.root = document.documentElement;
    this.playPauseButton = document.querySelector(
      '[aria-label="toggle-music"]'
    );
  }

  init(src) {
    gsap.fromTo(
      ".loading",
      {
        autoAlpha: 1,
      },
      {
        duration: 0.5,
        autoAlpha: 0,
      }
    );

    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.format = THREE.RGBFormat;

      this.width = texture.image.width;
      this.height = texture.image.height;

      this.initPoints(true);
      this.resize();
      this.hide();
    });

    const s = (p) => {
      let audio, fft;

      p.preload = () => {
        audio = p.loadSound("/audio/music-file.mp3", () => {
          this.playPauseButton.addEventListener("click", () => {
            if (audio.isPlaying()) {
              audio.pause();
              gsap.to("#pause", {
                autoAlpha: 0,
                duration: 0.15,
              });
              gsap.to("#play", {
                autoAlpha: 1,
                duration: 0.15,
                delay: 0.15,
              });
            } else {
              audio.loop();
              gsap.to("#play", {
                autoAlpha: 0,
                duration: 0.15,
              });
              gsap.to("#pause", {
                autoAlpha: 1,
                duration: 0.15,
                delay: 0.15,
              });
            }
          });
        });
      };
      p.setup = () => {
        fft = new p5.FFT();
        const allowButton = document.querySelector("#allow-music");

        allowButton.addEventListener("click", () => {
          audio.loop();
          this.show();
          gsap.to([allowButton, ".container img"], {
            autoAlpha: 0,
            duration: 0.5,
          });
        });
      };
      p.draw = () => {
        fft.analyze();

        const bass = fft.getEnergy("bass");
        const treble = fft.getEnergy("treble");
        const lowMid = fft.getEnergy("lowMid");
        const mid = fft.getEnergy("mid");
        const highMid = fft.getEnergy("highMid");

        this.mapBass = p.map(bass, 0, 255, 0, 2.0);
        this.mapTremble = p.map(treble, 0, 255, 0, 2.0);
        this.mapLowMid = p.map(lowMid, 0, 255, 0, 2.0);
        this.mapMid = p.map(mid, 0, 255, 0, 2.0);
        this.mapHighMid = p.map(highMid, 0, 255, 0, 2.0);
      };
    };
    new p5(s);
  }

  initPoints(discard) {
    this.numPoints = this.width * this.height;

    let numVisible = this.numPoints;
    let threshold = 0;
    let originalColors;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 34;

      const img = this.texture.image;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, this.width, this.height * -1);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);

      for (let i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
      }
    }

    const uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 100.0 },
      uSize: { value: 1.58 },
      uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
      uTexture: { value: this.texture },
      uTouch: { value: null },
      music: { value: null },
    };

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: glslify(require("../../../shaders/particle.vert")),
      fragmentShader: glslify(require("../../../shaders/particle.frag")),
      depthTest: false,
      transparent: true,
      // blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.addAttribute("position", positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0);
    uvs.setXYZ(3, 1.0, 1.0);
    geometry.addAttribute("uv", uvs);

    // index
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
    );

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < this.numPoints; i++) {
      if (discard && originalColors[i * 4 + 0] <= threshold) continue;

      offsets[j * 3 + 0] = i % this.width;
      offsets[j * 3 + 1] = Math.floor(i / this.width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.addAttribute(
      "pindex",
      new THREE.InstancedBufferAttribute(indices, 1, false)
    );
    geometry.addAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(offsets, 3, false)
    );
    geometry.addAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(angles, 1, false)
    );

    this.object3D = new THREE.Mesh(geometry, material);
    this.container.add(this.object3D);
  }

  update(delta) {
    if (!this.object3D) return;
    if (this.touch) this.touch.update();
    this.object3D.material.uniforms.music.value = Math.max(1, this.mapBass);

    this.object3D.material.uniforms.uTime.value += delta;
  }

  show(time = 4.0) {
    // reset
    gsap.fromTo(
      this.object3D.material.uniforms.uSize,
      time,
      { value: 0.5 },
      { value: 1.5 }
    );
    gsap.to(this.object3D.material.uniforms.uRandom, time, { value: 2.0 });
    gsap.fromTo(
      this.object3D.material.uniforms.uDepth,
      time,
      { value: 40.0 },
      { value: 4.0 }
    );
  }

  hide(_destroy, time = 0.8) {
    return new Promise((resolve, reject) => {
      gsap.to(this.object3D.material.uniforms.uRandom, time, {
        value: 5.0,
        onComplete: () => {
          if (_destroy) this.destroy();
          resolve();
        },
      });
      gsap.to(this.object3D.material.uniforms.uDepth, time, {
        value: -20.0,
        ease: "power3.in",
      });
      gsap.to(this.object3D.material.uniforms.uSize, time * 0.8, {
        value: 0.0,
      });

      // this.removeListeners();
    });
  }

  destroy() {
    if (!this.object3D) return;

    this.object3D.parent.remove(this.object3D);
    this.object3D.geometry.dispose();
    this.object3D.material.dispose();
    this.object3D = null;
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (!this.object3D) return;

    const scale = this.webgl.fovHeight / this.height;
    this.object3D.scale.set(scale, scale, 1);
  }

  onInteractiveMove(e) {
    const uv = e.intersectionData.uv;
    if (this.touch) this.touch.addTouch(uv);
  }
}
