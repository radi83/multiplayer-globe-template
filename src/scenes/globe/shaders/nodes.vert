attribute float aSelected;
attribute float aFlash;
uniform float uSize;
uniform float uPixelRatio;
uniform float uReveal;
varying float vFacing;
varying float vSelected;
varying float vFlash;

#include <facing>

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = facing(world.xyz);
  vSelected = aSelected;
  vFlash = aFlash;
  float size = uSize * (aSelected > 0.5 ? 4.0 : 1.0) * (1.0 + aFlash * 0.9);
  gl_PointSize = size * uPixelRatio * uReveal;
  gl_Position = projectionMatrix * viewMatrix * world;
}
