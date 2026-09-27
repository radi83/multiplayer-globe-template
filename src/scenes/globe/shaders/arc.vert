attribute float aT;
varying float vFacing;
varying float vT;

#include <facing>

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = facing(world.xyz);
  vT = aT;
  gl_Position = projectionMatrix * viewMatrix * world;
}
