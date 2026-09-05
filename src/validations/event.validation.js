const { z } = require('zod');

const formFieldSchema = z.object({
  name: z.string({ error: 'Field name is required.' }).min(1),
  label: z.string({ error: 'Field label is required.' }).min(1),
  type: z.enum(['text', 'textarea', 'number', 'select', 'file'], {
    error: 'Field type must be one of: text, textarea, number, select, file.',
  }),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

const eventSchema = z.object({
  title: z
    .string({ error: 'Title must be a string' })
    .min(1, { error: 'Title is required.' })
    .max(255, { error: 'Title must not exceed 255 characters.' }),

  slug: z
    .string({ error: 'Slug must be a string.' })
    .min(1, { error: 'Slug is required.' })
    .max(255, { error: 'Slug must not exceed 255 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error:
        'Slug may only contain lowercase letters, numbers, and single hyphens.',
    }),

  registration_deadline: z.iso
    .datetime({
      offset: false,
      error: 'Registration deadline must be a valid UTC date-time.',
    })
    .nullable()
    .optional(),

  max_quota: z
    .int({ error: 'Max quota must be an integer.' })
    .positive({ error: 'Max quota must be a positive integer.' })
    .nullable()
    .optional(),

  form_schema: z.array(formFieldSchema).optional().default([]),
});

module.exports = {
  eventSchema,
};
