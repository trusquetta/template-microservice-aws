import process from 'node:process';
import {rdsData} from '@trusquetta/aws-rds-data';
import {s3} from '@trusquetta/aws-s3';

const {
	// ENV,
	// REGION,
	RDS_BUCKET,
	DB_RESOURCE_ARN_OLD,
	DB_SECRET_ARN_OLD,
	DB_RESOURCE_ARN,
	DB_SECRET_ARN,
} = process.env;

class RdsSyncConfig {
	profile;
	bucket = RDS_BUCKET;
	fromResourceArn = DB_RESOURCE_ARN_OLD;
	fromSecretArn = DB_SECRET_ARN_OLD;
	toResourceArn = DB_RESOURCE_ARN;
	toSecretArn = DB_SECRET_ARN;
}

class RdsSync {
	config = new RdsSyncConfig();

	/**
	 * @param {RdsSyncConfig} config
	 */
	configure(config = {}) {
		Object.assign(this.config, config);
	}

	get dbFrom() {
		const {
			profile,
			fromResourceArn,
			fromSecretArn,
		} = this.config;
		return rdsData.create({
			profile,
			resourceArn: fromResourceArn,
			secretArn: fromSecretArn,
			database: 'trusquetta',
			readOnly: true,
		});
	}

	get dbTo() {
		const {
			profile,
			toResourceArn,
			toSecretArn,
		} = this.config;
		return rdsData.create({
			profile,
			resourceArn: toResourceArn,
			secretArn: toSecretArn,
			database: 'trusquetta',
		});
	}

	/**
	 * from から to へデータを同期します。
	 * - to のテーブルは TRUNCATE してから LOAD します。
	 * @param {Object} input
	 * @param {string} input.fromDatabase
	 * @param {string} input.fromTable
	 * @param {string} input.toDatabase
	 * @param {string} input.toTable
	 * @returns {Promise<void>}
	 */
	async load({fromDatabase, fromTable, toDatabase, toTable}) {
		const {dbFrom, dbTo} = this;
		const {bucket} = this.config;

		const date = new Date().toISOString().split('T')[0];
		const key = `sync/${fromDatabase}/${fromTable}/${date}`;
		const s3Url = `s3-ap-northeast-1://${bucket}/${key}`;

		const fromCount = await dbFrom.post(`SELECT COUNT(*) AS count FROM ${fromDatabase}.${fromTable}
		`).then(res => res[0].count);

		// FROM DB: OUTFILE
		console.info(`OUTFILE: ${fromDatabase}.${fromTable} (${fromCount} rows) => ${s3Url}`);
		await (async () => {
			// 第３引数でタイムアウトしてもクエリをキャンセルしないよう指定してます
			try {
				await dbFrom.post(`
					SELECT *
					FROM ${fromDatabase}.${fromTable}
					INTO OUTFILE S3 '${s3Url}'
					FIELDS TERMINATED BY ','
					LINES TERMINATED BY '\n'
					MANIFEST ON
					OVERWRITE ON
				`, [], true);
			} catch (error) {
				if (error.name === 'StatementTimeoutException') {
					// タイムアウトしてもOUTFILEは継続されるので無視します
				} else {
					throw error;
				}
			}

			// WAIT
			let isContinue = true;
			while (isContinue) {
				// eslint-disable-next-line no-await-in-loop
				await new Promise(resolve => {
					setTimeout(resolve, 2000);
				});
				// eslint-disable-next-line no-await-in-loop
				if (await s3.exists({bucket, key: `${key}.manifest`})) {
					isContinue = false;
				}
			}
		})();

		// TO DB: TRUNCATE
		console.info(`TRUNCATE: ${toDatabase}.${toTable}`);
		await dbTo.post(`TRUNCATE TABLE ${toDatabase}.${toTable}`);

		// TO DB: LOAD
		console.info(`LOAD: ${s3Url} => ${toDatabase}.${toTable}`);
		await (async () => {
			// 第３引数でタイムアウトしてもクエリをキャンセルしないよう指定してます
			try {
				await dbTo.post(`
					LOAD DATA FROM S3
					MANIFEST '${s3Url}.manifest'
					INTO TABLE ${toDatabase}.${toTable}
					FIELDS TERMINATED BY ','
					LINES TERMINATED BY '\n';
				`, [], true);
			} catch (error) {
				if (error.name === 'StatementTimeoutException') {
					// タイムアウトしてもOUTFILEは継続されるので無視します
				} else {
					throw error;
				}
			}

			// WAIT
			let isContinue = true;
			while (isContinue) {
				// eslint-disable-next-line no-await-in-loop
				const toCount = await dbTo.post(`SELECT COUNT(*) AS count FROM ${toDatabase}.${toTable}
				`).then(res => res[0].count);
				// OUTFILEの時点で元データに行が追加されている可能性があるため80%を超えたら完了とみなす
				if (toCount >= (fromCount * 0.8)) {
					isContinue = false;
				}

				// eslint-disable-next-line no-await-in-loop
				await new Promise(resolve => {
					setTimeout(resolve, 2000);
				});
			}
		})();

		// REMOVE S3
		console.info(`REMOVE: ${s3Url}*`);
		await (async () => {
			const {Contents: keys} = await s3.index({bucket, prefix: key});
			await Promise.all(keys.map(({Key}) => s3.delete({bucket, key: Key})));
		})();
	}
}

export const rdsSync = new RdsSync();
