import mongoose from 'mongoose';

export class ContenedorMongoDb {
  constructor(url, model) {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');

    this.model = model;
  }

  async save(itemData) {
    try {
      const newItem = new this.model(itemData);
      const item = await newItem.save();
      console.log('Item saved successfully');
      console.log(item);
    } catch (err) {
      console.log(err);
    }
  }
  async getAll() {
    try {
      const items = await this.model.find().lean();
      return items;
    } catch (err) {
      console.log(err);
    }
  }

  async getById(id) {
    try {
      const items = await this.model.findById(id);
      return items;
    } catch (err) {
      console.log(err);
    }
  }

  async updateById(id, updatedData) {
    try {
      await this.model.findByIdAndUpdate(id, updatedData);
      const item = await this.model.findById(id);
      return item;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteById(id) {
    try {
      const item = await this.model.findByIdAndDelete(id);
      return item;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAll() {
    try {
      await this.model.deleteMany();
      console.log('Items deleted successfully');
    } catch (err) {
      console.log(err);
    }
  }
}
