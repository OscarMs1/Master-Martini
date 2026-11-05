const fotos = [
  ["desayuno-artesanal.jpg", "Rhamely", "3oc8c28wzZg"],
  ["inicio-hojaldre.jpg", "Mathias Reding", "XUkn1jmPqPo"],
  ["masas-luminosas.jpg", "Nadya Spetnitskaya", "tOYiQxF9-Ys"],
  ["clase-croissant.jpg", "Kyle Hinkson", "teEeEXvLPhg"],
  ["editorial-laminado.jpg", "Jana Ohajdova", "aBtxRo-YlQs"],
  ["inicio-laminado.jpg", "Leandros Papakarmezis", "3WU4DPlOBVo"],
  ["nosotros-oficio.jpg", "DDP", "zqg6ctfkYuo"],
  ["categoria-gelato.jpg", "hai_gea", "dcd4jdc8IYA"],
  ["clase-gelato.jpg", "ANNIE HATUANH", "aaVmMVQ5BCA"],
  ["editorial-gelato.jpg", "Christiann Koepke", "b9xUX3HR5nQ"],
  ["editorial-chocolate.jpg", "Jordane Mathieu", "L-vFDcn0_cg"],
  ["clase-chocolate.jpg", "Tommaso Ubezio", "VVxzs6d054Q"],
  ["clase-pasteleria.jpg", "Arsham Baseri", "YdKH9p9Jmm8"],
  ["crema-montada.jpg", "Shine_ Photos", "qTxnsTSW5PE"],
  ["horneo-artesanal.jpg", "shraga kopstein", "wn8L0Exu3v8"],
  ["categoria-retail.jpg", "Mimi Thian", "TG77ANwm3MQ"],
  ["hero-panaderia.jpg", "Silvana Carlos", "0ZVnYrKAwzM"],
  ["inicio-cacao.jpg", "American Heritage Chocolate", "RQ4TXxFaaZc"],

  ["avellanas.jpg", "Anna Evans", "cKYy1DVQQ_w"],
  ["limon.jpg", "James Trenda", "91A3Ix8YSTY"],
  ["muffins.jpg", "Aurela Redenica", "E8UeXr81EhI"],
  ["frutos-rojos.jpg", "Anto Meneghini", "gQyTxSrctvw"],
  ["mejorante.jpg", "Tania Melnyczuk", "hicsLTRz0DA"],
  ["clase-muffins.jpg", "Taylor Grote", "LqkFX2Km1a0"],
  ["clase-tortas.jpg", "Mick Haupt", "2nWMRcJAwYw"],
  ["clase-postres.jpg", "Max Griss", "7xWaqDV9iKo"],
  ["clase-tartaletas.jpg", "Diliara Garifullina", "pm0tuojODh4"],
  ["avena.jpg", "Andrea Tummons", "UFQQkXV-jwU"],
  ["pistacho.jpg", "Theo Crazzolara", "Zo0TZax87Cc"],
  ["croissant-producto.jpg", "Jess Bailey", "4WuNM9Qcjpo"],
  ["sorbete.jpg", "Xinyu Li", "vaiAjxuxqVc"],
  ["soya.jpg", "Daniela Paola Alchapar", "w8VM3LgGu8k"],
  ["crema-culinaria.jpg", "Ala", "tktUuZ2YBKk"],

  ["croissants.jpg", "Mae Mu", "two-brown-croissants-m9pzwmxm2rk"],
  ["panaderia.jpg", "Mae Mu", "assorted-breads-in-basket-Emhz3miT6mo"],
  [
    "chocolate.jpg",
    "Tetiana Bykovets",
    "a-close-up-of-a-chocolate-bar-on-a-tray-ncdnv62-tc4",
  ],
  [
    "helado.jpg",
    "Courtney Cook",
    "person-holding-ice-cream-cone-with-ice-cream-UfHQv0s-_gk",
  ],
  [
    "amasado.jpg",
    "Victor Rodríguez Iglesias",
    "a-person-kneading-dough-on-top-of-a-counter-zTG8dSz10tQ",
  ],
  [
    "cocina.jpg",
    "Hendrik Morkel",
    "a-chef-preparing-food-in-a-restaurant-kitchen-DxO74ROLieI",
  ],
  ["gelateria.jpg", "Lama Roscu", "variety-of-ice-creams-Wpg3Qm0zaGk"],
  ["pasteleria.jpg", "Jennifer Pallian", "chocolate-cake-gRZYR210m0U"],
];
export default function Creditos() {
  return (
    <section className="container-xl section credits-page">
      <p className="eyebrow">QUIENES INSPIRAN ESTA EXPERIENCIA</p>
      <h1>
        Fotografías <em>y fuentes.</em>
      </h1>

      <div className="row g-4 my-4">
        <div className="col-sm-6 col-lg-3">
          <img className="credit-image" src="/assets/images/hero-chocolate-editorial.webp" alt="Composición editorial de chocolates sobre fondo claro utilizada en la portada" loading="lazy" />
          <p className="mt-2"><a href="/assets/images/hero-torta-fondo-final.png" target="_blank" rel="noreferrer">Portada principal · Ver imagen original ↗</a></p>
        </div>
        {fotos.map(([file, autor, slug]) => (
          <div className="col-sm-6 col-lg-3" key={file}>
            <img
              className="credit-image"
              src={`/assets/images/${file}`}
              alt={`Fotografía por ${autor}`}
              loading="lazy"
            />
            <p className="mt-2">
              <a
                href={`https://unsplash.com/photos/${slug}`}
                target="_blank"
                rel="noreferrer"
              >
                {autor} · Unsplash ↗
              </a>
            </p>
          </div>
        ))}
        <div className="col-sm-6 col-lg-3"><img className="credit-image" src="/assets/images/chef-gustavo-fring.jpg" alt="Pastelera decorando una torta" loading="lazy" /><p><a href="https://www.pexels.com/photo/3983575/">Gustavo Fring · Pexels ↗</a></p><a href="https://www.pexels.com/license/">Licencia Pexels</a></div>
        <div className="col-sm-6 col-lg-3">
          <img className="credit-image" src="https://mastermartini.cl/wp-content/uploads/2023/06/Margarinas-1.jpg" alt="Gran Master Hoja, fotografía oficial Master Martini Chile" loading="lazy" />
          <p className="mt-2"><a href="https://mastermartini.cl/pasteleria-y-panaderia/" target="_blank" rel="noreferrer">Margarina Gran Master Hoja · fuente oficial Master Martini Chile ↗</a></p>
        </div>
      </div>
      <p>
        Uso bajo la <a href="https://unsplash.com/license">licencia Unsplash</a>
        . Logo e información institucional:{" "}
        <a href="https://mastermartini.cl/">Master Martini Chile</a> y{" "}
        <a href="https://www.martiniprofessional.cl/master-martini/">
          Martini Professional
        </a>
        .
      </p>

    </section>
  );
}
