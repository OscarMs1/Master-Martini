import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Chef from "./Chef";
import { cuandoCocinaLista, puedeAnimar } from "./estado";
import { aterrizar, construirTextos, inclinarTarjetas, parallax, revelarHero } from "./efectos";

gsap.registerPlugin(ScrollTrigger);

// Piezas que los cocineros "colocan" una a una, como platos en la mesa.
const ITEMS =
  ".product-card, .category-card, .editorial-card, .class-card, .benefit, .story-photo, .novedad-card";
// Textos que se "sirven" al entrar cada sección.
const TEXTOS =
  "h1, h2, .eyebrow, .section-heading > p, .story-copy > *, .class-feature-copy > *, .offer-inner > *, .lead";

const FRASES = {
  bandeja: ["¡Mamma mia!", "¡Perfetto!", "¡Ecco qua!", "¡Bellissimo!", "¡Che bontà!"],
  rodillo: ["¡Avanti!", "¡Forza, forza!", "¡Andiamo!", "¡Al dente!"],
  pareja: ["¡Pane fresco!", "¡Attenzione!", "¡Permesso!", "¡Arriva il pane!"],
};
const VARIANTES = ["bandeja", "rodillo", "pareja"];

const NOMBRES_RUTA = {
  "": "Inicio",
  nosotros: "Nosotros",
  catalogo: "Productos",
  producto: "Producto",
  ofertas: "Ofertas",
  clases: "Clases",
  novedades: "Novedades",
  contacto: "Contacto",
  login: "Tu cuenta",
  registro: "Tu cuenta",
  "mi-cuenta": "Tu cuenta",
  carrito: "Carrito",
  checkout: "Pago",
  admin: "Administración",
  creditos: "Créditos",
};

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

