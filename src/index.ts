import { sendSms } from './sms-sender';
import { Env, RequestPayload } from './types';
import { createHmac } from 'node:crypto';

function isValidPhoneNumber(phoneNumber: string): boolean {
	const regex = /(^(\+88|88)?(01){1}[3456789]{1}(\d){8})$/;
	return regex.test(phoneNumber);
}

function isValidSignature(buffer: Buffer, signature: string, secret: string): boolean {
	const computedSignature = createHmac('SHA256', secret)
		.update(buffer)
		.digest('base64');

	return computedSignature === signature;
}

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		const response = new Response('Done!');

		const body = await request.json<RequestPayload>();
		const wooSignature = request.headers.get('x-wc-webhook-signature')!;
		const bodyBuffer = Buffer.from(JSON.stringify(body), 'utf8');

		if (isValidSignature(bodyBuffer, wooSignature, env.SECRET)) {
			console.log(`Invalid signature.`);
			return response;
		}

		if (!body.billing) {
			console.log('Billing information not present');
			return response;
		}

		let phoneNumber = body.billing.phone;
		if (!isValidPhoneNumber(phoneNumber)) {
			console.log('Invalid phone number');
			return response;
		}

		if (phoneNumber.includes('+')) {
			phoneNumber = phoneNumber.replace('+', '');
		}

		const orderNumber = body.number;
		const totalPrice = body.total;

		let message = '';

		if (body.status === 'completed') {
			message = `Your order (ID: ${orderNumber}) has been completed. - Aurelya`;
		} else if (body.status === 'cancelled') {
			message = `Your order (ID: ${orderNumber}) has been cancelled. - Aurelya`;
		} else {
			console.log(`Ignored the status type ${body.status}`);
			return response;
		}

		console.log('Order number: ' + orderNumber);
		console.log('Total: ' + totalPrice);
		console.log('Message: ' + message);

		try {
			const resp = await sendSms(env, phoneNumber, message);
			console.log('Success! Response: \n' + JSON.stringify(resp, null, 2));
		} catch (e) {
			// @ts-expect-error The compiler screams
			console.log('Failed to send SMS. Error:\n' + e.message);
		}

		return response;
	},
};
