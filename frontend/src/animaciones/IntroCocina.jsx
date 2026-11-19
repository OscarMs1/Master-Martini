import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Chef from "./Chef";
import { marcarCocinaLista, puedeAnimar } from "./estado";

const CLAVE = "mm-intro-cocina";

function yaVista() {
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}
function recordar() {
  try {
    sessionStorage.setItem(CLAVE, "1");
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

const MENSAJES = [
  "Amasando la página…",
  "Añadiendo los ingredientes…",
  "Horneando a fuego lento…",
  "¡Buon appetito!",
];

/**
 * Pantalla de entrada: tres cocineros italianos "preparan" la página
 * (uno amasa, otro bate, otro lanza harina) y las puertas de la cocina se abren.
 * Solo aparece una vez por sesión, se puede saltar y respeta prefers-reduced-motion.
 */
export default function IntroCocina() {
  const [visible, setVisible] = useState(() => puedeAnimar() && !yaVista());
  const raiz = useRef(null);
  const texto = useRef(null);
  const salirRef = useRef(null);

  // Si no hay intro, la portada puede construirse de inmediato.
  useEffect(() => {
    if (!visible) marcarCocinaLista();
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible || !raiz.current) return undefined;
    recordar();
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(raiz.current);
      const cierre = () => {
        document.body.style.overflow = previo;
        setVisible(false);
      };

      // Entrada
      gsap.from(q(".intro-marca"), { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(q(".intro-chef"), {
        y: -420,
        opacity: 0,
        duration: 0.9,
        ease: "bounce.out",
        stagger: 0.18,
      });
      gsap.from(q(".intro-mesa"), { scaleX: 0, duration: 0.7, ease: "power3.out" });

      // Cocinero 1: amasa (brazos alternados + masa que se aplasta)
      const c1 = q(".intro-chef--masa")[0];
      gsap.to(c1.querySelector(".chef-armL"), { rotation: -38, svgOrigin: "30.5 68", duration: 0.32, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(c1.querySelector(".chef-armR"), { rotation: 38, svgOrigin: "94.5 68", duration: 0.32, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.32 });
      gsap.to(c1.querySelector(".intro-masa"), { scaleY: 0.55, scaleX: 1.12, duration: 0.32, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Cocinero 2: bate con energía
      const c2 = q(".intro-chef--batir")[0];
      gsap.to(c2.querySelector(".chef-armR"), { rotation: -62, svgOrigin: "94.5 68", duration: 0.5, ease: "power2.out" });
      gsap.to(c2.querySelector(".chef-prop"), { rotation: 18, svgOrigin: "98 100", duration: 0.12, repeat: -1, yoyo: true, ease: "none" });
      gsap.to(c2.querySelector(".chef-armL"), { rotation: 10, svgOrigin: "30.5 68", duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Cocinero 3: lanza harina
      const c3 = q(".intro-chef--harina")[0];
      const brazo3 = c3.querySelector(".chef-armR");
      const harinaTl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
      harinaTl
        .to(brazo3, { rotation: -150, svgOrigin: "94.5 68", duration: 0.35, ease: "power2.out" })
        .to(brazo3, { rotation: -40, svgOrigin: "94.5 68", duration: 0.22, ease: "power3.in" })
        .fromTo(
          q(".intro-harina i"),
          { x: 0, y: 0, opacity: 1, scale: 0.6 },
          {
            x: () => gsap.utils.random(20, 90),
            y: () => gsap.utils.random(-90, -20),
            opacity: 0,
            scale: () => gsap.utils.random(1, 2.4),
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.03,
          },
          "<",
        )
        .to(brazo3, { rotation: 0, svgOrigin: "94.5 68", duration: 0.3 });

      // Respiración de todos
      gsap.to(q(".chef-body, .chef-head"), { y: -2.5, duration: 0.45, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.07 });

      // Salida: saludo, puertas que se abren, se retira todo
      let saliendo = false;
      const principal = gsap.timeline({ delay: 0.5, onComplete: () => salir() });
      function salir() {
        if (saliendo) return;
        saliendo = true;
        principal.kill();
        const fin = gsap.timeline({ onComplete: cierre });
        fin
          .to(q(".intro-saltar"), { opacity: 0, duration: 0.2 }, 0)
          .to(q(".chef-toque"), { y: -16, rotation: -10, svgOrigin: "62 30", duration: 0.25, ease: "back.out(3)", stagger: 0.05 }, 0)
          .to(q(".intro-escena"), { opacity: 0, y: -30, duration: 0.45, ease: "power2.in" }, 0.45)
          .add(() => marcarCocinaLista(), 0.6)
          .to(q(".intro-puerta--izq"), { xPercent: -101, duration: 0.95, ease: "power4.inOut" }, 0.55)
          .to(q(".intro-puerta--der"), { xPercent: 101, duration: 0.95, ease: "power4.inOut" }, 0.55);
      }
      salirRef.current = salir;

      // Línea de tiempo principal con mensajes y barra
      principal.fromTo(q(".intro-barra span"), { scaleX: 0 }, { scaleX: 1, duration: 3, ease: "power1.inOut", transformOrigin: "0 50%" }, 0);
      MENSAJES.forEach((m, i) => {
        principal.call(() => {
          if (texto.current) texto.current.textContent = m;
        }, null, i * 0.9);
      });
      principal.to({}, { duration: 0.2 }, 3);
    }, raiz);

    const alTeclado = (e) => {
      if (e.key === "Escape") salirRef.current?.();
    };
    window.addEventListener("keydown", alTeclado);

    return () => {
      window.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = previo;
      ctx.revert();
    };
  }, [visible]);

  if (!visible) return null;

  const harina = Array.from({ length: 14 });
  return (
    <div className="intro-cocina" ref={raiz} role="status" aria-label="Preparando la página">
      <div className="intro-puerta intro-puerta--izq" aria-hidden="true" />
      <div className="intro-puerta intro-puerta--der" aria-hidden="true" />
      <div className="intro-escena">
        <p className="intro-marca">Master&nbsp;Martini</p>
        <div className="intro-chefs" aria-hidden="true">
          <div className="intro-chef intro-chef--masa">
            <Chef />
            <span className="intro-masa" />
          </div>
          <div className="intro-chef intro-chef--batir">
            <Chef prop="batidor" />
          </div>
          <div className="intro-chef intro-chef--harina">
            <Chef />
            <span className="intro-harina">
              {harina.map((_, i) => (
                <i key={i} />
              ))}
            </span>
          </div>
        </div>
        <div className="intro-mesa" aria-hidden="true" />
        <p className="intro-texto" ref={texto} aria-live="polite">
          {MENSAJES[0]}
        </p>
        <div className="intro-barra" aria-hidden="true">
          <span />
        </div>
      </div>
      <button type="button" className="intro-saltar" onClick={() => salirRef.current?.()}>
        Saltar intro
      </button>
    </div>
  );
}
