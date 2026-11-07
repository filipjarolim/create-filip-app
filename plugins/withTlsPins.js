const fs = require('fs');
const path = require('path');
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

function withTlsPins(config, props = {}) {
  const pins = (props.pins ?? []).map((pin) => pin.trim()).filter(Boolean);
  const host = props.host;
  if (!host || pins.length === 0) {
    return config;
  }

  config = withDangerousMod(config, [
    'android',
    (mod) => {
      const directory = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(directory, { recursive: true });
      const pinXml = pins.map((pin) => `        <pin digest="SHA-256">${pin}</pin>`).join('\n');
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">${host}</domain>
    <pin-set expiration="2027-12-31">
${pinXml}
    </pin-set>
  </domain-config>
</network-security-config>
`;
      fs.writeFileSync(path.join(directory, 'network_security_config.xml'), xml);
      return mod;
    },
  ]);

  return withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return mod;
  });
}

module.exports = withTlsPins;
