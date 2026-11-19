import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SUBRAYADO = "100% 0.32em";

/* ---------- Portada: la cocina "emplata" el hero línea por línea ---------- */
export function revelarHero(hero) {
  const q = gsap.utils.selector(hero);
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  const foto = q(".hero-photo img");
  if (foto.length) {
    tl.fromTo(foto, { scale: 1.16, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 2.4, ease: "power2.out" }, 0);
  }
  tl.from(q(".eyebrow"), { opacity: 0, x: -24, letterSpacing: "0.55em", duration: 1.1 }, 0.15)
    .from(q("h1 .linea > span"), { yPercent: 115, rotation: 4, duration: 1.15, stagger: 0.14 }, 0.3)
    .to(q("h1 em"), { backgroundSize: SUBRAYADO, duration: 0.9, ease: "power2.inOut" }, 1.2)
    .from(q(".hero-description"), { opacity: 0, y: 26, duration: 0.9 }, 0.85)
    .from(q(".hero-actions > *"), { opacity: 0, y: 22, scale: 0.9, duration: 0.75, stagger: 0.1, ease: "back.out(2)" }, 1.0)
    .from(q(".hero-values span"), { opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: "back.out(1.8)" }, 1.15)
    .from(q(".hero-values svg"), { rotation: -140, scale: 0, duration: 0.9, stagger: 0.12, ease: "back.out(2.6)" }, 1.2)
    .from(q(".hero-scroll"), { opacity: 0, y: -14, duration: 0.6 }, 1.6)
    .add(() => {
      gsap.to(q(".hero-scroll"), { y: 7, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
  return tl;
}

/* ---------- Textos de cada sección: cada tipo entra a su manera ---------- */
export function construirTextos(textos) {
  const tl = gsap.timeline({ paused: true });
  textos.forEach((el, i) => {
    const t = i * 0.08;
    if (el.matches(".eyebrow")) {
      tl.from(el, { opacity: 0, x: -20, letterSpacing: "0.5em", duration: 0.9, ease: "power3.out" }, t);
    } else if (el.matches("h1, h2")) {
      tl.fromTo(
        el,
        { opacity: 0, yPercent: 35, clipPath: "inset(0% 0% 100% 0%)" },
        { opacity: 1, yPercent: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1, ease: "power4.out", clearProps: "clipPath" },
        t,
      );
      const em = el.querySelectorAll("em");
      if (em.length) tl.to(em, { backgroundSize: SUBRAYADO, duration: 0.8, ease: "power2.inOut" }, t + 0.65);
    } else if (el.matches(".btn, .hero-actions, a.text-link")) {
      tl.from(el, { opacity: 0, y: 18, scale: 0.92, duration: 0.7, ease: "back.out(2.2)" }, t);
    } else {
      tl.from(el, { opacity: 0, y: 28, duration: 0.85, ease: "power3.out" }, t);
    }
  });
  return tl;
}

/* ---------- Piezas que caen sobre la mesa, se aplastan un poco y sueltan harina ---------- */
export function aterrizar(lote, capaPolvo) {
  lote.forEach((el, i) => {
    const tl = gsap.timeline({ delay: i * 0.11 });
    tl.set(el, { transition: "none", transformOrigin: "50% 100%" })
      .fromTo(
        el,
        { y: -110, opacity: 0, rotation: gsap.utils.random(-6, 6) },
        { y: 0, opacity: 1, rotation: 0, duration: 0.55, ease: "power2.in" },
      )
      .to(el, { scaleY: 0.94, scaleX: 1.03, duration: 0.08, ease: "power1.out" })
      .add(() => polvo(el, capaPolvo), "<")
      .to(el, { scaleY: 1, scaleX: 1, duration: 0.7, ease: "elastic.out(1, 0.38)" })
      .set(el, { clearProps: "transform,transition,transformOrigin" });
  });
}

let polvosActivos = 0;
export function polvo(el, capa) {
  if (!capa || polvosActivos > 6) return;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  polvosActivos += 1;
  const lote = [];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("i");
    capa.appendChild(p);
    lote.push(p);
  }
  const lado = (i) => (i % 2 === 0 ? -1 : 1);
  gsap.set(lote, {
    x: (i) => (lado(i) < 0 ? r.left + 8 : r.right - 8),
    y: r.bottom - 4,
    scale: () => gsap.utils.random(0.5, 1.1),
    opacity: 0.9,
  });
  gsap.to(lote, {
    x: (i) => `+=${lado(i) * gsap.utils.random(20, 70)}`,
    y: () => `-=${gsap.utils.random(10, 45)}`,
    scale: () => gsap.utils.random(1.6, 3),
    opacity: 0,
    duration: () => gsap.utils.random(0.7, 1.1),
    ease: "power2.out",
    onComplete: () => {
      lote.forEach((p) => p.remove());
      polvosActivos -= 1;
    },
  });
}

/* ---------- Parallax suave de fotos (object-position: no rompe los recortes) ---------- */
export function parallax(main) {
  main.querySelectorAll(".hero-photo img").forEach((img) => {
    gsap.fromTo(
      img,
      { objectPosition: "50% 50%" },
      {
        objectPosition: "50% 85%",
        ease: "none",
        scrollTrigger: { trigger: img.closest("section") || img, start: "top top", end: "bottom top", scrub: 0.6 },
      },
    );
  });
  main.querySelectorAll(".story-photo img, .class-feature > img").forEach((img) => {
    gsap.fromTo(
      img,
      { objectPosition: "50% 20%" },
      {
        objectPosition: "50% 80%",
        ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  });
}

/* ---------- Tarjetas que se inclinan hacia el mouse ---------- */
const INCLINABLES = ".category-card, .editorial-card";
export function inclinarTarjetas(raiz) {
  let actual = null;
  const mover = (e) => {
    if (e.pointerType !== "mouse") return;
    const card = e.target.closest?.(INCLINABLES);
    if (actual && actual !== card) soltar(actual);
    actual = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, {
      rotationY: px * 9,
      rotationX: -py * 7,
      transformPerspective: 900,
      transformOrigin: "50% 50%",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  };
  const soltar = (card) =>
    gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
  const salir = () => {
    if (actual) soltar(actual);
    actual = null;
  };
  raiz.addEventListener("pointermove", mover, { passive: true });
  raiz.addEventListener("pointerleave", salir);
  return () => {
    raiz.removeEventListener("pointermove", mover);
    raiz.removeEventListener("pointerleave", salir);
  };
}
