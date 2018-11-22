import Level from './level';

/**
 * A new instance of Level class.
 * @param {object} config
 * @returns {object}
 */
export default function(config, { logger }) {
  return new Level(config,logger);
}