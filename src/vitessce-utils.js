import { HTTPStore, KeyError, openArray, slice } from "zarr";
import { range } from "./utils";

// code from https://github.com/vitessce/vitessce/blob/3615b5539315be79ae8739526974d50160834183/src/loaders/data-sources/ZarrDataSource.js
// and https://github.com/vitessce/vitessce/blob/3615b5539315be79ae8739526974d50160834183/src/loaders/data-sources/AnnDataSource.js

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export class ZarrDataSource {
  constructor({ url, requestInit }) {
    // TODO: We should probably add a way of allowing HEAD requests as well:
    // https://github.com/gzuidhof/zarr.js/blob/375ce0c299469a970da6bb5653513564e25806bb/docs/getting-started/remote-data.md#stores
    const supportedMethods = ["GET"];
    // Need to be sure that URL ends with "/"
    if (!url.endsWith("/")) {
      url = url + "/";
    }
    this.store = new HTTPStore(url, {
      supportedMethods,
      fetchOptions: requestInit,
    });
  }

  /**
   * Class method for decoding json from the store.
   * @param {string} key A path to the item.
   * @returns {Promise} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key) {
    try {
      const buf = await this.store.getItem(key);
      const text = new TextDecoder("utf-8").decode(buf);
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof KeyError) {
        return {};
      }
      throw err;
    }
  }
}

const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error("readFloat32 only takes in length 4 byte buffers");
  }
  return new Int32Array(bytes.buffer)[0];
};

const HEADER_LENGTH = 4;

function dirname(path) {
  const arr = path.split("/");
  arr.pop();
  return arr.join("/");
}

/**
 * Method for decoding text arrays from zarr.
 * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
 * @returns {string[]} An array of strings.
 */
function parseVlenUtf8(buffer) {
  const decoder = new TextDecoder();
  let data = 0;
  const dataEnd = data + buffer.length;
  const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
  if (buffer.length < HEADER_LENGTH) {
    throw new Error("corrupt buffer, missing or truncated header");
  }
  data += HEADER_LENGTH;
  const output = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (data + 4 > dataEnd) {
      throw new Error("corrupt buffer, data seem truncated");
    }
    const l = readFloat32FromUint8(buffer.slice(data, data + 4));
    data += 4;
    if (data + l > dataEnd) {
      throw new Error("corrupt buffer, data seem truncated");
    }
    output[i] = decoder.decode(buffer.slice(data, data + l));
    data += l;
  }
  return output;
}

