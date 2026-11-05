import { useEffect, useState } from "react";
import { api } from "./api";
export default function useNovedades() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("/novedades").then(data => { if (active) setArticulos(data); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { articulos, loading, error };
}
