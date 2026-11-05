import { Wheat, ChefHat, Sparkles } from "lucide-react";
export default function Beneficios() {
  return (
    <section className="benefits">
      <div className="container-xl row mx-auto g-4">
        {[
          [
            Wheat,
            "Ingredientes con propósito",
            "Una selección para distintas técnicas y preparaciones.",
          ],
          [
            ChefHat,
            "Inspiración que se comparte",
            "Explora recetas y aprende en nuestras clases.",
          ],
          [
            Sparkles,
            "Tu oficio, en el centro",
            "Descubre soluciones para dar forma a tus ideas.",
          ],
        ].map(([Icon, title, text]) => (
          <div className="col-md-4 benefit" key={title}>
            <Icon size={30} strokeWidth={1.2} />
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
