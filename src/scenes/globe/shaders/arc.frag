uniform vec3 uColor;
uniform vec3 uHot;
uniform float uFront;
uniform float uBack;
uniform float uDraw;
uniform float uPulse;
varying float vFacing;
varying float vT;

void main() {
  if (vT > uDraw) discard;
  float front = smoothstep(-0.2, 0.18, vFacing);
  float alpha = mix(uBack, uFront, front);
  // Işık darbesi: başın arkasında üstel sönümlenen iz.
  float d = uPulse - vT;
  float trail = (uPulse >= 0.0 && d >= 0.0) ? exp(-d * 11.0) : 0.0;
  vec3 color = mix(uColor, uHot, trail);
  alpha += trail * 0.85 * front;
  gl_FragColor = vec4(color, alpha);
}
