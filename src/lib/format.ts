export const fcfa = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
