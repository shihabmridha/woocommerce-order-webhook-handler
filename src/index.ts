import { Env, RequestPayload } from './types';
import { createHmac } from 'node:crypto';

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const response = new Response('Done!');

		const body = await request.json<RequestPayload>();
		const wooSignature = request.headers.get('x-wc-webhook-signature');
		const bodyBuffer = Buffer.from(JSON.stringify(body), 'utf8');

		const computedSignature = createHmac('SHA256', env.SECRET)
			.update(bodyBuffer)
			.digest('base64');

		if (computedSignature !== wooSignature) {
			console.log(`Invalid signature. (Computed: ${computedSignature}, WooSignature: ${wooSignature})`);
			return response;
		}

		if (!body.billing) {
			console.log('Billing information not present');
			return response;
		}

		let phoneNumber = body.billing.phone;
		const regex = /(^(\+88|88)?(01){1}[3456789]{1}(\d){8})$/;

		if (!regex.test(phoneNumber)) {
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
			const params = new URLSearchParams({
				api_key: env.SMS_API_KEY,
				senderid: env.SMS_API_SENDER_ID,
				number: phoneNumber,
				message,
			});

			const apiResponse = await fetch(`${env.SMS_API_HOST}?${params.toString()}`);
			if (!apiResponse.ok) {
				const errResp = await apiResponse.json();
				console.log('Failed to send request. Error:\n' + JSON.stringify(errResp, null, 2));
				return response;
			}

			const okResp = await apiResponse.json();
			console.log('Success! Response: \n' + JSON.stringify(okResp, null, 2));
		} catch (e) {
			// @ts-expect-error The compiler screams
			console.log('Failed to send SMS. Error:\n' + e.message);
		}

		return response;
	},
};
