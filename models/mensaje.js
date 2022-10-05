//Schema mensaje para MongoDB

import mongoose from 'mongoose';

const mensajesCollection = 'mensajes';

const AuthorSchema = mongoose.Schema({
  email: { type: String, required: true, maxLength: 50 },
  nombre: { type: String, required: true, maxLength: 50 },
  apellido: { type: String, required: true, maxLength: 50 },
  edad: { type: String, required: true, maxLength: 3 },
  alias: { type: String, required: true, maxLength: 50 },
  avatar: { type: String, required: true, maxLength: 50 },
});

const mensajeSchema = new mongoose.Schema({
  author: { type: AuthorSchema },
  text: { type: String, required: true, maxLength: 500 },
  fyh: { type: String, required: true, maxLength: 50 },
  id: { type: Number, unique: true, required: true },
});

export const Mensaje = mongoose.model(mensajesCollection, mensajeSchema);
