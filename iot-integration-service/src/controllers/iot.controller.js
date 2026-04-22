const iotService = require("../services/iot.service");

exports.authenticateMachine = async (req, res) => {
    try {
        const result = await iotService.authenticateMachine(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.validateQRAccess = async (req, res) => {
    try {
        const result = await iotService.validateQRAccess(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.receiveTrainingData = async (req, res) => {
    try {
        const result = await iotService.receiveTrainingData(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.getMachineEvents = async (req, res) => {
    try {
        const { machine_id } = req.params;
        const result = await iotService.getMachineEvents(machine_id);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.getAllMachines = async (req, res) => {
    try {
        const machines = await iotService.getAllMachines();
        res.json(machines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMemberAccessHistory = async (req, res) => {
    try {
        const { miembro_id } = req.params;
        const result = await iotService.getMemberAccessHistory(miembro_id);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};