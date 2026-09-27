uniform float uSize;
uniform float uPixelRatio;
varying float vFacing;

#include <facing>

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = facing(world.xyz);
  gl_PointSize = uSize * uPixelRatio;
  gl_Position = projectionMatrix * viewMatrix * world;
}
