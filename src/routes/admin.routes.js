const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validations/auth.validation');

router.post('/login', validate(loginSchema), adminController.login);

module.exports = router;
