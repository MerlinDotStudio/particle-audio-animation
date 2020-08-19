import ready from "domready";
import { gsap } from "gsap";

import App from "./App";

ready(async () => {
  window.app = new App();
  window.app.init();
});
