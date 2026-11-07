package cl.mastermartini.config;
@org.springframework.stereotype.Component public class ClassSeed implements org.springframework.boot.CommandLineRunner{
 private final org.springframework.jdbc.core.JdbcTemplate jdbc;private final com.fasterxml.jackson.databind.ObjectMapper mapper;
 public ClassSeed(org.springframework.jdbc.core.JdbcTemplate jdbc,com.fasterxml.jackson.databind.ObjectMapper mapper){this.jdbc=jdbc;this.mapper=mapper;}
 @org.springframework.transaction.annotation.Transactional public void run(String...args)throws Exception{
 cl.mastermartini.service.SeedJson.load(jdbc,mapper,"clases","clase",r->{var d=new java.util.LinkedHashMap<>(r);d.put("capacidad",d.remove("cuposDisponibles"));var list=(java.util.List<java.util.Map<String,Object>>)d.remove("productos");d.put("productos_ids",list.stream().map(p->p.get("id").toString()).collect(java.util.stream.Collectors.joining(",")));d.put("retirado",false);d.put("fecha",java.sql.Timestamp.from(java.time.Instant.parse(d.get("fecha").toString())));return d;});
 }
}
