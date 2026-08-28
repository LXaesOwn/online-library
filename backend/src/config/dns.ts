import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

console.log('✅ DNS configured to use IPv4 first');
