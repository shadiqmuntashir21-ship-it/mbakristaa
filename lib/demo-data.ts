export type Role = 'tim_pusat' | 'fasilitator' | 'etoser'

export const demoActivities = [
  { id: '1', title: 'Workshop Community Empowerment Vol. 2', category: 'Workshop', date: '10 Okt 2026', time: '08.00–13.00', scope: 'Angkatan 2025', status: 'Berlangsung', progress: 84, tone: 'blue' },
  { id: '2', title: 'Jurnal Interaksi Masyarakat', category: 'Jurnal', date: '15 Okt 2026', time: '23.59', scope: 'Semua Etoser', status: 'Aktif', progress: 71, tone: 'teal' },
  { id: '3', title: 'Tematik Nasional Angkatan 2025', category: 'Tematik', date: '18 Okt 2026', time: '19.30–21.00', scope: 'Angkatan 2025', status: 'Terjadwal', progress: 0, tone: 'violet' },
  { id: '4', title: 'Kajian Islam Wilayah', category: 'Pembinaan Wilayah', date: '22 Okt 2026', time: '16.00–18.00', scope: 'Wilayah Palu', status: 'Terjadwal', progress: 0, tone: 'amber' },
]

export const demoParticipants = [
  { id: 'p1', name: 'Alya Rahma', code: 'ETS-PAL-2501', region: 'Palu', cohort: '2025', attendance: 96, completion: 94, points: 920, status: 'Aman' },
  { id: 'p2', name: 'Fikri Ramadhan', code: 'ETS-PAL-2502', region: 'Palu', cohort: '2025', attendance: 88, completion: 79, points: 820, status: 'Perlu perhatian' },
  { id: 'p3', name: 'Nabila Putri', code: 'ETS-MKS-2501', region: 'Makassar', cohort: '2025', attendance: 94, completion: 91, points: 895, status: 'Aman' },
  { id: 'p4', name: 'Rizky Akbar', code: 'ETS-MKS-2502', region: 'Makassar', cohort: '2025', attendance: 82, completion: 68, points: 740, status: 'Prioritas' },
  { id: 'p5', name: 'Nadia Azzahra', code: 'ETS-PDG-2301', region: 'Padang', cohort: '2023', attendance: 91, completion: 86, points: 860, status: 'Aman' },
  { id: 'p6', name: 'Arif Maulana', code: 'ETS-JBI-2501', region: 'Jambi', cohort: '2025', attendance: 87, completion: 83, points: 810, status: 'Perlu perhatian' },
]

export const attentionItems = [
  { name: 'Rizky Akbar', region: 'Makassar', issue: 'Worksheet Workshop terlambat 3 hari', severity: 'Prioritas' },
  { name: 'Fikri Ramadhan', region: 'Palu', issue: '2 tugas belum diselesaikan', severity: 'Perlu perhatian' },
  { name: 'Arif Maulana', region: 'Jambi', issue: 'Laporan bulanan belum dikirim', severity: 'Perlu perhatian' },
]

export const etoserTasks = [
  { title: 'Worksheet Workshop CE Vol. 2', meta: 'Deadline 12 Okt • 23.59', status: 'Belum dikumpulkan', action: 'Kerjakan' },
  { title: 'Refleksi Workshop CE Vol. 2', meta: 'Deadline 12 Okt • 23.59', status: 'Belum dimulai', action: 'Mulai' },
  { title: 'Jurnal Interaksi Masyarakat', meta: 'Deadline 15 Okt • 23.59', status: 'Selesai', action: 'Lihat' },
]
