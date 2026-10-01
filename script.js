document.querySelectorAll('.decision').forEach((button) => {
  button.addEventListener('click', () => {
    const result = document.querySelector('.decision-result');
    const isCapture = button.dataset.result.includes('Capture');
    result.textContent = isCapture
      ? 'Capture request logged · Order remains UNCERTAIN until the next layer is checked.'
      : 'Manual review started · The order is held and cannot auto-seal.';
    document.querySelectorAll('.decision').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
  });
});

