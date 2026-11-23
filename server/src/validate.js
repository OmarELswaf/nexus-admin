const { z } = require('zod');
const { ROLES } = require('./auth');

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  role: z.enum(ROLES).default('viewer'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  price: z.number().positive().max(1_000_000),
  stock: z.number().int().min(0).max(1_000_000),
});

// Middleware factory: validates req.body, returns 400 with field errors.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid request body',
        fields: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate, loginSchema, createUserSchema, updateUserSchema, updateOrderSchema, createProductSchema };
