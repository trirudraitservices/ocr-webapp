export function parseFields(text){
  const cleaned = text.replace(/\r/g,'').trim();
  const email = (cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [''])[0];
  const phones = [...new Set(cleaned.match(/(?:\+?\d[\s-]?){7,15}/g) || [])].map(p=>p.replace(/\s+/g,' ').trim());
  const phone = phones[0] || '';
  const website = (cleaned.match(/(https?:\/\/)?(www\.)?[a-z0-9.-]+\.[a-z]{2,}(\/[\w.-]*)?/i) || [''])[0].replace(/^(https?:\/\/)/,'');
  const lines = cleaned.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  let company = lines.find(l=>/(pvt|private|llp|ltd|limited|technologies|solutions|labs|studio|systems|services)/i.test(l)) || '';
  if (!company && email){ const d = email.split('@')[1]?.split('.')[0] || ''; if (d) company = d.charAt(0).toUpperCase()+d.slice(1); }
  let name = ''; for (const l of lines) { if (/^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(l) && !/(Pvt|LLP|Ltd|Technologies|Solutions|Services)/i.test(l)){ name=l; break; } }
  const designation = (cleaned.match(/(Founder|CEO|CTO|Director|Manager|Head|Lead|Engineer|Consultant|Analyst|Owner)/i) || [''])[0];
  const addressLines = lines.filter(l=>/\d/.test(l) && /(road|rd\.?|street|st\.?|lane|ln\.?|area|sector|phase|floor|fl\.?|block|bldg|building|complex|nagar|marg|city|state|india|pin|zip)/i.test(l));
  const address = addressLines.slice(0,3).join(', ');
  return { name, phone, phones, email, company, website, address, designation, raw: cleaned };
}
