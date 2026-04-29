const mongoose = require('mongoose');
const app = require('./app');
const { url } = require('./config/default');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await mongoose.connect(url);
    console.log('✅ MongoDB conectado');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error conectando DB:', error);
  }
};

startServer();