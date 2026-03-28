import QRCode from 'qrcode';

export async function generateQRDataURL(url: string): Promise<string> {
	try {
		return await QRCode.toDataURL(url, {
			width: 120,
			margin: 1,
			color: { dark: '#3A2518', light: '#FAFAF5' },
		});
	} catch {
		return '';
	}
}
