// Update BlackRoad DNS via Cloudflare API
// Run with: node update-dns-via-api.js

const TUNNEL_TARGET = '90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com';

// You'll need to create an API token with DNS edit permissions
// Get it from: https://dash.cloudflare.com/profile/api-tokens
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'PASTE_TOKEN_HERE';

const ZONES_AND_DOMAINS = {
  'blackroad.io': ['console', 'app', 'os', 'desktop', 'virtual.desktop', 'login', 'billing', 'github', 'web.browser', 'roadchain', 'roadcoin', 'internal', 'agents'],
  'blackroad.systems': ['console', 'os', 'desktop'],
  'blackroad.me': ['console', 'os', 'desktop'],
  'blackroad.network': ['console', 'os', 'desktop'],
  'blackroadai.com': ['console', 'os', 'desktop'],
  'blackroadquantum.com': ['console', 'os', 'desktop'],
  'lucidia.studio': ['console', 'os', 'desktop'],
  'lucidia.earth': ['console', 'os', 'desktop'],
  'blackroadinc.us': ['@'] // root domain
};

async function getZones() {
  const response = await fetch('https://api.cloudflare.com/client/v4/zones?per_page=50', {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!data.success) {
    console.error('Failed to get zones:', data.errors);
    process.exit(1);
  }
  return data.result;
}

async function getDNSRecords(zoneId, name) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${name}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data.result || [];
}

async function createDNSRecord(zoneId, name, target) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'CNAME',
      name: name,
      content: target,
      ttl: 1,
      proxied: true
    })
  });
  return await response.json();
}

async function updateDNSRecord(zoneId, recordId, name, target) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'CNAME',
      name: name,
      content: target,
      ttl: 1,
      proxied: true
    })
  });
  return await response.json();
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BlackRoad DNS Update via API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (API_TOKEN === 'PASTE_TOKEN_HERE') {
    console.error('❌ Please set CLOUDFLARE_API_TOKEN environment variable');
    console.error('   or edit this file to add your token\n');
    console.error('Get token from: https://dash.cloudflare.com/profile/api-tokens');
    process.exit(1);
  }

  console.log('📡 Fetching zones...');
  const allZones = await getZones();

  let updated = 0;
  let created = 0;
  let failed = 0;

  for (const [zoneName, subdomains] of Object.entries(ZONES_AND_DOMAINS)) {
    const zone = allZones.find(z => z.name === zoneName);
    if (!zone) {
      console.log(`⏭️  Skipping ${zoneName} (not found or no access)`);
      continue;
    }

    console.log(`\n📝 Processing ${zoneName} (${zone.id})`);

    for (const subdomain of subdomains) {
      const fullName = subdomain === '@' ? zoneName : `${subdomain}.${zoneName}`;
      process.stdout.write(`  ${fullName}... `);

      try {
        const existing = await getDNSRecords(zone.id, fullName);

        if (existing.length > 0) {
          // Update existing record
          const result = await updateDNSRecord(zone.id, existing[0].id, fullName, TUNNEL_TARGET);
          if (result.success) {
            console.log('✅ Updated');
            updated++;
          } else {
            console.log(`❌ Failed: ${result.errors[0]?.message || 'Unknown error'}`);
            failed++;
          }
        } else {
          // Create new record
          const result = await createDNSRecord(zone.id, fullName, TUNNEL_TARGET);
          if (result.success) {
            console.log('✅ Created');
            created++;
          } else {
            console.log(`❌ Failed: ${result.errors[0]?.message || 'Unknown error'}`);
            failed++;
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`  ✅ Updated:  ${updated}`);
  console.log(`  ✅ Created:  ${created}`);
  console.log(`  ❌ Failed:   ${failed}`);
  console.log(`  📊 Total:    ${updated + created + failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (updated + created > 0) {
    console.log('✅ DNS updates complete!');
    console.log('\n⏱️  Wait 1-5 minutes for DNS propagation, then test:');
    console.log('   cd ~/blackroad-console-deploy && ./test-all-domains.sh\n');
  }
}

main().catch(console.error);
