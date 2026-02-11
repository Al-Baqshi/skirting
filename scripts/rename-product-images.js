#!/usr/bin/env node
/**
 * Renames image files in each product folder to {folder}-skirting-1.png, -2.png, etc.
 * SEO-friendly: same as folder name + "skirting" keyword. Order by alphabetical filename.
 */
const fs = require("fs")
const path = require("path")

const productDir = path.join(process.cwd(), "public", "product")
const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"]

const dirs = fs.readdirSync(productDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))

for (const dirEnt of dirs) {
  const dirPath = path.join(productDir, dirEnt.name)
  const folderName = dirEnt.name
  const baseName = `${folderName}-skirting`
  const files = fs.readdirSync(dirPath)
    .filter((f) => IMAGE_EXT.some((ext) => f.toLowerCase().endsWith(ext)))
    .sort()

  if (files.length === 0) continue

  // First pass: rename to __1, __2, etc. to avoid collisions
  const tempMoves = []
  for (let i = 0; i < files.length; i++) {
    const src = path.join(dirPath, files[i])
    const ext = path.extname(files[i])
    const temp = path.join(dirPath, `__${i + 1}${ext}`)
    fs.renameSync(src, temp)
    tempMoves.push({ temp, num: i + 1, ext })
  }

  // Second pass: rename __n to {folder}-skirting-{n}.ext
  for (const { temp, num, ext } of tempMoves) {
    const dest = path.join(dirPath, `${baseName}-${num}${ext}`)
    if (temp !== dest) {
      fs.renameSync(temp, dest)
    }
  }

  console.log(`${folderName}: renamed ${files.length} files to ${baseName}-1${path.extname(files[0]) || ".png"}, ...`)
}

console.log("Done.")
