'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var isPlainObj = value => {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
};

const {hasOwnProperty} = Object.prototype;
const {propertyIsEnumerable} = Object;
const defineProperty = (object, name, value) => Object.defineProperty(object, name, {
	value,
	writable: true,
	enumerable: true,
	configurable: true
});

const globalThis$1 = commonjsGlobal;
const defaultMergeOptions = {
	concatArrays: false,
	ignoreUndefined: false
};

const getEnumerableOwnPropertyKeys = value => {
	const keys = [];

	for (const key in value) {
		if (hasOwnProperty.call(value, key)) {
			keys.push(key);
		}
	}

	/* istanbul ignore else  */
	if (Object.getOwnPropertySymbols) {
		const symbols = Object.getOwnPropertySymbols(value);

		for (const symbol of symbols) {
			if (propertyIsEnumerable.call(value, symbol)) {
				keys.push(symbol);
			}
		}
	}

	return keys;
};

function clone(value) {
	if (Array.isArray(value)) {
		return cloneArray(value);
	}

	if (isPlainObj(value)) {
		return cloneOptionObject(value);
	}

	return value;
}

function cloneArray(array) {
	const result = array.slice(0, 0);

	getEnumerableOwnPropertyKeys(array).forEach(key => {
		defineProperty(result, key, clone(array[key]));
	});

	return result;
}

function cloneOptionObject(object) {
	const result = Object.getPrototypeOf(object) === null ? Object.create(null) : {};

	getEnumerableOwnPropertyKeys(object).forEach(key => {
		defineProperty(result, key, clone(object[key]));
	});

	return result;
}

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {string[]} keys keys to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 */
const mergeKeys = (merged, source, keys, config) => {
	keys.forEach(key => {
		if (typeof source[key] === 'undefined' && config.ignoreUndefined) {
			return;
		}

		// Do not recurse into prototype chain of merged
		if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
			defineProperty(merged, key, merge(merged[key], source[key], config));
		} else {
			defineProperty(merged, key, clone(source[key]));
		}
	});

	return merged;
};

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 *
 * see [Array.prototype.concat ( ...arguments )](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat)
 */
const concatArrays = (merged, source, config) => {
	let result = merged.slice(0, 0);
	let resultIndex = 0;

	[merged, source].forEach(array => {
		const indices = [];

		// `result.concat(array)` with cloning
		for (let k = 0; k < array.length; k++) {
			if (!hasOwnProperty.call(array, k)) {
				continue;
			}

			indices.push(String(k));

			if (array === merged) {
				// Already cloned
				defineProperty(result, resultIndex++, array[k]);
			} else {
				defineProperty(result, resultIndex++, clone(array[k]));
			}
		}

		// Merge non-index keys
		result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(key => !indices.includes(key)), config);
	});

	return result;
};

/**
 * @param {*} merged already cloned
 * @param {*} source something to merge
 * @param {Object} config Config Object
 * @returns {*} cloned Object
 */
function merge(merged, source, config) {
	if (config.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
		return concatArrays(merged, source, config);
	}

	if (!isPlainObj(source) || !isPlainObj(merged)) {
		return clone(source);
	}

	return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), config);
}

var mergeOptions = function (...options) {
	const config = merge(clone(defaultMergeOptions), (this !== globalThis$1 && this) || {}, defaultMergeOptions);
	let merged = {_: {}};

	for (const option of options) {
		if (option === undefined) {
			continue;
		}

		if (!isPlainObj(option)) {
			throw new TypeError('`' + option + '` is not an Option Object');
		}

		merged = merge(merged, {_: option}, config);
	}

	return merged._;
};

/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const merge$1 = mergeOptions.bind({
  concatArrays: true,
  ignoreUndefined: true
});

function mergeLocalStorageItem(key, value) {
  const oldValue = window.localStorage.getItem(key);

  if (oldValue) {
    const oldObject = JSON.parse(oldValue);
    const newObject = JSON.parse(value);
    const nextValue = JSON.stringify(merge$1(oldObject, newObject));
    window.localStorage.setItem(key, nextValue);
  } else {
    window.localStorage.setItem(key, value);
  }
}

function createPromise(getValue, callback) {
  return new Promise((resolve, reject) => {
    try {
      const value = getValue();
      callback === null || callback === void 0 ? void 0 : callback(null, value);
      resolve(value);
    } catch (err) {
      callback === null || callback === void 0 ? void 0 : callback(err);
      reject(err);
    }
  });
}

