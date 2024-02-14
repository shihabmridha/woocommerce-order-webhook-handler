export interface Env {
	SECRET: string;
	SMS_API_HOST: string;
	SMS_API_KEY: string;
	SMS_API_SENDER_ID: string;
}

export interface RequestPayload {
	number: string; // Order number
	total: number; // Price
	status: 'completed' | 'cancelled'; // Order status
	billing: {
		phone: string;
	};
}
