export function isTypingInsideField(activeElement: Element | null): boolean {
  if (!activeElement) {
    return false;
  }

  const tagName = activeElement.tagName.toUpperCase();
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}