function createPromiseAll(promises, callback, processResult) {
  return Promise.all(promises).then(result => {
    var _processResult;

    const value = (_processResult = processResult === null || processResult === void 0 ? void 0 : processResult(result)) !== null && _processResult !== void 0 ? _processResult : null;
    callback === null || callback === void 0 ? void 0 : callback(null, value);
    return Promise.resolve(value);
  }, errors => {
    callback === null || callback === void 0 ? void 0 : callback(errors);
    return Promise.reject(errors);
  });
}

const AsyncStorage = {
  /**
   * Fetches `key` value.
   */
  getItem: (key, callback) => {
    return createPromise(() => window.localStorage.getItem(key), callback);
  },

  /**
   * Sets `value` for `key`.
   */
  setItem: (key, value, callback) => {
    return createPromise(() => window.localStorage.setItem(key, value), callback);
  },

  /**
   * Removes a `key`
   */
  removeItem: (key, callback) => {
    return createPromise(() => window.localStorage.removeItem(key), callback);
  },

  /**
   * Merges existing value with input value, assuming they are stringified JSON.
   */
  mergeItem: (key, value, callback) => {
    return createPromise(() => mergeLocalStorageItem(key, value), callback);
  },

  /**
   * Erases *all* AsyncStorage for the domain.
   */
  clear: callback => {
    return createPromise(() => window.localStorage.clear(), callback);
  },

  /**
   * Gets *all* keys known to the app, for all callers, libraries, etc.
   */
  getAllKeys: callback => {
    return createPromise(() => {
      const numberOfKeys = window.localStorage.length;
      const keys = [];

      for (let i = 0; i < numberOfKeys; i += 1) {
        const key = window.localStorage.key(i) || '';
        keys.push(key);
      }

      return keys;
    }, callback);
  },

  /**
   * (stub) Flushes any pending requests using a single batch call to get the data.
   */
  flushGetRequests: () => undefined,

  /**
   * multiGet resolves to an array of key-value pair arrays that matches the
   * input format of multiSet.
   *
   *   multiGet(['k1', 'k2']) -> [['k1', 'val1'], ['k2', 'val2']]
   */
  multiGet: (keys, callback) => {
    const promises = keys.map(key => AsyncStorage.getItem(key));

    const processResult = result => result.map((value, i) => [keys[i], value]);

    return createPromiseAll(promises, callback, processResult);
  },

  /**
   * Takes an array of key-value array pairs.
   *   multiSet([['k1', 'val1'], ['k2', 'val2']])
   */
  multiSet: (keyValuePairs, callback) => {
    const promises = keyValuePairs.map(item => AsyncStorage.setItem(item[0], item[1]));
    return createPromiseAll(promises, callback);
  },

  /**
   * Delete all the keys in the `keys` array.
   */
  multiRemove: (keys, callback) => {
    const promises = keys.map(key => AsyncStorage.removeItem(key));
    return createPromiseAll(promises, callback);
  },

  /**
   * Takes an array of key-value array pairs and merges them with existing
   * values, assuming they are stringified JSON.
   *
   *   multiMerge([['k1', 'val1'], ['k2', 'val2']])
   */
  multiMerge: (keyValuePairs, callback) => {
    const promises = keyValuePairs.map(item => {
      var _AsyncStorage$mergeIt, _AsyncStorage$mergeIt2;

      return (_AsyncStorage$mergeIt = (_AsyncStorage$mergeIt2 = AsyncStorage.mergeItem) === null || _AsyncStorage$mergeIt2 === void 0 ? void 0 : _AsyncStorage$mergeIt2.call(AsyncStorage, item[0], item[1])) !== null && _AsyncStorage$mergeIt !== void 0 ? _AsyncStorage$mergeIt : Promise.reject('Not implemented');
    });
    return createPromiseAll(promises, callback);
  }
};

var PluginID = Symbol('AsyncRNPersistence');
// tslint:disable-next-line: function-name
function PersistenceRN(asyncStorageKey) {
    return function () { return ({
        id: PluginID,
        init: function (state) {
            AsyncStorage.getItem(asyncStorageKey)
                .then(function (persisted) {
                if (persisted !== null) {
                    var result = JSON.parse(persisted);
                    state.set(result);
                }
                else if (!state.promised && !!!state.error) {
                    AsyncStorage.setItem(asyncStorageKey, JSON.stringify(state.value));
                }
            })
                .catch(function (error) {
                throw 'Fail to get item';
            });
            return {
                onSet: function (p) {
                    if ('state' in p) {
                        AsyncStorage.setItem(asyncStorageKey, JSON.stringify(p.state));
                    }
                    else {
                        AsyncStorage.removeItem(asyncStorageKey);
                    }
                },
            };
        },
    }); };
}

exports.PersistenceRN = PersistenceRN;
//# sourceMappingURL=index.js.map
