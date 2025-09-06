const express = require('express');
const router = express.Router();
const { DomainList, Approval } = require('../models/schemas');

// POST /new_domain_enlistment
router.post('/enlist', async (req, res) => {
	try {
		const { domain_subject } = req.body;
		if (!domain_subject) {
			return res.status(400).json({ error: 'domain_subject is required' });
		}

		// Find the highest id_no
		const highestDomain = await DomainList.findOne({}, {}, { sort: { id_no: -1 } });
		const newId = highestDomain ? highestDomain.id_no + 1 : 1;

		// Create new domain
		const newDomain = new DomainList({
			id_no: newId,
			domain_subject
		});
		await newDomain.save();

		// Delete all approval records where msg matches domain_subject
		const deleteResult = await Approval.deleteMany({ msg: domain_subject });

		res.status(201).json({
			message: 'Domain created and matching approval records removed',
			domain: newDomain,
			deletedCount: deleteResult.deletedCount
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});





module.exports = router;
