package cl.mastermartini.config;
@org.springframework.stereotype.Component public class CatalogSeed implements org.springframework.boot.CommandLineRunner {
 private final org.springframework.jdbc.core.JdbcTemplate jdbc;private final com.fasterxml.jackson.databind.ObjectMapper mapper;
 public CatalogSeed(org.springframework.jdbc.core.JdbcTemplate jdbc,com.fasterxml.jackson.databind.ObjectMapper mapper){this.jdbc=jdbc;this.mapper=mapper;}
 @org.springframework.transaction.annotation.Transactional public void run(String...args)throws Exception{
 cl.mastermartini.service.SeedJson.load(jdbc,mapper,"productos","producto",r->r);
 cl.mastermartini.service.SeedJson.load(jdbc,mapper,"novedades","novedad",r->r);
 }
}
