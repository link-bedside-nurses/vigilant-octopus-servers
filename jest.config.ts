import type { JestConfigWithTsJest } from 'ts-jest';

export default async (): Promise<JestConfigWithTsJest> => {
	return {
		verbose: true,
		preset: 'ts-jest',
		testEnvironment: 'node',
		setupFilesAfterEnv: ['./src/__test__/setup.test.ts'],
		maxWorkers: 1,
	};
};
