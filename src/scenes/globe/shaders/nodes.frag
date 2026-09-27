uniform vec3 uRed;
uniform vec3 uInk;
varying float vFacing;
varying float vSelected;
varying float vFlash;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float front = smoothstep(-0.02, 0.22, vFacing);
  if (vSelected > 0.5) {
    // Seçili düğüm: çekirdek + halka + yumuşak parıltı.
    float core = 1.0 - smoothstep(0.2, 0.3, r);
    float ring = (1.0 - smoothstep(0.0, 0.07, abs(r - 0.74))) * (0.55 + 0.45 * vFlash);
    float glow = exp(-r * r * 5.0) * (0.18 + 0.4 * vFlash);
    gl_FragColor = vec4(uRed, (core + ring + glow) * mix(0.1, 1.0, front));
  } else {
    float core = 1.0 - smoothstep(0.35, 1.0, r);
    gl_FragColor = vec4(uInk, core * mix(0.08, 0.9, front));
  }
}
