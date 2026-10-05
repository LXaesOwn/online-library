import dns from 'dns';

// Force IPv4 for DNS resolution to avoid slow IPv6 timeouts.
dns.setDefaultResultOrder('ipv4first');
