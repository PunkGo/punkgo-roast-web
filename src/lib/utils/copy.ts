/**
 * Cross-platform clipboard copy with fallback for WeChat/Douyin WebView.
 * navigator.clipboard.writeText doesn't work in most in-app browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	// Try modern Clipboard API first
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Falls through to fallback
		}
	}

	// Fallback: textarea + execCommand (works in WeChat/Douyin WebView)
	try {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();

		// iOS requires setSelectionRange
		textarea.setSelectionRange(0, textarea.value.length);

		const ok = document.execCommand('copy');
		document.body.removeChild(textarea);
		return ok;
	} catch {
		return false;
	}
}
