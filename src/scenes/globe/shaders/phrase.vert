varying vec2 vUv;
varying float vFacing;

#include <facing>

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = facing(world.xyz);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * world;
}
