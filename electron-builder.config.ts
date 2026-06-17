import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.scut.soundboard',
  productName: 'Scut',
  directories: {
    buildResources: 'resources'
  },
  files: [
    'out/**/*',
    '!out/**/*.map'
  ],
  extraResources: [
    {
      from: 'resources/',
      to: 'resources/',
      filter: ['**/*']
    }
  ],
  mac: {
    entitlementsInherit: 'resources/entitlements.mac.plist',
    extendInfo: {
      NSMicrophoneUsageDescription: 'Ses dosyası kaydı için mikrofon erişimi',
      NSDocumentsFolderUsageDescription: 'Ses dosyalarını yönetmek için gerekli'
    },
    notarize: false,
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] }
    ]
  },
  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] }
    ],
    category: 'AudioVideo',
    maintainer: '',
    desktop: {
      StartupWMClass: 'Scut'
    }
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true
  }
}

export default config