export default function CocinerosPagina() {
  const { pathname } = useLocation();
  const corredor = useRef(null);
  const barra = useRef(null);
  const puertas = useRef(null);
  const polvoCapa = useRef(null);
  const despedida = useRef(null);
  const rutaPuertas = useRef(null);
  const rutaConstruida = useRef(null);
  const estado = useRef({ ocupado: false, contador: 0, ultimo: 0 });
  const animar = puedeAnimar();

  /* ---------- Marca global: el CSS solo prepara estados iniciales si hay animación ---------- */
  useEffect(() => {
    if (!animar) return undefined;
    document.documentElement.classList.add("mm-anim");
    return () => document.documentElement.classList.remove("mm-anim");
  }, [animar]);

  /* ---------- Cocinero corredor: cruza la pantalla "entregando" la sección ---------- */
  function entregar() {
    const raiz = corredor.current;
    const e = estado.current;
    const ahora = Date.now();
    if (!raiz || e.ocupado || ahora - e.ultimo < 2600 || window.innerWidth < 576) return;
    e.ocupado = true;
    e.ultimo = ahora;
    e.contador += 1;

    const variante = VARIANTES[(e.contador - 1) % VARIANTES.length];
    const alDerecha = e.contador % 2 === 1;
    const chef = raiz.querySelector(".chef-corredor");
    const giro = raiz.querySelector(".chef-giro");
    const burbuja = raiz.querySelector(".chef-burbuja");
    raiz.querySelectorAll(".runner-v").forEach((v) => v.classList.toggle("activo", v.dataset.v === variante));
    const activo = raiz.querySelector(`.runner-v[data-v="${variante}"]`);
    const svgs = [...activo.querySelectorAll("svg")];
    burbuja.textContent = azar(FRASES[variante]);

    const ancho = window.innerWidth;
    const anchoChef = activo.offsetWidth || 130;
    const inicio = alDerecha ? -anchoChef - 40 : ancho + 40;
    const parada = ancho * gsap.utils.random(0.3, 0.6);
    const fin = alDerecha ? ancho + 40 : -anchoChef - 40;

    gsap.set(raiz, { autoAlpha: 1 });
    gsap.set(giro, { scaleX: alDerecha ? 1 : -1 });
    gsap.set(burbuja, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 100%" });

    // Ciclo de carrera para cada cocinero (la pareja va levemente desfasada)
    const patas = gsap.timeline({ repeat: -1 });
    svgs.forEach((svg, j) => {
      const d = j * 0.08;
      const sel = (c) => svg.querySelector(c);
      patas
        .fromTo(sel(".chef-legL"), { rotation: -32, svgOrigin: "51 112" }, { rotation: 32, svgOrigin: "51 112", duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" }, d)
        .fromTo(sel(".chef-legR"), { rotation: 32, svgOrigin: "71 112" }, { rotation: -32, svgOrigin: "71 112", duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" }, d)
        .fromTo(svg.querySelectorAll(".chef-body, .chef-head, .chef-toque"), { y: 0 }, { y: -4, duration: 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" }, d);
      if (variante !== "pareja") {
        patas.fromTo(sel(".chef-armL"), { rotation: 30, svgOrigin: "30.5 68" }, { rotation: -30, svgOrigin: "30.5 68", duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" }, d);
      }
    });
    if (variante === "bandeja") gsap.set(svgs[0].querySelector(".chef-armR"), { rotation: -75, svgOrigin: "94.5 68" });
    if (variante === "rodillo") {
      patas.fromTo(svgs[0].querySelector(".chef-armR"), { rotation: -165, svgOrigin: "94.5 68" }, { rotation: -125, svgOrigin: "94.5 68", duration: 0.16, yoyo: true, repeat: 1 }, 0);
    }
    if (variante === "pareja") {
      svgs.forEach((svg) => gsap.set(svg.querySelectorAll(".chef-armL, .chef-armR"), { rotation: 0 }));
      patas.fromTo(activo.querySelector(".baguette"), { y: 0 }, { y: -4, duration: 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0);
    }

    const piernas = svgs.flatMap((s) => [...s.querySelectorAll(".chef-legL, .chef-legR")]);
    const cuerpos = svgs.flatMap((s) => [...s.querySelectorAll(".chef-body, .chef-head, .chef-toque")]);
    const toques = svgs.map((s) => s.querySelector(".chef-toque"));

    gsap
      .timeline()
      .fromTo(chef, { x: inicio }, { x: parada, duration: 1.15, ease: "power1.out" })
      .add(() => patas.pause())
      .to(piernas, { rotation: 0, duration: 0.2 })
      .to(burbuja, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, "<")
      .add(() => chispas(raiz, parada + anchoChef / 2), "<0.1")
      .to(cuerpos, { y: -12, duration: 0.17, yoyo: true, repeat: 3, ease: "sine.out" }, "<")
      .to(toques, { rotation: -14, y: -8, svgOrigin: "62 30", duration: 0.2, yoyo: true, repeat: 1, ease: "back.out(3)" }, "<0.1")
      .to(burbuja, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, "+=0.65")
      .add(() => patas.play(), "<")
      .to(chef, { x: fin, duration: 1.05, ease: "power1.in" }, "<0.05")
      .add(() => {
        patas.kill();
        gsap.set(raiz, { autoAlpha: 0 });
        estado.current.ocupado = false;
      });
  }

  // Harina y chispas doradas al "servir"
  function chispas(raiz, x) {
    const capa = raiz.querySelector(".chef-chispas");
    const lote = [];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("i");
      p.className = i % 3 === 0 ? "oro" : "";
      capa.appendChild(p);
      lote.push(p);
    }
    gsap.set(lote, { x, y: -110 });
    gsap.to(lote, {
      x: () => x + gsap.utils.random(-120, 120),
      y: () => gsap.utils.random(-230, -70),
      scale: () => gsap.utils.random(0.6, 1.9),
      opacity: 0,
      duration: 1.15,
      ease: "power2.out",
      stagger: 0.015,
      onComplete: () => lote.forEach((p) => p.remove()),
    });
  }

  /* ---------- Puertas de cocina al cambiar de página ---------- */
  useLayoutEffect(() => {
    if (!animar || !puertas.current) return undefined;
    // Solo al navegar a OTRA ruta (no en la primera carga ni en el doble montaje de StrictMode)
    const previa = rutaPuertas.current;
    rutaPuertas.current = pathname;
    if (!previa || previa === pathname) return undefined;
    const q = gsap.utils.selector(puertas.current);
    const nombre = NOMBRES_RUTA[pathname.split("/")[1] || ""] || "Master Martini";
    q(".pr-texto")[0].textContent = nombre;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .set(puertas.current, { autoAlpha: 1 })
        .set(q(".pr-izq"), { xPercent: 0 })
        .set(q(".pr-der"), { xPercent: 0 })
        .fromTo(q(".pr-centro"), { scale: 0.6, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(2.5)" })
        .to(q(".chef-toque"), { rotation: -12, y: -6, svgOrigin: "62 30", duration: 0.18, yoyo: true, repeat: 1 }, "<0.1")
        .to(q(".pr-centro"), { opacity: 0, scale: 0.9, duration: 0.18 }, "+=0.05")
        .to(q(".pr-izq"), { xPercent: -101, duration: 0.6, ease: "power3.inOut" }, "<0.04")
        .to(q(".pr-der"), { xPercent: 101, duration: 0.6, ease: "power3.inOut" }, "<")
        .set(puertas.current, { autoAlpha: 0 });
    }, puertas);
    return () => ctx.revert();
  }, [pathname, animar]);

  /* ---------- "Construcción" de la página ---------- */
  useLayoutEffect(() => {
    if (!animar) return undefined;
    const main = document.getElementById("contenido");
    if (!main) return undefined;

    const previa = rutaConstruida.current;
    rutaConstruida.current = pathname;
    const esPrimera = !previa || previa === pathname;
    const retraso = esPrimera ? 0 : 450; // deja que las puertas se abran primero

    let cancelado = false;
    let mo;
    let temporizador;
    let espera;
    let quitarInclinacion = () => {};

    const ctx = gsap.context(() => {}, main);
    const hechos = new WeakSet();

    const textosDe = (seccion) => {
      if (seccion.classList.contains("hero")) return;
      const textos = [...seccion.querySelectorAll(TEXTOS)].filter(
        (el) => !hechos.has(el) && !el.closest(ITEMS) && !el.closest(".hero"),
      );
      if (!textos.length) return;
      textos.forEach((el) => hechos.add(el));
      const tl = construirTextos(textos);
      ScrollTrigger.create({
        trigger: seccion,
        start: "top 86%",
        once: true,
        onEnter: () => {
          tl.play();
          entregar();
        },
      });
    };

    const itemsDe = (items) => {
      const nuevos = items.filter((el) => !hechos.has(el));
      if (!nuevos.length) return;
      nuevos.forEach((el) => hechos.add(el));
      gsap.set(nuevos, { opacity: 0 });
      ScrollTrigger.batch(nuevos, {
        start: "top 92%",
        once: true,
        batchMax: 4,
        interval: 0.12,
        onEnter: (lote) => aterrizar(lote, polvoCapa.current),
      });
    };

    let parallaxHecho = false;
    const escanear = () => {
      if (cancelado) return;
      ctx.add(() => {
        const hero = main.querySelector(".hero");
        if (hero && !hechos.has(hero)) {
          hechos.add(hero);
          revelarHero(hero);
        }
        main.querySelectorAll("section, .page-hero, .section").forEach(textosDe);
        itemsDe([...main.querySelectorAll(ITEMS)]);
        if (!parallaxHecho) {
          parallaxHecho = true;
          parallax(main);
        }
      });
      ScrollTrigger.refresh();
    };

    const quitarEspera = cuandoCocinaLista(() => {
      espera = setTimeout(() => {
        if (cancelado) return;
        escanear();
        quitarInclinacion = inclinarTarjetas(main);
        // Contenido que llega después desde la API (productos, novedades, clases…)
        mo = new MutationObserver(() => {
          clearTimeout(temporizador);
          temporizador = setTimeout(escanear, 120);
        });
        mo.observe(main, { childList: true, subtree: true });
      }, retraso);
    });

    return () => {
      cancelado = true;
      quitarEspera();
      clearTimeout(espera);
      clearTimeout(temporizador);
      mo?.disconnect();
      quitarInclinacion();
      ctx.revert();
    };
  }, [pathname, animar]);

  /* ---------- Barra de progreso y despedida de los cocineros en el footer ---------- */
  useEffect(() => {
    if (!animar || !barra.current) return undefined;
    const ctx = gsap.context(() => {
      const st = { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.4 };
      gsap.to(barra.current.querySelector(".progreso-relleno"), { scaleX: 1, ease: "none", scrollTrigger: st });
      gsap.to(barra.current.querySelector(".progreso-toque"), { left: "100%", ease: "none", scrollTrigger: { ...st } });

      const footer = document.querySelector(".site-footer");
      const caja = despedida.current;
      if (!footer || !caja || window.innerWidth < 576) return;
      const chefs = caja.querySelectorAll(".despedida-chef");
      const brazos = caja.querySelectorAll(".chef-armR");
      const burbuja = caja.querySelector(".chef-burbuja");
      let saludo;
      const entrada = gsap
        .timeline({ paused: true })
        .set(caja, { autoAlpha: 1 })
        .fromTo(chefs, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.12, ease: "back.out(1.8)" })
        .fromTo(burbuja, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, "-=0.2");
      ScrollTrigger.create({
        trigger: footer,
        start: "top 80%",
        onEnter: () => {
          entrada.timeScale(1).play();
          saludo?.kill();
          saludo = gsap.fromTo(
            brazos,
            { rotation: -150, svgOrigin: "94.5 68" },
            { rotation: -110, svgOrigin: "94.5 68", duration: 0.22, repeat: 9, yoyo: true, stagger: 0.07, ease: "sine.inOut" },
          );
        },
        onLeaveBack: () => {
          saludo?.kill();
          entrada.timeScale(2).reverse();
        },
      });
    });
    return () => ctx.revert();
  }, [pathname, animar]);

  if (!animar) return null;

  return (
    <>
      <div className="progreso-cocina" ref={barra} aria-hidden="true">
        <span className="progreso-relleno" />
        <span className="progreso-toque">
          <svg viewBox="0 0 40 34" width="22" height="19">
            <g fill="#fff" stroke="#c1a01d" strokeWidth="2">
              <circle cx="11" cy="13" r="8" />
              <circle cx="20" cy="9" r="9" />
              <circle cx="29" cy="13" r="8" />
              <rect x="10" y="14" width="20" height="14" rx="2" />
            </g>
            <rect x="11" y="14" width="18" height="10" fill="#fff" />
          </svg>
        </span>
      </div>

      <div className="polvo-capa" ref={polvoCapa} aria-hidden="true" />

      <div className="puertas-ruta" ref={puertas} aria-hidden="true">
        <div className="pr-hoja pr-izq" />
        <div className="pr-hoja pr-der" />
        <div className="pr-centro">
          <Chef />
          <span className="pr-texto" />
        </div>
      </div>

      <div className="chef-pista" ref={corredor} aria-hidden="true">
        <div className="chef-chispas" />
        <div className="chef-corredor">
          <span className="chef-burbuja" />
          <div className="chef-giro">
            <div className="runner-v" data-v="bandeja"><Chef prop="bandeja" /></div>
            <div className="runner-v" data-v="rodillo"><Chef prop="rodillo" /></div>
            <div className="runner-v runner-pareja" data-v="pareja">
              <Chef />
              <span className="baguette" />
              <Chef />
            </div>
          </div>
        </div>
      </div>

      <div className="despedida" ref={despedida} aria-hidden="true">
        <span className="chef-burbuja">¡Grazie mille!</span>
        <div className="despedida-chef"><Chef /></div>
        <div className="despedida-chef"><Chef /></div>
        <div className="despedida-chef"><Chef /></div>
      </div>
    </>
  );
}
