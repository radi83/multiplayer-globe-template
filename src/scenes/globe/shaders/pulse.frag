uniform vec3 uRed;
varying float vFacing;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float front = smoothstep(-0.2, 0.15, vFacing);
  float halo = exp(-r * r * 4.0) * 0.55;
  float core = 1.0 - smoothstep(0.08, 0.22, r);
  vec3 color = mix(uRed, vec3(1.0), core);
  gl_FragColor = vec4(color, (halo + core) * front);
}
