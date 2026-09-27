/** İletişim: e-posta adresini kopyalama (düğme yalnızca adres tanımlıysa vardır). */
export function initContact(): void {
  const button = document.getElementById("copy-mail");
  const value = document.getElementById("contact-mail");
  const msg = document.getElementById("copy-msg");
  if (!button || !value || !msg) return;

  const selectAddress = (): void => {
    const range = document.createRange();
    range.selectNodeContents(value);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    msg.textContent = button.dataset.selected ?? "";
  };

  button.addEventListener("click", () => {
    const text = value.textContent ?? "";
    if (!navigator.clipboard?.writeText) {
      selectAddress();
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        msg.textContent = button.dataset.copied ?? "";
      },
      selectAddress,
    );
  });
}
