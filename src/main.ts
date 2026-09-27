/**
 * Giriş noktası. Metnin tamamı derleme sırasında statik HTML'e yazılmıştır;
 * burada yalnızca yazı tipleri, stiller, hareket ve etkileşim eklenir.
 */
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-ext-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-ext-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-ext-600.css";
import "@fontsource/ibm-plex-sans-condensed/latin-600.css";
import "@fontsource/ibm-plex-sans-condensed/latin-ext-600.css";
import "@fontsource/ibm-plex-sans-condensed/latin-700.css";
import "@fontsource/ibm-plex-sans-condensed/latin-ext-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-ext-500.css";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/hero.css";
import "./styles/problem.css";
import "./styles/approach.css";
import "./styles/demo.css";
import "./styles/principles.css";
import "./styles/stages.css";
import "./styles/contact.css";
import "./styles/motion.css";

import { initMotionToggle } from "./motion/preference";
import { initTimelines } from "./motion/timelines";
import { initSmoothScroll } from "./motion/smooth";
import { initDemo } from "./sections/demo";
import { initContact } from "./sections/contact";
import { bootGlobe } from "./scenes/globe/boot";

initMotionToggle();
initDemo();
initContact();
initTimelines();
initSmoothScroll();
bootGlobe();
