/**
 * İletişim bilgileri.
 *
 * Yalnızca gerçek ve paylaşılmasına izin verilmiş bilgileri girin.
 * Boş bırakılan alan sayfada hiç gösterilmez; hepsi boşsa iletişim
 * bölümü yalnızca "sunumda görüşebilirsiniz" notunu gösterir.
 * Değişiklikten sonra `npm run build` gerekir (bilgiler derleme sırasında
 * statik HTML'e yazılır).
 */
export interface ContactConfig {
  /** Örn. "Ad Soyad, unvan" */
  name: string;
  /** Örn. "ad@kurum.edu.tr" */
  email: string;
  /** Yalnızca https:// ile başlayan adres kabul edilir. */
  url: string;
}

export const CONTACT: ContactConfig = {
  name: "",
  email: "",
  url: "",
};

/**
 * Sitenin yayınlandığı tam adres (sonunda / olmadan).
 * Sosyal ağ önizleme görseli ve kanonik bağlantı için mutlak adres gerekir.
 */
export const SITE_URL = "https://bskn.net";
