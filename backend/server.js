require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const { Pool } = require('pg');

// Inicializar app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a PostgreSQL (Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Verificar conexión
pool.connect()
  .then(client => {
    console.log('🔵 Conectado a PostgreSQL correctamente');
    client.release();
  })
  .catch(err => console.error('❌ Error conectando a PostgreSQL:', err));

// Ruta base de prueba
app.get('/api', (req, res) => {
  res.send('API de BydLight Solutions funcionando correctamente 🚀');
});

// Ruta para enviar formulario de contacto
app.post('/api/contact', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Por favor completa todos los campos.' });
  }

  try {
    // Guardar en DB
    await pool.query(
      'INSERT INTO contactos_bydlight (nombre, email, mensaje) VALUES ($1, $2, $3)',
      [nombre, email, mensaje]
    );
    console.log('✅ Mensaje guardado en la base de datos');

    // Configurar transporte
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar correo a ti
    await transporter.sendMail({
      from: `"Web BydLight Solutions" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: 'Nuevo mensaje de contacto',
      html: `
        <h3>Nuevo mensaje desde el sitio web</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br>${mensaje}</p>
      `,
    });

    // Auto respuesta al cliente
    await transporter.sendMail({
      from: `"BydLight Solutions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Gracias por tu mensaje!',
      html: `
        <h3>Hola ${nombre},</h3>
        <p>Gracias por contactarte con <strong>BydLight Solutions</strong>. Hemos recibido tu mensaje y pronto te responderemos.</p>
        <p>Un saludo cordial,<br>Equipo BydLight Solutions</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('❌ Error en /api/contact:', error);
    res.status(500).json({ error: 'Hubo un error al enviar tu mensaje. Intenta nuevamente.' });
  }
});

// Frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
