uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;
varying float vFacing;

void main() {
  vec4 tex = texture2D(uMap, vUv);
  // Öne dönük bölüm tam görünür; yanlara kıvrıldıkça yazı söner.
  float front = smoothstep(0.12, 0.6, vFacing);
  float alpha = tex.a * uOpacity * front;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(tex.rgb, alpha);
}
