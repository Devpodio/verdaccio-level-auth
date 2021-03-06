import assert from 'assert';
import Db from './db';
import { resolve, isAbsolute, dirname } from 'path';
/**
 * Level - Verdaccio auth class
 */
export default class Level {
  constructor(config = {},logger) {
    logger.info('[level-auth] initialized');
    config.file = isAbsolute(config.file) ? config.file: resolve(dirname(config.self_path),config.file);
    config.max_users = config.max_users === undefined ? Infinity : config.max_users;
    this.logger = logger;
    this.config = config;
    assert(this.config.file, 'missing "file" in config');
    this.db = new Db(this.config.file,this.logger);
  }
  _genErr(msg, status) {
    const err = new Error(msg);
    err.status = status;
    return err;
  }
  async _check(obj, action) {
    let verified, user;
    if (!obj.username || !obj.password) {
      return this._genErr('username and password is required', 400);
    }
    if (action === 'register') {
      user = await this.db.getUser(obj.username);
      if (user) {
        return this._genErr('username is already registered', 409);
      }
      if (this.config.max_users < 0) {
        return this._genErr('user registration disabled', 409);
      }
      const count = await this.db.getCount();
      if (count >= this.config.max_users) {
        return this._genErr('maximum amount of users reached', 403);
      }

    } else if (action === 'authenticate' || action === 'edit') {
      user = await this.db.getUser(obj.username);
      if (!user) {
        return this._genErr('username not found', 409);
      }
      verified = await this.db.verifyUser(obj.username, obj.password);
      if (!verified) {
        return this._genErr('unauthorized access', 401);
      }
    }
    return null;
  }
  /**
   * authenticate - Authenticate user.
   * @param {string} user
   * @param {string} password
   * @param {function} cb
   * @returns {function}
   */
  authenticate(user, password, cb) {
    this.logger.info('[level-plugin] authenticate:',user);
    this._check({ username: user, password }, 'authenticate').then((err) => {
      if (err) {
        this.logger.error('[level-plugin] authenticate:',err.message);
        return cb(err);
      }
      // TODO: support usergroups
      return cb(null,[user]);
    }).catch((err) => {
      this.logger.error('[level-plugin] authenticate:',err.message);
      return cb(err);
    });
  }
  /**
 * adds a user
 *
 * @param {string} user
 * @param {string} password
 * @param {function} realCb
 * @returns {function}
 */
  adduser(user, password, cb) {
    this.logger.info('[level-plugin] adduser:',user);
    this._check({ username: user, password }, 'register').then((err) => {
      if (err) {
        this.logger.error('[level-plugin] adduser:',err.message);
        return cb(err);
      }
      this.db.addUser(user, password).then(() => {
        return cb(null,true);
      }).catch((err) => {
        this.logger.error('[level-plugin] adduser:',err.message);
        return cb(err);
      });
    }).catch((err) => {
      this.logger.error('[level-plugin] adduser:',err.message);
      return cb(err);
    });
  }
  /**
   * changePassword - change password for existing user.
   * @param {string} user
   * @param {string} password
   * @param {function} cd
   * @returns {function}
   */
  changePassword(user, password, newpassword, cb) {
    this.logger.info('[level-plugin] changePassword:',user);
    this._check({ username: user, password }, 'edit').then((err) => {
      if (err) {
        this.logger.error('[level-plugin] changePassword:',err.message);
        return cb(err);
      }
      this.db.addUser(user, password).then(() => {
        return cb(null,true);
      }).catch((err) => {
        this.logger.error('[level-plugin] changePassword:',err.message);
        return cb(err);
      });
    }).catch((err) => {
      this.logger.error('[level-plugin] changePassword:',err.message);
      return cb(err);
    });
  }
}