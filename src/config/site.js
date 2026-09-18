// Contenido editable de la tienda Vestiq.
// Cambia textos, promos y datos de contacto sin tocar componentes.

export const PROMOS = [
  "Envío gratis en pedidos seleccionados",
  "Nuevos artículos cada semana",
  "Paga al recibir tu pedido",
  "Garantía en todos los artículos",
];

export const HERO = {
  eyebrow: "Catálogo actualizado en tiempo real",
  title: "Todo lo que buscas, en un solo lugar.",
  subtitle:
    "Explora el catálogo, agrega al carrito y haz tu pedido en minutos. Stock y precios siempre al día.",
  primaryCta: { label: "Ver catálogo", href: "#catalogo" },
  secondaryCta: { label: "Ver destacados", href: "#destacados" },
};

export const PERKS = [
  { icon: "Truck", title: "Envío rápido", text: "Despacho ágil a todo el país" },
  { icon: "Banknote", title: "Paga al recibir", text: "Sin anticipos ni complicaciones" },
  { icon: "ShieldCheck", title: "Compra protegida", text: "Garantía en tus artículos" },
  { icon: "RefreshCcw", title: "Cambios fáciles", text: "7 días para cambios" },
];

export const STEPS = [
  {
    n: "1",
    title: "Explora el catálogo",
    text: "Filtra por disponibilidad o busca lo que necesitas.",
  },
  {
    n: "2",
    title: "Arma tu carrito",
    text: "Agrega artículos y ajusta cantidades a tu medida.",
  },
  {
    n: "3",
    title: "Finaliza tu pedido",
    text: "Regístralo en un clic y coordinamos la entrega.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "Pedí en la mañana y en la tarde ya me estaban contactando. Todo llegó perfecto.",
    name: "María C.",
    city: "Bogotá",
  },
  {
    quote: "Los precios del catálogo son los que pagué, sin sorpresas. Volveré a comprar.",
    name: "Andrés L.",
    city: "Medellín",
  },
  {
    quote: "El carrito es facilísimo de usar, hasta desde el celular hice mi pedido.",
    name: "Camila R.",
    city: "Cali",
  },
];

export const FAQS = [
  {
    q: "¿Cómo hago un pedido?",
    a: "Agrega artículos al carrito, abre el carrito y pulsa Finalizar pedido. Tu pedido queda registrado y te contactamos para coordinar pago y entrega.",
  },
  {
    q: "¿Cuáles son los métodos de pago?",
    a: "Puedes pagar al recibir tu pedido. Escríbenos para conocer los medios disponibles en tu ciudad.",
  },
  {
    q: "¿Cuánto demora el envío?",
    a: "Entre 1 y 4 días hábiles según tu ciudad. Te compartimos la guía de seguimiento al despachar.",
  },
  {
    q: "¿Los precios y el stock están actualizados?",
    a: "Sí. El catálogo se actualiza en tiempo real: si un artículo aparece disponible, lo tenemos.",
  },
  {
    q: "¿Aceptan cambios o devoluciones?",
    a: "Sí, dentro de los 7 días posteriores a la entrega. El artículo debe estar sin uso y con su empaque.",
  },
];

export const CONTACT = {
  whatsapp: "3000000000", // <-- reemplaza por tu número real
  whatsappText: "Hola Vestiq, quiero hacer un pedido",
  email: "hola@vestiq.shop",
};

export const FREE_SHIPPING_THRESHOLD = 99900;

export function whatsappLink(text) {
  const num = CONTACT.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text || CONTACT.whatsappText)}`;
}
