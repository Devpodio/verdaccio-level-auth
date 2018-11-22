import Level from './src/level';

/**
 * A new instance of Level class.
 * @param {object} config
 * @param {object} verdaccioArgs
 * @returns {object}
 */
export default function(config, verdaccioArgs) {
  return new Level(config, verdaccioArgs);
}