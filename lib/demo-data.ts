export type Role = 'tim_pusat' | 'fasilitator' | 'etoser'

export type ActivityItem = {
  id:string
  title:string
  category:string
  date:string
  time:string
  scope:string
  status:string
  progress:number
  tone:string
}

export type ParticipantItem = {
  id:string
  name:string
  code:string
  region:string
  cohort:string
  attendance:number
  completion:number
  points:number
  status:string
}

export type TaskItem = {
  id:string
  assignmentId?:string
  activityId?:string
  activityTitle:string
  title:string
  requirementType:'attendance'|'worksheet'|'journal'|'assessment'|'text'|'form'|'file'|'photo'|'link'|'documentation'|'checklist'|'approval'|'group_assignment'
  instructions?:string
  meta:string
  status:string
  statusKey:string
  action:string
}

export const demoActivities:ActivityItem[] = [
  { id: '1', title: 'Workshop Community Empowerment Vol. 2', category: 'Workshop', date: '10 Okt 2026', time: '08.00–13.00', scope: 'Angkatan 2025', status: 'Berlangsung', progress: 84, tone: 'blue' },
  { id: '2', title: 'Jurnal Interaksi Masyarakat', category: 'Jurnal', date: '15 Okt 2026', time: '23.59', scope: 'Semua Etoser', status: 'Aktif', progress: 71, tone: 'teal' },
  { id: '3', title: 'Tematik Nasional Angkatan 2025', category: 'Tematik', date: '18 Okt 2026', time: '19.30–21.00', scope: 'Angkatan 2025', status: 'Terjadwal', progress: 0, tone: 'violet' },
  { id: '4', title: 'Kajian Islam Wilayah', category: 'Pembinaan Wilayah', date: '22 Okt 2026', time: '16.00–18.00', scope: 'Wilayah Palu', status: 'Terjadwal', progress: 0, tone: 'amber' },
]

export const demoParticipants:ParticipantItem[] = [
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

export const etoserTasks:TaskItem[] = [
  {
    id:'t1', assignmentId:'demo-a1', activityId:'1', activityTitle:'Workshop Community Empowerment Vol. 2',
    title:'Presensi Workshop CE Vol. 2', requirementType:'attendance',
    meta:'10 Okt • 08.00–13.00', status:'Belum check-in', statusKey:'not_started', action:'Check-in'
  },
  {
    id:'t2', assignmentId:'demo-a2', activityId:'1', activityTitle:'Workshop Community Empowerment Vol. 2',
    title:'Worksheet Workshop CE Vol. 2', requirementType:'worksheet',
    instructions:'Tuliskan pembelajaran utama, masalah komunitas yang dipilih, dan rencana tindak lanjut.',
    meta:'Deadline 12 Okt • 23.59', status:'Belum dikumpulkan', statusKey:'not_started', action:'Kerjakan'
  },
  {
    id:'t3', assignmentId:'demo-a3', activityId:'1', activityTitle:'Workshop Community Empowerment Vol. 2',
    title:'Refleksi Workshop CE Vol. 2', requirementType:'journal',
    instructions:'Tuliskan insight utama dan refleksi pribadi setelah mengikuti workshop.',
    meta:'Deadline 12 Okt • 23.59', status:'Belum dimulai', statusKey:'not_started', action:'Mulai'
  },
  {
    id:'t4', assignmentId:'demo-a4', activityId:'2', activityTitle:'Jurnal Interaksi Masyarakat',
    title:'Jurnal Interaksi Masyarakat', requirementType:'journal',
    meta:'Deadline 15 Okt • 23.59', status:'Selesai', statusKey:'verified', action:'Lihat'
  },
]
