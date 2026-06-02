import { Controller, Get, Logger } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_TOP_AGENTS, BATCH_TOP_HOSPITALS, BATCH_ROLLBACK, BATCH_TOP_DOCTORS } from './lib/config';
import { BatchService } from './batch.service';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('00 * * * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_HOSPITALS })
	public async batchHospitals() {
		try {
			this.logger['context'] = BATCH_TOP_HOSPITALS;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchHospitals();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_AGENTS })
	public async batchAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('50 * * * * *', { name: BATCH_TOP_DOCTORS })
	public async batchDoctors() {
		try {
			this.logger['context'] = BATCH_TOP_DOCTORS;
			this.logger.debug('EXECUTED!');
			await this.batchService.batchDoctors();
		} catch (err) {
			this.logger.error(err);
		}
	}

	/*
   @Interval (1000)
  handleInterval(){
  this.logger.debug('INTERVAL TEST')
  }
  */
	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
