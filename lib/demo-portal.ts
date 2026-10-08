export type DemoPortal = 'pusat' | 'fasil' | 'etoser'

export const portalConfig = {
  pusat: {
    title: 'Tim Pusat',
    subtitle: 'Command Center Pembinaan Nasional',
    welcome: 'Selamat datang, Tim Pusat',
    description: 'Pantau pembinaan lintas wilayah, review progres, dan kelola agenda nasional dari satu ruang kerja.',
    accent: 'Nasional',
  },
  fasil: {
    title: 'Fasilitator',
    subtitle: 'Ruang Pendampingan Wilayah',
    welcome: 'Halo, Fasilitator',
    description: 'Dampingi Etoser wilayahmu, tindak lanjuti progres, dan susun agenda pembinaan secara lebih terarah.',
    accent: 'Wilayah',
  },
  etoser: {
    title: 'Etoser',
    subtitle: 'Ruang Perjalanan Pembinaan',
    welcome: 'Hai, Etoser',
    description: 'Lihat agenda, tugas, laporan, feedback, dan histori perkembangan pembinaanmu dalam satu tempat.',
    accent: 'Personal',
  },
} as const

export function demoCookieName(portal: DemoPortal) {
  return 'etos_demo_' + portal
}

export function isDemoPortal(value: unknown): value is DemoPortal {
  return value === 'pusat' || value === 'fasil' || value === 'etoser'
}
