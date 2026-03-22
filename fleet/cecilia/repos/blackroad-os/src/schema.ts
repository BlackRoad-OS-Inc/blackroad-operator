import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const repoId = z.string().min(1, 'repo id required')

export const EnvironmentSchema = z.object({
  domain_root: z.string().min(1, 'domain_root required'),
  description: z.string().optional(),
})

export const ServiceSchema = z.object({
  repo: repoId,
  env: z.string().min(1, 'env required'),
  url: z.string().url('url must be valid'),
  health: z.string().optional(),
  depends: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export const ManifestSchema = z.object({
  version: z.string().min(1),
  repos: z.record(repoId),
  services: z.record(ServiceSchema),
  packs: z.array(z.string()),
  environments: z.record(EnvironmentSchema),
})

export type Manifest = z.infer<typeof ManifestSchema>

export const MANIFEST_PATH = path.join(process.cwd(), 'orchestra.yml')

export function loadManifest(customPath?: string): Manifest {
  const manifestPath = customPath ? path.resolve(customPath) : MANIFEST_PATH
  const raw = fs.readFileSync(manifestPath, 'utf-8')
  const data = yaml.load(raw)
  const parsed = ManifestSchema.safeParse(data)
  if (!parsed.success) {
    const formatted = parsed.error.errors.map((err) => `${err.path.length ? err.path.join('.') : 'root'}: ${err.message}`)
    throw new Error(`Invalid orchestra.yml\n${formatted.join('\n')}`)
  }
  return parsed.data
}

export function withContext(manifest: Manifest): Manifest {
  const resolved = { ...manifest }
  // TODO(orchestrator-next): enrich with GitOps sync targets and drift detection
  return resolved
}
