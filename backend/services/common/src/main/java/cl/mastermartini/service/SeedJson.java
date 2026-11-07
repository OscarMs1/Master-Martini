package cl.mastermartini.service;
import com.fasterxml.jackson.databind.ObjectMapper;import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;import org.springframework.jdbc.core.JdbcTemplate;import java.util.*;
public final class SeedJson {
 public static void load(JdbcTemplate jdbc,ObjectMapper mapper,String file,String table,java.util.function.Function<Map<String,Object>,Map<String,Object>> transform)throws Exception{
  if(jdbc.queryForObject("SELECT COUNT(*) FROM "+table,Long.class)>0)return;
  try(var in=SeedJson.class.getResourceAsStream("/"+file+".json")){
   List<Map<String,Object>> data=mapper.readValue(in,new com.fasterxml.jackson.core.type.TypeReference<>(){});
   for(var row:data){var mapped=transform.apply(row);var names=new ArrayList<>(mapped.keySet());new NamedParameterJdbcTemplate(jdbc).update("INSERT INTO "+table+" ("+String.join(",",names)+") VALUES ("+names.stream().map(n->":"+n).collect(java.util.stream.Collectors.joining(","))+")",mapped);}
  }
 }
}
