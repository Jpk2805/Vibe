import { TreeItem } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { string } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function convertFilesToTreeItems(
  files: { [path: string]: string },
  workspaceRoot = "/home/user"
): TreeItem[] {

  interface TreeNode {
    [key: string]: TreeNode | null
  }

  const tree: TreeNode = {}

  const normalizePath = (path: string) =>
    path
      .replace(workspaceRoot, "")   // remove workspace root
      .replace(/^\/+/, "")           // remove leading slashes

  const sortedPaths = Object.keys(files)
    .map(normalizePath)
    .filter(Boolean)
    .sort()

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/")
    let current = tree

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part] as TreeNode   // ✅ FIX
    }

    const fileName = parts[parts.length - 1]
    current[fileName] = null
  }

  function convertNode(node: TreeNode): TreeItem[] {
    return Object.entries(node).map(([key, value]) => {
      if (value === null) {
        return key // file
      }
      return [key, ...convertNode(value)] // folder
    })
  }

  return convertNode(tree)
}
