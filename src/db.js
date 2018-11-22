import level from 'level';
import crypto from 'crypto';

export default class Db {
  constructor(dbFile) {
    this.dbFile = dbFile;
  }
  _openDb(){
    return level(this.dbFile);
  }
  async _closeDb(db){
    await db.close();
  }

  _enc(str){
    return crypto.createHash('sha256').update(str,'utf8').digest('hex');
  }
  async _exists(db,key) {
    let has = false;
    try{
      await db.get(key);
      has = true;
    }catch(e){
      if(e instanceof level.errors.NotFoundError){
        has = false;
      }
    }
    return has;
  }
  async _get(db,key,def) {
    const exists = await this._exists(key);
    if(exists) {
      return db.get(key);
    }
    if(!exists && def) {
      await db.put(key,def);
      return def;
    }
    return false;
  }
  async _addCount(db){
    const count = await this._get(db,'user_count',0);
    await db.put('user_count',count+1);
  }
  async getCount(){
    const db = this._openDb();
    const count = await this._get(db,'user_count',0);
    await this._closeDb(db);
    return count;
  }
  async getUser(username) {
    const db = this._openDb();
    const exists = await this._exists(db,username);
    if(!exists) {
      await this._closeDb(db);
      return false;
    }
    const user = await this._get(db,username);
    await this._closeDb(db);
    return user;
  }
  async addUser(username,password){
    const db = this._openDb();
    const encPw = this._enc(password);
    await db.put(username,encPw);
    await this._addCount(db);
    await this._closeDb(db);
  }

  async verifyUser(username,password) {
    const db = this._openDb();
    const hash = await this._get(db,username);
    await this._closeDb(db);
    if(!hash){
      return false;
    }
    const hashed = this._enc(password);
    return hash === hashed;
  }
}