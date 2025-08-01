import { mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function ensureUploadDirectoriesExist() {
  const directories = [
    path.join(process.cwd(), "public", "uploads"),
    path.join(process.cwd(), "public", "uploads", "images"),
    path.join(process.cwd(), "public", "uploads", "videos"),
  ]

  for (const dir of directories) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}
