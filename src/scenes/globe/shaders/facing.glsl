// Küre merkezi orijindedir: yüzey normali = normalize(dünya konumu).
// Kameraya bakan yüz 1'e, arka yüz -1'e yaklaşır.
float facing(vec3 worldPos) {
  return dot(normalize(worldPos), normalize(cameraPosition - worldPos));
}
