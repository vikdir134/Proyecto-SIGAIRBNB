const express = require('express');
const router = express.Router();

const {
  registrar
} = require('../controllers/auth.controller');

router.post('/register', registrar);

module.exports = router;