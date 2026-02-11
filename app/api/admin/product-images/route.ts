import { NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { readdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif"]

function getProductDir(): string | null {
  const candidates = [
    join(process.cwd(), "public", "product"),
    join(process.cwd(), "..", "public", "product"),
  ]
  for (const dir of candidates) {
    if (existsSync(dir)) return dir
  }
  return null
}

export async function GET() {
  try {
    const isAuthenticated = await verifyAdminAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productDir = getProductDir()
    if (!productDir) {
      console.warn("product-images: directory not found; tried cwd:", process.cwd())
      return NextResponse.json({ folders: [] }, { status: 200 })
    }

    const entries = await readdir(productDir, { withFileTypes: true })
    const folders: Array<{ name: string; path: string; images: Array<{ name: string; url: string }> }> = []

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue

      try {
        const folderPath = join(productDir, entry.name)
        const files = await readdir(folderPath, { withFileTypes: true })

        const images: Array<{ name: string; url: string }> = []
        for (const file of files) {
          if (!file.isFile()) continue
          const idx = file.name.lastIndexOf(".")
          const ext = idx >= 0 ? file.name.slice(idx).toLowerCase() : ""
          if (!IMAGE_EXT.includes(ext)) continue

          const url = `/product/${encodeURIComponent(entry.name)}/${encodeURIComponent(file.name)}`
          images.push({ name: file.name, url })
        }
        images.sort((a, b) => a.name.localeCompare(b.name))
        folders.push({
          name: entry.name,
          path: `/product/${entry.name}`,
          images,
        })
      } catch (subErr) {
        console.warn("product-images: skip folder", entry.name, subErr)
      }
    }

    folders.sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ folders })
  } catch (err) {
    console.error("product-images error:", err)
    return NextResponse.json({ folders: [] }, { status: 200 })
  }
}
