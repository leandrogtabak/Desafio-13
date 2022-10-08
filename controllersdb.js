import mongoose from 'mongoose';
import { USER, PASS } from './DB/config.js';
let baseDeDatosConectada = false;

export function conectarDB(url, cb) {
  mongoose.connect(
    url,
    {
      serverSelectionTimeoutMS: 3000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin',
      auth: {
        username: USER,
        password: PASS,
      },
    },
    (err) => {
      if (!err) {
        baseDeDatosConectada = true;
      }
      if (cb != null) {
        cb(err);
      }
    }
  );
}
