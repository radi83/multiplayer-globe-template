uniform vec3 uColor;
uniform float uFront;
uniform float uBack;
uniform float uReveal;
uniform float uScan;
varying float vFacing;
varying float vLat;
varying float vScan;

void main() {
  // Ortaya çıkış ekvatordan kutuplara doğru ilerler.
  float reveal = 1.0 - smoothstep(uReveal - 0.08, uReveal, abs(vLat));
  float front = smoothstep(-0.08, 0.28, vFacing);
  float alpha = mix(uBack, uFront, front) + vScan * uScan * front;
  alpha *= reveal;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(uColor, alpha);
}
