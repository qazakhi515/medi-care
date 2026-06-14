/**
 * One-time migration: backfill missing counter fields on existing members.
 *
 * These fields were added to the Member schema after some documents were
 * created. Mongoose `default: 0` only applies on new docs, so old members
 * have the fields missing -> GraphQL non-nullable Int errors.
 *
 * Run: node scripts/backfill-member-counters.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const COUNTER_FIELDS = [
	'memberHospitals',
	'memberArticles',
	'memberFollowers',
	'memberFollowings',
	'memberPoints',
	'memberLikes',
	'memberViews',
	'memberComments',
];

async function main() {
	const uri = process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV;
	if (!uri) throw new Error('Mongo URI not found in env (MONGO_DEV / MONGO_PROD)');

	await mongoose.connect(uri.trim());
	const members = mongoose.connection.collection('members');

	// Build $or filter: any member missing at least one counter field
	const orFilter = COUNTER_FIELDS.map((f) => ({ [f]: { $exists: false } }));

	const affected = await members.countDocuments({ $or: orFilter });
	console.log(`Members missing at least one counter field: ${affected}`);

	// Set each field to 0 only where it is currently missing.
	let totalModified = 0;
	for (const field of COUNTER_FIELDS) {
		const res = await members.updateMany({ [field]: { $exists: false } }, { $set: { [field]: 0 } });
		if (res.modifiedCount > 0) {
			console.log(`  ${field}: set on ${res.modifiedCount} docs`);
			totalModified += res.modifiedCount;
		}
	}

	console.log(`Done. Total field-writes: ${totalModified}`);
	await mongoose.disconnect();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
