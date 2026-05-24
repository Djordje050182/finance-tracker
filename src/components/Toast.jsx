import React, { useEffect, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(id);
  }, [message]);
  return [message, setMessage];
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-[70] animate-fade-in">
      <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}
