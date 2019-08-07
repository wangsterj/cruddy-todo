const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId((err, id)=>{
    var filePath = path.join(exports.dataDir, id+'.txt');
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        throw ('input cannot be saved');
      } else {
        // items[id] = text;
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  return fs.readdirAsync(exports.dataDir)
    .then ((files) => {
      return _.map(files, (file) => {
        return fs.readFileAsync(path.join(exports.dataDir,file), 'utf8')
          .then((text) => {
            return {id: file.slice(0,5), text: text}
          });
      })
    })
    .then ((promiseArray) => {
      return Promise.all(promiseArray);
    })
    .then ((data) => {
      callback(null, data)
    })
    .catch ((err) => {
      throw err;
    })
  }

exports.readOne = (id, callback) => {
  // var text = items[id];
  var filePath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(filePath, 'utf8', (err, text) => {
    if (!text) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  })
};

exports.update = (id, text, callback) => {
  // var item = items[id];
  var filePath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(filePath, 'utf8', (err, oldText) => {
    if (!oldText) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw err;
        } else {
          callback(null, { id, text });
        }
      });
    }
  })
};

exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  var filePath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(filePath, 'utf8', (err, text) => {
    if (!text) {
      // report an error if item not found
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          throw err;
        } else {
          callback();
        }
      });
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
