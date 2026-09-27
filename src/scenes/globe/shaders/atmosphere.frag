uniform vec3 uLightDir;
uniform float uStrength;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  float f = 1.0 - max(dot(vNormal, vView), 0.0);
  float rim = pow(f, 3.0) * 0.32;
  // Sol üstten gelen hafif dolgu ışığı.
  float fill = pow(max(dot(vNormal, normalize(uLightDir)), 0.0), 2.0) * 0.06;
  gl_FragColor = vec4(vec3(0.95, 0.95, 0.94), (rim + fill) * uStrength);
}
