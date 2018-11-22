import level from 'level';
import crypto from 'crypto';

export default class Db {
  constructor(dbFile) {
    this.dbFile = dbFile;
    this.isClose = true;
  }

  _initDb(){
    if(this.isClose) {
      this.db = level(this.dbFile);
      this.isClose = false;
    }
  }

  async _closeDb(){
    await this.db.close();
    this.isClose = true;
  }

  _enc(str){
    return crypto.createHash('sha256').update(str,'utf8').digest('hex');
  }
  async _addCount(){
    this._initDb();
    const count = await this.db.get('user_count') || 0;
    await this.db.put('user_count',count+1);
    await this._closeDb();
  }
  async getCount(){
    this._initDb();
    const count = await this.db.get('user_count') || 0;
    await this._closeDb();
    return count;
  }
  async getUser(username) {
    this._initDb();
    const user = await this.db.get(username);
    await this._closeDb();
    return user;
  }
  async addUser(username,password){
    this._initDb();
    const encPw = this._enc(password);
    await this.db.put(username,encPw);
    await this._addCount();
    await this._closeDb();
  }

  verifyUser(username,password) {
    this._initDb();
    const hash = await this.db.get(username);
    await this._closeDb();
    if(!hash){
      return false;
    }
    const hashed = this._enc(password);
    return hash === hashed;
  }
}