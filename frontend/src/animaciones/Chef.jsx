import { forwardRef } from "react";

const PIEL = "#f2c7a0";
const BORDE = "#d9d2c0";

function Prop({ tipo }) {
  if (tipo === "bandeja") {
    return (
      <g className="chef-prop">
        <ellipse cx="90" cy="100" rx="28" ry="5" fill="#c5cac8" stroke="#9aa19e" />
        <rect x="76" y="86" width="12" height="11" rx="2" fill="#d9a36a" />
        <circle cx="82" cy="85" r="7" fill="#f7e3e8" />
        <rect x="92" y="86" width="12" height="11" rx="2" fill="#d9a36a" />
        <circle cx="98" cy="85" r="7" fill="#7a4a2b" />
        <circle cx="98" cy="78" r="2.5" fill="#c8102e" />
      </g>
    );
  }
  if (tipo === "batidor") {
    return (
      <g className="chef-prop">
        <line x1="88" y1="108" x2="104" y2="86" stroke="#9aa19e" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="108" cy="80" rx="6" ry="11" fill="none" stroke="#9aa19e" strokeWidth="2" transform="rotate(35 108 80)" />
        <ellipse cx="108" cy="80" rx="2.5" ry="11" fill="none" stroke="#9aa19e" strokeWidth="1.5" transform="rotate(35 108 80)" />
      </g>
    );
  }
  if (tipo === "rodillo") {
    return (
      <g className="chef-prop">
        <rect x="70" y="102" width="40" height="8" rx="4" fill="#d2a86b" stroke="#a37c42" />
        <rect x="64" y="104" width="8" height="4" rx="2" fill="#a37c42" />
        <rect x="108" y="104" width="8" height="4" rx="2" fill="#a37c42" />
      </g>
    );
  }
  return null;
}

/**
 * Cocinero italiano en SVG (toque, bigote y pañuelo tricolor).
 * Las clases .chef-armL/.chef-armR/.chef-legL/.chef-legR/.chef-toque/.chef-body
 * son los "huesos" que GSAP mueve.
 */
const Chef = forwardRef(function Chef({ prop = "ninguno", pañuelo = true, className = "" }, ref) {
  return (
    <svg
      ref={ref}
      className={`chef ${className}`}
      viewBox="0 0 130 170"
      width="130"
      height="170"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="chef-sombra" cx="62" cy="164" rx="30" ry="4" fill="rgba(0,0,0,.18)" />
      <g className="chef-legL">
        <rect x="44" y="112" width="14" height="44" rx="5" fill="#2d3a36" />
        <ellipse cx="50" cy="157" rx="11" ry="5" fill="#161d1b" />
      </g>
      <g className="chef-legR">
        <rect x="64" y="112" width="14" height="44" rx="5" fill="#2d3a36" />
        <ellipse cx="72" cy="157" rx="11" ry="5" fill="#161d1b" />
      </g>
      <g className="chef-armL">
        <rect x="24" y="66" width="13" height="40" rx="6.5" fill="#fff" stroke={BORDE} />
        <circle cx="30.5" cy="108" r="6.5" fill={PIEL} />
      </g>
      <g className="chef-body">
        <rect x="34" y="62" width="56" height="58" rx="11" fill="#fff" stroke={BORDE} strokeWidth="1.5" />
        <circle cx="52" cy="86" r="2.6" fill="#c1a01d" />
        <circle cx="52" cy="99" r="2.6" fill="#c1a01d" />
        <circle cx="72" cy="86" r="2.6" fill="#c1a01d" />
        <circle cx="72" cy="99" r="2.6" fill="#c1a01d" />
        {pañuelo && (
          <g>
            <polygon points="44,60 80,60 62,88" fill="#0b7a3b" />
            <polygon points="50,60 74,60 62,80" fill="#fff" />
            <polygon points="55,60 69,60 62,72" fill="#c8102e" />
          </g>
        )}
      </g>
      <g className="chef-head">
        <circle cx="62" cy="42" r="20" fill={PIEL} />
        <circle cx="50" cy="48" r="4" fill="#f09a8c" opacity=".45" />
        <circle cx="74" cy="48" r="4" fill="#f09a8c" opacity=".45" />
        <g className="chef-ojos">
          <circle cx="55" cy="40" r="2.2" fill="#2a1b14" />
          <circle cx="69" cy="40" r="2.2" fill="#2a1b14" />
        </g>
        <path d="M51 35 Q55 32 59 35" stroke="#2a1b14" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M65 35 Q69 32 73 35" stroke="#2a1b14" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="62" cy="46" r="4.2" fill="#e8ae86" />
        <path d="M62 50 C54 45 43 49 39 58 C45 54 54 56 62 53 C70 56 79 54 85 58 C81 49 70 45 62 50 Z" fill="#2a1b14" />
        <path d="M56 58 Q62 63 68 58" stroke="#8a3b2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      <g className="chef-toque">
        <g stroke={BORDE} strokeWidth="2">
          <circle cx="47" cy="16" r="12" fill="#fff" />
          <circle cx="62" cy="10" r="14" fill="#fff" />
          <circle cx="77" cy="16" r="12" fill="#fff" />
          <rect x="46" y="20" width="32" height="12" rx="3" fill="#fff" />
        </g>
        <rect x="47" y="19" width="30" height="12" fill="#fff" />
        <rect x="46" y="27" width="32" height="3" fill="#c1a01d" opacity=".85" />
      </g>
      <g className="chef-armR">
        <rect x="88" y="66" width="13" height="40" rx="6.5" fill="#fff" stroke={BORDE} />
        <circle cx="94.5" cy="108" r="6.5" fill={PIEL} />
        <Prop tipo={prop} />
      </g>
    </svg>
  );
});

export default Chef;
