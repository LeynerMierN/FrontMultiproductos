// GET /api/mp/health — verificación pública para smoke tests.
// NO expone secretos: solo entorno, proveedor y banderas de configuración.
import { publicMpInfo } from "@/lib/server/mercadopago";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }
  try {
    return res.status(200).json({ ok: true, mp: publicMpInfo() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
