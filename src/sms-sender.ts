import { Env } from "./types";

export async function sendSms(env: Env, phoneNumber: string, message: string) {
	const params = new URLSearchParams({
		api_key: env.SMS_API_KEY,
		senderid: env.SMS_API_SENDER_ID,
		number: phoneNumber,
		message,
	});

	const apiResponse = await fetch(`${env.SMS_API_HOST}?${params.toString()}`);

	if (!apiResponse.ok) {
		const errResp = await apiResponse.json();
		throw new Error(JSON.stringify(errResp, null, 2));
	}

	const okResp = await apiResponse.json();
	return okResp;
}
