
export function parseFields(text) {
  const cleaned = text.replace(/\r/g, '').trim();

  // Email
  const emailMatch = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0] : '';

  // Phones
  const phoneMatches = cleaned.match(/(?:\+?\d[\s-]?){7,15}/g) || [];
  const phones = [...new Set(phoneMatches)].map(p => p.replace(/\s+/g, ' ').trim());
  const phone = phones[0] || '';

  // Website
  const webMatch = cleaned.match(/(https?:\/\/)?(www\.)?[a-z0-9.-]+\.[a-z]{2,}(\/[\w.-]*)?/i);
  const website = webMatch ? webMatch[0].replace(/^(https?:\/\/)/, '') : '';

  // Designation
  const desigMatch = cleaned.match(/(Founder|CEO|CTO|Director|Manager|Head|Lead|Engineer|Consultant|Analyst|Owner)/i);
  const designation = desigMatch ? desigMatch[0] : '';

  // Lines
  const lines = cleaned.split(/\n+/).map(s => s.trim()).filter(Boolean);

  // Company
  let company = '';
  for (const line of lines) {
    if (/(pvt|private|llp|ltd|limited|technologies|solutions|labs|studio|systems|services)/i.test(line)) {
      company = line; break;
    }
  }
  if (!company && email) {
    const domain = email.split('@')[1]?.split('.')[0] || '';
    if (domain) company = domain.charAt(0).toUpperCase() + domain.slice(1);
  }

  // Name
  let name = '';
  for (const line of lines) {
    if (/^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line) && !/(Pvt|LLP|Ltd|Technologies|Solutions|Services)/i.test(line)) {
      name = line; break;
    }
  }

  // Address (rough)
  const addressLines = lines.filter(l => /\d/.test(l) && /(road|rd\.?|street|st\.?|lane|ln\.?|area|sector|phase|floor|fl\.?|block|bldg|building|complex|nagar|marg|city|state|india|pin|zip)/i.test(l));
  const address = addressLines.slice(0, 3).join(', ');

  return { name, phone, phones, email, company, website, address, designation, raw: cleaned };
}
