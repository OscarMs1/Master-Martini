package cl.mastermartini.config;
import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import java.time.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class SeedData {
  private static String descripcionInicial(String nombre) {
    return switch (nombre) {
      case "Margarina para hojaldre" -> "Materia grasa para trabajar masas laminadas. Se utiliza en hojaldres y croissants, alternando capas de masa y margarina durante el plegado.";
      case "Crema para batir" -> "Crema para elaborar rellenos, acompañamientos y terminaciones de pastelería. Sigue las indicaciones del fabricante para su batido y conservación.";
      case "Cobertura de chocolate" -> "Chocolate para bañar, moldear y terminar preparaciones dulces. También permite elaborar ganaches y aportar contraste a tartas y postres.";
      case "Base para gelato" -> "Base para preparar helados y explorar combinaciones de sabores. Utilízala siguiendo las proporciones recomendadas para la mezcla.";
      case "Crema para decoración" -> "Crema para trabajar con manga y dar forma a terminaciones de tortas y postres. Una opción para practicar rosetones, bordes y rellenos.";
      case "Pasta sabor pistacho" -> "Pasta para incorporar el sabor del pistacho a helados, cremas y rellenos. Dosifica según la preparación y las indicaciones del producto.";
      case "Base para sorbete" -> "Ingrediente para preparar sorbetes y combinar frutas en repostería fría. Permite trabajar distintas propuestas de sabor siguiendo una receta equilibrada.";
      case "Crema culinaria" -> "Crema para integrar en salsas, sopas y otras preparaciones de cocina. Aporta una textura cremosa y acompaña sabores dulces o salados.";
      case "Croissant para hornear" -> "Piezas de masa laminada listas para llevar al horno según sus instrucciones. Una alternativa para servir croissants recién horneados en desayunos y meriendas.";
      case "Bebida vegetal de avena" -> "Bebida de avena para acompañar desayunos o incorporar a mezclas de cocina y repostería. Revisa su ficha para escoger la aplicación adecuada.";
      case "Bebida vegetal de soya" -> "Bebida de soya para servir sola o utilizar como ingrediente en preparaciones dulces y saladas.";
      default -> "Ingrediente para explorar nuevas propuestas de cocina y repostería.";
    };
  }

  @Bean
  @org.springframework.core.annotation.Order(0)
  CommandLineRunner seed(
      ProductoRepository productos,
      ClaseRepository clases,
      UsuarioRepository usuarios,
      PasswordEncoder encoder,
      @Value("${app.seed-enabled}") boolean enabled,
      @Value("${app.admin-email}") String email,
      @Value("${app.admin-password}") String password) {
    return args -> {
      if (!enabled) return;
      // Datos iniciales del catálogo; las descripciones son informativas.
      if (productos.count() == 0) {
        String[][] data = {
          {
            "Margarina para hojaldre", "panaderia", "1 kg", "5990", "10", "25", "croissants", "true"
          },
          {"Crema para batir", "panaderia", "1 L", "4590", "0", "40", "pasteleria", "true"},
          {"Cobertura de chocolate", "panaderia", "1 kg", "7690", "20", "16", "chocolate", "true"},
          {"Base para gelato", "gelateria", "1 L", "6490", "10", "15", "helado", "true"},
          {"Crema para decoración", "panaderia", "1 L", "5290", "15", "18", "pasteleria", "false"},
          {"Pasta sabor pistacho", "gelateria", "500 g", "12990", "0", "12", "gelateria", "false"},
          {"Base para sorbete", "gelateria", "1 kg", "8990", "5", "14", "helado", "false"},
          {"Crema culinaria", "food-service", "1 L", "4990", "0", "30", "cocina", "false"},
          {
            "Croissant para hornear",
            "food-service",
            "Caja de 12 unidades",
            "11990",
            "15",
            "10",
            "croissants",
            "false"
          },
          {"Bebida vegetal de avena", "retail", "1 L", "2990", "15", "32", "panaderia", "false"},
          {"Bebida vegetal de soya", "retail", "1 L", "2690", "0", "0", "bebida-soya-real", "false"}
        };
        for (String[] d : data) {
          Producto p = new Producto();
          p.setNombre(d[0]);
          p.setCategoria(d[1]);
          p.setFormato(d[2]);
          p.setPrecio(Long.parseLong(d[3]));
          p.setDescuento(Integer.parseInt(d[4]));
          p.setStock(Integer.parseInt(d[5]));
          p.setImagen(RenovacionIngredientes.rutaInicial(d[0], d[6]));
          p.setDestacado(Boolean.parseBoolean(d[7]));
          p.setDescripcion(descripcionInicial(d[0]));
          productos.save(p);
        }
      }
      if (clases.count() == 0) {
        String[][] data = {
          {
            "El arte del croissant",
            "Aprende a reconocer la consistencia de la masa, practicar pliegues y formar piezas de"
                + " hojaldre.",
            "croissants",
            "Presencial",
            "Intermedio",
            "3 horas",
            "12",
            "Margarina para hojaldre"
          },
          {
            "Gelato: textura y sabor",
            "Una introducción al equilibrio de ingredientes y al proceso de elaboración del"
                + " helado.",
            "gelateria",
            "Presencial",
            "Inicial",
            "2 horas",
            "8",
            "Base para gelato,Pasta sabor pistacho"
          },
          {
            "Pastelería de pequeños detalles",
            "Practica rellenos y terminaciones para dar personalidad a tu vitrina.",
            "pasteleria",
            "Online",
            "Inicial",
            "90 minutos",
            "30",
            "Crema para batir,Crema para decoración"
          },
          {
            "El lenguaje del chocolate",
            "Explora texturas y usos de coberturas en una preparación de pastelería.",
            "chocolate",
            "Online",
            "Intermedio",
            "2 horas",
            "20",
            "Cobertura de chocolate,Crema para batir"
          }
        };
        for (int n = 0; n < data.length; n++) {
          String[] d = data[n];
          Clase c = new Clase();
          c.setTitulo(d[0]);
          c.setDescripcion(d[1]);
          c.setImagen("/assets/images/" + d[2] + ".jpg");
          c.setModalidad(d[3]);
          c.setNivel(d[4]);
          c.setDuracion(d[5]);
          c.setCapacidad(Integer.parseInt(d[6]));
          c.setProductosIds(productos.findAll().stream().filter(p -> java.util.Arrays.asList(d[7].split(",")).contains(p.getNombre())).map(p -> p.getId().toString()).collect(java.util.stream.Collectors.joining(",")));
          c.setLugar(
              d[3].equals("Online")
                  ? "Aula virtual de demostración"
                  : "Taller académico, Santiago (referencial)");
          c.setFecha(
              LocalDate.now(ZoneId.of("America/Santiago"))
                  .plusDays(14 + n * 7)
                  .atTime(10, 0)
                  .atZone(ZoneId.of("America/Santiago"))
                  .toInstant());
          clases.save(c);
        }
      }
      if (!password.isBlank()
          && !usuarios.existsByEmail(email.toLowerCase(java.util.Locale.ROOT))) {
        if (password.length() < 8
            || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
          throw new IllegalArgumentException(
              "ADMIN_PASSWORD debe tener entre 8 y 72 bytes. Se recomienda usar 12 o más caracteres.");
        Usuario u = new Usuario();
        u.setNombre("Administrador");
        u.setEmail(email.toLowerCase(java.util.Locale.ROOT));
        u.setPasswordHash(encoder.encode(password));
        u.setRol("ADMINISTRADOR");
        u.setRun("12.345.678-5");
        u.setTelefono("+56912345678");
        u.setRegion("Metropolitana");
        u.setComuna("Santiago");
        u.setDireccion("Dirección académica 123");
        usuarios.save(u);
      }
    };
  }
}