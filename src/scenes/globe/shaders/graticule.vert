attribute float aLat;
uniform float uTime;
varying float vFacing;
varying float vLat;
varying float vScan;

#include <facing>

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = facing(world.xyz);
  vLat = aLat;
  // Yavaşça yukarı aşağı gezinen tarama bandı: kontrollü ışık vurgusu.
  float band = sin(uTime * 0.21) * 0.85;
  vScan = exp(-pow((normalize(world.xyz).y - band) * 6.0, 2.0));
  gl_Position = projectionMatrix * viewMatrix * world;
}
