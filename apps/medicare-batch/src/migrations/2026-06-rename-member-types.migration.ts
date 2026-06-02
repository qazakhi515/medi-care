/**
 * Phase 2 data migration — MemberType rename (Nestar → Medi-care).
 *
 * Rewrites legacy `members.memberType` values to the canonical Medi-care set
 * defined in AGENTS.md:
 *   USER  -> PATIENT
 *   AGENT -> DOCTOR
 * (ADMIN is unchanged; NURSE is new and has no legacy source.)
 *
 * Required because the GraphQL/Mongoose enum now only accepts the new values,
 * so aggregation matches (e.g. getAgents -> memberType: DOCTOR) would miss
 * documents still tagged with the old strings.
 *
 * Run once against the target DB, e.g.:
 *   NODE_ENV=development npx ts-node apps/medicare-batch/src/migrations/2026-06-rename-member-types.migration.ts
 * Connects via MONGO_DEV (or MONGO_PROD when NODE_ENV=production), matching
 * apps/medicare-api/src/database/database.module.ts.
 */
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run(): Promise<void> {
	const uri = process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV;
	if (!uri) throw new Error('Missing MONGO_DEV / MONGO_PROD connection string in environment.');

	await mongoose.connect(uri);
	const members = mongoose.connection.collection('members');

	const userToPatient = await members.updateMany({ memberType: 'USER' }, { $set: { memberType: 'PATIENT' } });
	const agentToDoctor = await members.updateMany({ memberType: 'AGENT' }, { $set: { memberType: 'DOCTOR' } });

	console.log(`USER  -> PATIENT: matched ${userToPatient.matchedCount}, modified ${userToPatient.modifiedCount}`);
	console.log(`AGENT -> DOCTOR : matched ${agentToDoctor.matchedCount}, modified ${agentToDoctor.modifiedCount}`);

	const remaining = await members.distinct('memberType');
	console.log('Remaining distinct memberType values:', remaining);

	await mongoose.disconnect();
}

run()
	.then(() => {
		console.log('Member type migration complete.');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Member type migration failed:', err);
		process.exit(1);
	});
