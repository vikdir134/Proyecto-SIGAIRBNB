const express = require('express');
const router = express.Router();

const {
  registrar,
  login
} = require('../controllers/auth.controller');

router.post('/register', registrar);
router.post('/login', login);

module.exports = router;