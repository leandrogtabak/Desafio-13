import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

export class ContenedorFirebase {
  constructor(urlJson, urlDb, collection) {
    const serviceAccount = require(`../${urlJson}`);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: urlDb,
    });

    this.db = admin.firestore();
    this.query = this.db.collection(collection);
    console.log('Conectado a Firebase');
  }

  async save(itemData) {
    try {
      let doc = this.query.doc();
      await doc.create(itemData);

      console.log('item agregado');
    } catch (error) {
      console.log(error);
    }
  }
  async getAll() {
    try {
      const querySnapshot = await this.query.get();
      const allItems = [];
      querySnapshot.forEach((doc) => {
        allItems.push(doc.data());
      });
      return allItems.sort((a, b) => a.id - b.id);
    } catch (err) {
      console.log(err);
    }
  }
  async getById(id) {
    try {
      const doc = this.query.doc(id);
      const item = await doc.get();
      const response = item.data();
      console.log(response);
      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async updateById(id, updatedData) {
    try {
      const doc = this.query.doc(id);
      const item = await doc.get();
      await item.ref.update(updatedData);
      const itemUpdated = await doc.get();
      const response = itemUpdated.data();
      console.log(response);
      return response;
    } catch (err) {
      console.log(err);
    }
  }
  async deleteById(id) {
    try {
      const doc = this.query.doc(id);
      await doc.delete();
      console.log('Item deleted succesfully');
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAll() {
    try {
      const querySnapshot = await this.query.get();
      querySnapshot.forEach(async (doc) => {
        await doc.ref.delete();
      });
      console.log('Items deleted successfully');
    } catch (err) {
      console.log(err);
    }
  }
}
