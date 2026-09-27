/**
 * Temsili senaryo: bağlam ve kanıt seçimine göre pasajların uygulanabilirliği
 * ve sonuç durumu. Tüm metinler src/content/tr.json dosyasından gelir.
 */
import content from "../content/tr.json";
import { flowLinks } from "../motion/timelines";

type Loc = "in" | "out" | "unk";
type PillKind = keyof typeof content.demo.pills;
type Kind = keyof typeof content.demo.states;

const d = content.demo;

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} bulunamadı`);
  return el as T;
}

function setCard(cardId: string, kind: PillKind): void {
  const card = byId(cardId);
  const pill = byId(`${cardId}-pill`);
  card.className = `card ${kind === "on" ? "is-on" : kind === "off" ? "is-off" : "is-unk"}`;
  pill.className = `pill${kind === "on" ? " pill--on" : kind === "unk" ? " pill--unk" : ""}`;
  pill.textContent = d.pills[kind];
}

/** Güvenli biçimde "a → b → c" zincirini oluşturur (metin düğümleri, HTML yok). */
function renderChain(el: HTMLElement, parts: string[]): void {
  el.replaceChildren();
  parts.forEach((part, i) => {
    if (i > 0) {
      const ar = document.createElement("span");
      ar.className = "ar";
      ar.textContent = " → ";
      el.append(ar);
    }
    el.append(document.createTextNode(part));
  });
}

export function initDemo(): void {
  const root = document.getElementById("demo");
  const board = document.getElementById("board");
  if (!root || !board) return;

  const render = (animate: boolean): void => {
    const loc = (root.querySelector<HTMLInputElement>("input[name=loc]:checked")?.value ?? "in") as Loc;
    const hasDoc = (root.querySelector<HTMLInputElement>("input[name=evi]:checked")?.value ?? "doc") === "doc";

    if (loc === "in") {
      setCard("pa", "on");
      setCard("pb", "off");
    } else if (loc === "out") {
      setCard("pa", "off");
      setCard("pb", "on");
    } else {
      setCard("pa", "unk");
      setCard("pb", "unk");
    }

    const ev = byId("ev");
    const evPill = byId("ev-pill");
    if (hasDoc && loc !== "unk") {
      ev.className = "card is-on";
      evPill.className = "pill pill--on";
      evPill.textContent = d.evidencePills.linked;
    } else if (hasDoc) {
      ev.className = "card";
      evPill.className = "pill";
      evPill.textContent = d.evidencePills.floating;
    } else {
      ev.className = "card is-unk";
      evPill.className = "pill pill--miss";
      evPill.textContent = d.evidencePills.missing;
    }

    const kind: Kind = loc === "unk" ? "unknown" : hasDoc ? "ready" : "missing";
    const state = d.states[kind];
    const vars = {
      passage: loc === "in" ? d.passages.a.name : d.passages.b.name,
      context: d.locOptions.find((o) => o.value === loc)?.context ?? "",
      evidence: d.evidence.chainName,
    };
    let text = fill(state.text, vars);
    if (kind === "unknown" && !hasDoc) text += d.states.unknown.textNoEvidence;

    byId("result").dataset.kind = kind;
    byId("res-state").textContent = state.label;
    byId("res-txt").textContent = text;
    renderChain(byId("res-chain"), state.chain.map((c) => fill(c, vars)));

    if (animate) flowLinks(board);
  };

  root.addEventListener("change", () => render(true));
  render(false);
}
