package cl.mastermartini.dto;
import cl.mastermartini.dto.PedidoRequest.Item;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.util.List;
public record ReservaRequest(@NotBlank @Pattern(regexp="[a-fA-F0-9-]{36}")String key,boolean descontar,@NotEmpty @Size(max=100)List<@NotNull @Valid Item> items){}
