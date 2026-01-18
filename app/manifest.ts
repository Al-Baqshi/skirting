import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Innovation Skirting NZ - Premium Skirting Boards",
    short_name: "Skirting NZ",
    description:
      "New Zealand's #1 skirting specialist. Premium LED skirting boards, aluminium skirting, and smart skirting at the best prices.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#f5a623",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
