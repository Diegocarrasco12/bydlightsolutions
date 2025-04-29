const nodemailer = require('nodemailer');
const { saveContactMessage } = require('../models/contactModel');

const handleContactForm = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Por favor completa todos los campos.' });
  }

  try {
    // Guardar mensaje en base de datos
    const savedMessage = await saveContactMessage({ nombre, email, mensaje });

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Correo para ti
    await transporter.sendMail({
      from: `"Web BydLight Solutions" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: 'Nuevo mensaje de contacto',
      html: `
        <h3>Nuevo mensaje de contacto</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br>${mensaje}</p>
      `,
    });

    // Auto-respuesta
    await transporter.sendMail({
      from: `"BydLight Solutions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Gracias por tu mensaje',
      html: `
        <p>Hola ${nombre},</p>
        <p>Gracias por contactarte con BydLight Solutions. Hemos recibido tu mensaje y pronto nos comunicaremos contigo.</p>
        <p>Un saludo,<br>BydLight Solutions</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error en el controlador de contacto:', error);
    res.status(500).json({ error: 'Hubo un error al enviar el mensaje.' });
  }
};

module.exports = { handleContactForm };
