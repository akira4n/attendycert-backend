const { z } = require('zod');

const registerParticipantSchema = z.object({
  name: z
    .string({ error: 'Name must be a string.' })
    .min(1, { error: 'Name is required.' })
    .max(255, { error: 'Name must not exceed 255 characters.' }),

  email: z.email({
    error: 'Invalid email address format.',
  }),

  custom_answers: z
    .preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z.record(z.string(), z.unknown(), {
        error: 'Custom answers must be an object.',
      }),
    )
    .optional()
    .default({}),
});

const buildDynamicFormSchema = (formSchema) => {
  if (!Array.isArray(formSchema) || formSchema.length === 0) {
    return z.object({});
  }

  const shape = {};

  formSchema.forEach((field) => {
    let fieldValidator;

    switch (field.type) {
      case 'number':
        fieldValidator = z.coerce.number({
          error: `${field.name} must be a number.`,
        });
        break;

      case 'select':
        if (Array.isArray(field.options) && field.options.length > 0) {
          fieldValidator = z.enum(field.options, {
            error: `Invalid option for ${field.name}. Allowed: ${field.options.join(', ')}`,
          });
        } else {
          fieldValidator = z.string({
            error: `${field.name} must be a string.`,
          });
        }
        break;

      case 'file':
        fieldValidator = z.url({
          error: `${field.name} must be a valid file URL.`,
        });
        break;

      case 'text':
      case 'textarea':
      default:
        fieldValidator = z.string({
          error: `${field.name} must be a string.`,
        });
        break;
    }

    if (field.required) {
      if (
        field.type === 'text' ||
        field.type === 'textarea' ||
        field.type === 'file'
      ) {
        fieldValidator = fieldValidator.min(1, {
          error: `${field.name} is required.`,
        });
      }
    } else {
      fieldValidator = fieldValidator.optional().nullable();
    }

    shape[field.name] = fieldValidator;
  });

  return z.object(shape);
};

const checkInSchema = z.object({
  ticket_id: z.uuid({ error: 'Invalid ticket ID format.' }),
});

module.exports = {
  registerParticipantSchema,
  buildDynamicFormSchema,
  checkInSchema,
};
