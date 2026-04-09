const DEMO_PHONE = '933667414';

export const generateWhatsAppLink = (phone, message) => { 
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); 
  if (!cleanPhone) return '#'; 
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`; 
};

export const formatPhoneDisplay = (phone) => { 
  return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); 
};

export const getDemoPhone = () => DEMO_PHONE;
export const isDemoPhone = (phone) => phone.replace(/\s/g, '') === DEMO_PHONE;
