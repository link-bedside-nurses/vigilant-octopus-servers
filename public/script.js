/* eslint-disable no-undef */
document.getElementById('deletionForm').addEventListener('submit', async function (event) {
	event.preventDefault();

	const email = document.getElementById('email').value;
	const successMessage = document.getElementById('successMessage');
	const errorMessage = document.getElementById('errorMessage');

	// Hide any existing messages
	successMessage.style.display = 'none';
	errorMessage.style.display = 'none';

	successMessage.style.display = 'none';
	errorMessage.style.display = 'none';

	try {
		console.log('Deleting...');
		const response = await fetch('http://localhost:8000/api/v1.1/auth/accounts/deletion', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		const data = await response.json();

		if (response.ok) {
			// Show success message
			successMessage.style.display = 'block';
			document.getElementById('deletionForm').reset();
		} else {
			// Show error message
			errorMessage.textContent = data.message || 'An error occurred. Please try again later.';
			errorMessage.style.display = 'block';
		}
	} catch (error) {
		// Show error message for network errors
		errorMessage.textContent = 'Network error. Please check your connection and try again.';
		errorMessage.style.display = 'block';
	}
});
