import { z } from 'zod'

const successShapeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
})

export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export type ApiError = z.infer<typeof errorEnvelopeSchema>['error']

export class ApiRequestError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiRequestError'
  }
}

/**
 * Every mock endpoint parses its own response through this before resolving,
 * so the frontend can never silently consume a shape that drifts from the
 * documented contract in Backend_API_Specification.md. The real client
 * (once a backend exists) should call this same helper on the raw fetch response.
 */
export function parseEnvelope<T extends z.ZodTypeAny>(dataSchema: T, payload: unknown): z.infer<T> {
  const success = successShapeSchema.safeParse(payload)
  if (success.success) return dataSchema.parse(success.data.data)

  const failure = errorEnvelopeSchema.safeParse(payload)
  if (failure.success) throw new ApiRequestError(failure.data.error.code, failure.data.error.message)

  throw new ApiRequestError('INVALID_ENVELOPE', 'Response did not match the expected API contract')
}
