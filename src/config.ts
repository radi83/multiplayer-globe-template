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
  /** Görünen biçim, örn. "+90 532 000 0000". Arama bağlantısı bundan türetilir. */
  phone: string;
  /** Yalnızca https:// ile başlayan adres kabul edilir. */
  url: string;
}

export const CONTACT: ContactConfig = {
  name: "",
  email: "c@bskn.tr",
  phone: "+90 532 659 1923",
  url: "",
};

/**
 * Sitenin yayınlandığı tam adres (sonunda / olmadan).
 * Sosyal ağ önizleme görseli ve kanonik bağlantı için mutlak adres gerekir.
 */
export const SITE_URL = "https://bskn.net";
