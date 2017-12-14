let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;
let util = require('util');

const DATABASE_URL = 'localhost';
const DATABASE_PORT = 27017;
const DATABASE_NAME = '3dcloud';

module.exports.DB = class {
    static async connect(io) {
        this.io = io;

        global.logger.info(`Connecting to database at ${DATABASE_URL}:${DATABASE_PORT}/${DATABASE_NAME}...`);

        this.db = await MongoClient.connect('mongodb://' + DATABASE_URL + ':' + DATABASE_PORT + '/' + DATABASE_NAME);

        global.logger.info('Successfully connected.');
    }

    //region Hosts
    static async getHosts() {
        global.logger.log('Fetching all hosts');

        let collection = this.db.collection('hosts');

        let hosts = await await collection.find().toArray();

        for (let i = 0; i < hosts.length; i++) {
            hosts[i]['printers'] = await this.getPrintersForHost(hosts[i]['_id']);
        }

        return hosts;
    }

    static async getHost(id) {
        global.logger.log(util.format('Fetching host with ID "%s"', id));

        let collection = this.db.collection('hosts');

        let host = await collection.findOne({'_id': id});
        host['printers'] = await this.getPrintersForHost(host['_id']);

        return host;
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

        return await collection.find().toArray();
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

        return await collection.findOne({'_id': id});
    }

    static async addFile(key, name) {
        global.logger.log(util.format('Adding file "%s" (%s) to database', name, key));

        let collection = this.db.collection('files');

        return collection.insertOne({'_id': key, 'name': name, 'date_added': new Date()}).then(result => {
            return result.ops[0];
        });
    }

    static async deleteFile(id) {
        global.logger.log('Deleting file with ID ' + id);

        let collection = this.db.collection('files');

        return await collection.deleteOne({'_id': id}).then(result => {
            return result.result.n === 1;
        }).catch(error => {
            global.logger.error(error);
            return false;
        });
    }

    //endregion

    //region Prints
    static async getPrints() {
        global.logger.log('Fetching all prints');

        let collection = this.db.collection('prints');

        return await collection.find().toArray();
    }

    static async getPrint(id) {
        global.logger.log('Fetching print with ID ' + id);

        let collection = this.db.collection('prints');

        return await collection.findOne({'_id': ObjectId(id)});
    }

    static async addPrint(fileId, printerId, status = 'pending', hostId = null) {
        global.logger.log(util.format('Adding print for "%s" on "%s"', fileId, printerId));

        let collection = this.db.collection('prints');

        let file = await this.getFile(fileId);
        let printer = await this.getPrinter(printerId);

        return await collection.insertOne({
            file_id: fileId,
            file_name: file.name,
            printer_id: printerId,
            printer_name: printer.name,
            created: new Date(),
            status: status,
            host_id: hostId
        }).then(result => {
            return result.ops[0];
        });
    }

    static async queuePrint(fileId, printerId) {
        global.logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);

        let print = await this.addPrint(fileId, printerId, 'queued');

        let collection = this.db.collection('printers');

        await collection.updateOne({'_id': printerId}, {$push: {'queue': print['_id']}});

        return print;
    }

    static async getNextQueuedPrint(printerId) {
        global.logger.log(`Fetching next print for printer "${printerId}"`);

        let collection = this.db.collection('printers');

        let result = await collection.findOne({'_id': printerId});

        await collection.updateOne({'_id': printerId}, {$pop: {'queue': -1}});

        if (result['queue'] && result['queue'][0]) {
            let id = result['queue'][0];

            await this.updatePrint(id, 'pending');

            return await this.getPrint(id);
        }

        return null;
    }

    static async setPrintPending(printId, hostId) {
        global.logger.log(util.format('Setting print "%s" as pending', printId));

        let collection = this.db.collection('prints');

        return await collection.updateOne({'_id': ObjectId(printId)}, {$set: {'status': 'pending', 'host_id': hostId}});
    }

    static async updatePrint(printId, status, description = null) {
        global.logger.log(util.format('Updating print "%s" to status "%s"', printId, status));

        let collection = this.db.collection('prints');

        let data = {
            'status': status,
            'description': description
        };

        if (status === 'running')
            data['started'] = new Date();

        if (['success', 'error', 'canceled'].includes(status))
            data['completed'] = new Date();

        let result = await collection.updateOne({'_id': ObjectId(printId)}, {$set: data});

        data['_id'] = printId;

        this.io.namespaces.users.emit('print-updated', data);

        return result;
    }

    static async deletePrint(printId) {
        global.logger.log(util.format('Deleting print "%s"', printId));

        let collection = this.db.collection('prints');

        return await collection.deleteOne({'_id': ObjectId(printId)});
    }

    static async resetHostPrints(hostId) {
        global.logger.log('Resetting printers for host ' + hostId);

        let collection = this.db.collection('prints');

        await collection.updateMany(
            {
                'host_id': hostId,
                $or: [
                    {'status': 'running'},
                    {'status': 'pending'}
                ]
            }, {
                $set: {
                    'status': 'error',
                    'description': 'Host lost power',
                    'completed': new Date()
                }
            }
        );
    }

    //endregion
};