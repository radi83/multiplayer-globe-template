/**
 * Cloudflare Worker: derlenmiş siteyi (dist/) sunar.
 *
 * Statik dosyalarla eşleşen istekler bu koda hiç gelmeden doğrudan
 * sunulur; buraya yalnızca eşleşmeyen istekler düşer ve 404 sayfası döner.
 */
import { DurableObject } from "cloudflare:workers";

interface Env {
  ASSETS: Fetcher;
}

/**
 * Eski "multiplayer-globe-template" şablonundan kalan Durable Object sınıfı.
 * Cloudflare, yayınlanmış bir sınıfın silme adımı (migration) olmadan
 * kaldırılmasına izin vermez. Yayını bozmamak için sınıf şimdilik boş olarak
 * duruyor; kaldırma adımı docs/DEPLOY.md içinde anlatılıyor.
 */
export class Globe extends DurableObject<Env> {
  override async fetch(): Promise<Response> {
    return new Response("Gone", { status: 410 });
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
