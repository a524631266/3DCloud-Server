let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;
let util = require('util');

const DATABASE_URL = 'localhost';
const DATABASE_PORT = '27017';
const DATABASE_NAME = '3dcloud';

module.exports.DB = class {
    static async connect() {
        global.logger.info(util.format('Connecting to database at %s...', DATABASE_URL));

        this.db = await MongoClient.connect('mongodb://' + DATABASE_URL + ':' + DATABASE_PORT + '/' + DATABASE_NAME);

        global.logger.info('Successfully connected.');
    }

    //region Hosts
    static async getHosts() {
        global.logger.log('Fetching all hosts');

        let collection = this.db.collection('hosts');

        return await collection.find().toArray();
    }

    static async getHost(id) {
        global.logger.log(util.format('Fetching host with ID "%s"', id));

        let collection = this.db.collection('hosts');

        return await collection.findOne({'_id': id});
    }

    static async hostExists(id) {
        global.logger.log(util.format('Checking if host with ID "%s" exists', id));

        return await this.getHost(id) !== null;
    }

    static async addHost(id) {
        global.logger.log('Adding host with ID ' + id);

        let name = 'Machine ' + id;

        let collection = this.db.collection('hosts');

        return await collection.insertOne({'_id': id, 'name': name}).then(result => {
            return result.result.n === 1;
        });
    }

    static async deleteHost(id) {
        global.logger.log('Deleting host with ID ' + id);

        let collection = this.db.collection('hosts');

        return await collection.deleteOne({'_id': id});
    }
    //endregion

    //region Devices
    static async getDevice(id) {
        global.logger.log(util.format('Fetching device with ID "%s"', id));

        let collection = this.db.collection('devices');

        return await collection.findOne({'_id': id});
    }

    static async getDevices() {
        global.logger.log('Fetching all devices');

        let collection = this.db.collection('devices');

        return await collection.find().toArray();
    }

    static async deviceExists(id) {
        global.logger.log(util.format('Checking if device with ID "%s" exists', id));

        return await this.getDevice(id) !== null;
    }

    static async updateDevice(id, hostId) {
        let collection = this.db.collection('devices');

        if (await this.deviceExists(id)) {
            global.logger.log(util.format('Updating device with ID "%s"', id));

            return await collection.updateOne({'_id': id}, {'host_id': hostId}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            global.logger.log(util.format('Inserting device with ID "%s"', id));

            return await collection.insertOne({'_id': id, 'host_id': hostId}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    static async deleteDevice(id) {
        global.logger.log(util.format('Removing device with ID "%s"', id));

        let collection = this.db.collection('devices');

        return await collection.deleteOne({'_id': id}).then((result) => {
            return result.result.n === 1
        });
    }
    //endregion

    //region Printers
    static async getPrinters() {
        global.logger.log('Fetching all printers');

        let collection = this.db.collection('printers');

        let printers = await collection.find().toArray();

        printers.forEach(async printer => {
            console.log(printer);
            let device = await this.getDevice(printer.id);
            console.log(device);
        });

        return printers;
    }

    static async getPrinter(id) {
        global.logger.log('Fetching all printers');

        let collection = this.db.collection('printers');

        return await collection.findOne({'_id': id});
    }

    static async getPrintersForHost(hostId) {
        let devicesCollection = this.db.collection('devices');
        let printersCollection = this.db.collection('printers');

        let devices = await devicesCollection.find({'host_id': hostId}).toArray().then(devices => {
            return devices.map(d => d['_id']);
        });

        return await printersCollection.find().toArray().then(printers => {
            return printers.filter(p => devices.includes(p['_id']));
        });
    }

    static async updatePrinter(id, name, driver) {
        let collection = this.db.collection('printers');

        if (await this.printerExists(id)) {
            global.logger.log(util.format('Updating printer with ID "%s"', id));

            return collection.updateOne({'_id': id}, {'name': name, 'driver': driver}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            global.logger.log(util.format('Inserting printer with ID "%s"', id));

            return collection.insertOne({'_id': id, 'name': name, 'driver': driver}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    static async printerExists(id) {
        global.logger.log(util.format('Checking if printer with ID "%s" exists', id));

        return await this.getPrinter(id) !== null;
    }
    //endregion

    //region Files
    static async getFiles() {
        global.logger.log('Fetching all files from database');

        let collection = this.db.collection('files');

        return await collection.find().toArray();
    }

    static async getFile(id) {
        global.logger.log(util.format('Fetching file with ID "%s"', id));

        let collection = this.db.collection('files');

        return await collection.findOne({'_id': ObjectId(id)});
    }

    static async addFile(key, name) {
        global.logger.log(util.format('Adding file "%s" (%s) to database', name, key));

        let collection = this.db.collection('files');

        return collection.insertOne({'key': key, 'name': name, 'date_added': new Date()}).then(result => {
            return result.ops[0];
        });
    }

    static async deleteFile(id) {
        global.logger.log('Deleting file with ID ' + id);

        let collection = this.db.collection('files');

        return await collection.deleteOne({'_id': ObjectId(id)}).then(result => {
            return result.result.n === 1;
        }).catch(error => {
            global.logger.error(error);
            return false;
        });
    }
    //endregion
};