/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export class AnnDataSource extends ZarrDataSource {
  constructor(...args) {
    super(...args);
    /** @type {Map<string, Promise<string[]>} */
    this.promises = new Map();
  }

  loadObsColumns(paths) {
    return this._loadColumns(paths);
  }

  loadVarColumns(paths) {
    return this._loadColumns(paths);
  }

  /**
   * Class method for loading obs variables.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string[]} paths An array of strings like "obs/leiden" or "obs/bulk_labels."
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  _loadColumns(paths) {
    const promises = paths.map((path) => {
      const getCol = (col) => {
        if (!this.promises.has(col)) {
          const obsPromise = this._loadColumn(col).catch((err) => {
            // clear from cache if promise rejects
            this.promises.delete(col);
            // don't propagate error - e.g. if single column is dtype '<i8', we don't
            // want to fail on other columns
            // throw err;
          });
          this.promises.set(col, obsPromise);
        }
        return this.promises.get(col);
      };
      if (!path) {
        return Promise.resolve(undefined);
      }
      if (Array.isArray(path)) {
        return Promise.resolve(Promise.all(path.map(getCol)));
      }
      return getCol(path);
    });
    return Promise.all(promises);
  }

  async _loadColumn(path) {
    // TODO: we limit PAGE to 100 items for now to avoid loading too much data.
    // This should be enough to understand the type and format of the data.
    // Pagination (prev/next page) is not yet supported...
    const pageSize = 100;

    const { store } = this;
    const prefix = dirname(path);
    const colAttrs = await this.getJson(`${this.store.url}${path}/.zattrs`);
    let categoriesValues;
    // ? I don't see "categories" in any sample .zattrs files?
    let categories = colAttrs["encoding-type"] == "categorical";
    if (categories) {
      const { dtype } = await this.getJson(
        `${this.store.url}${path}/categories/.zarray`
      );
      if (dtype === "|O") {
        categoriesValues = await this.getFlatArrDecompressed(
          `${path}/categories/`
        );
      }
      path = `${path}/codes/`;
    } else {
      // added this.store.url here, e.g. "obs/category/categories"
      const { dtype } = await this.getJson(`${this.store.url}${path}/.zarray`);
      if (dtype === "|O") {
        return this.getFlatArrDecompressed(path, pageSize);
      }
    }
    const arr = await openArray({ store, path, mode: "r" });
    console.log("_loadColumn path", path, "shape", arr.meta.shape);

    let slices;
    if (pageSize) {
      slices = arr.meta.shape.map((dim) =>
        slice(null, Math.min(dim, pageSize))
      );
    }
    const values = await arr.get(slices);
    const { data } = values;
    const mappedValues = Array.from(data).map(
      // NB: originally this casted to string:
      // i => (!categoriesValues ? String(i) : categoriesValues[i]),
      (i) => (!categoriesValues ? i : categoriesValues[i])
    );
    return mappedValues;
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: "r",
    }).then((arr) => arr.get());
  }

  /**
   * A common method for loading flattened data
   * i.e that which has shape [n] where n is a natural number.
   * @param {string} path A path to a flat array location, like obs/_index
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  getFlatArrDecompressed(path, pageSize) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: "r",
    }).then(async (z) => {
      let data;
      const parseAndMergeTextBytes = (dbytes) => {
        const text = parseVlenUtf8(dbytes);
        if (!data) {
          data = text;
        } else {
          data = data.concat(text);
        }
      };
      const mergeBytes = (dbytes) => {
        if (!data) {
          data = dbytes;
        } else {
          const tmp = new Uint8Array(
            dbytes.buffer.byteLength + data.buffer.byteLength
          );
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
        }
      };
      const numRequests = Math.ceil(z.meta.shape[0] / z.meta.chunks[0]);
      const requests = range(numRequests).map(async (item) =>
        store
          .getItem(`${z.keyPrefix}${String(item)}`)
          .then((buf) =>
            z.compressor.then((compressor) => compressor.decode(buf))
          )
      );
      const dbytesArr = await Promise.all(requests);
      dbytesArr.forEach((dbytes) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (
          Array.isArray(z.meta.filters) &&
          z.meta.filters[0].id === "vlen-utf8"
        ) {
          parseAndMergeTextBytes(dbytes);
          // Otherwise just merge the bytes as a typed array.
        } else {
          mergeBytes(dbytes);
        }
      });
      const {
        meta: {
          shape: [length],
        },
      } = z;
      // truncate the filled in values
      if (pageSize) {
        return data.slice(0, pageSize);
      }
      return data.slice(0, length);
    });
  }

  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadObsIndex() {
    if (this.obsIndex) {
      return this.obsIndex;
    }
    this.obsIndex = this.getJson("obs/.zattrs").then(({ _index }) =>
      this.getFlatArrDecompressed(`/obs/${_index}`)
    );
    return this.obsIndex;
  }

  /**
   * Class method for loading the var index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadVarIndex() {
    if (this.varIndex) {
      return this.varIndex;
    }
    this.varIndex = this.getJson("var/.zattrs").then(({ _index }) =>
      this.getFlatArrDecompressed(`/var/${_index}`)
    );
    return this.varIndex;
  }

  /**
   * Class method for loading the var alias.
   * @returns {Promise} An promise for a zarr array containing the aliased names.
   */
  async loadVarAlias(varPath) {
    if (this.varAlias) {
      return this.varAlias;
    }
    [this.varAlias] = await this.loadVarColumns([varPath]);
    const index = await this.loadVarIndex();
    this.varAlias = this.varAlias.map((val, ind) => val || index[ind]);
    return this.varAlias;
  }

  async _openSparseArrays(matrix) {
    const store = this.store;
    const sparseArrays = Promise.all(
      ["indptr", "indices", "data"].map((name) => {
        console.log('openArray', `${matrix}/${name}`);
        return openArray({ store, path: `${matrix}/${name}`, mode: "r" });
      }
      )
    );
    return sparseArrays;
  }

  // async _loadCSCGeneSelection(selection) {
  async loadSparseData(matrix, pageSize) {
    const sparseAttrs = await this.getJson(`${this.store.url}/${matrix}/.zattrs`);
    let [numRows, numCols] = sparseAttrs.shape;
    numRows = Math.min(numRows, pageSize);
    numCols = Math.min(numCols, pageSize);
    console.log({numRows, numCols});
    const indices = range(numRows);
    const [indptrArr, indexArr, cellXGeneArr] = await this._openSparseArrays(matrix);
    const { data: cols } = await indptrArr.getRaw(null);
    // If there is no change in the column indexer, then the data is all zeros
    return Promise.all(
      indices.map(async (index) => {
        const startRowIndex = cols[index];
        const endRowIndex = cols[index + 1];
        const isColumnAllZeros = startRowIndex === endRowIndex;
        const geneData = new Float32Array(numCols).fill(0);
        if (isColumnAllZeros) {
          return geneData;
        }
        const { data: rowIndices } = await indexArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        const { data: cellXGeneData } = await cellXGeneArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        for (let rowIndex = 0; rowIndex < rowIndices.length; rowIndex += 1) {
          geneData[rowIndices[rowIndex]] = cellXGeneData[rowIndex];
        }
        return geneData;
      })
    );
  }
}
