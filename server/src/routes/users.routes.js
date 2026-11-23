const express = require('express');
const bcrypt = require('bcryptjs');
const { state, persist, nextId } = require('../store');
const { requireAuth, requireRole } = require('../auth');
const { validate, createUserSchema, updateUserSchema } = require('../validate');

const router = express.Router();
router.use(requireAuth);

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt };
}

// List users (manager and up can view).
router.get('/', requireRole('manager', 'admin'), (req, res) => {
  res.json({ users: state.users.map(publicUser) });
});

// Create a user (admin only).
router.post('/', requireRole('admin'), validate(createUserSchema), (req, res) => {
  const { name, email, password, role } = req.body;
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'conflict', message: 'A user with this email already exists' });
  }
  const user = {
    id: nextId('usr', state.users),
    name, email,
    passwordHash: bcrypt.hashSync(password, 10),
    role, active: true,
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  persist();
  res.status(201).json({ user: publicUser(user) });
});

// Update role / active flag / name (admin only). Admins cannot deactivate themselves.
router.patch('/:id', requireRole('admin'), validate(updateUserSchema), (req, res) => {
  const user = state.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'not_found', message: 'User not found' });
  if (req.body.active === false && user.id === req.user.id) {
    return res.status(400).json({ error: 'invalid_operation', message: 'You cannot deactivate your own account' });
  }
  Object.assign(user, req.body);
  persist();
  res.json({ user: publicUser(user) });
});

module.exports = router;
