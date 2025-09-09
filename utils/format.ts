function formatAddress(address: string) {
  if (address.length <= 16) return address

  const beginning = address.substring(0, 8)
  const end = address.substring(address.length - 8, address.length)
  return `${beginning}...${end}`
}

function formatNumber(n: number, decimals = 0, floor = false) {
  return decimals > 0
    ? n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
    : floor
      ? Math.floor(n).toLocaleString()
      : n.toLocaleString()
}

function formatTime(date: Date | string | number) {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  })
    .format(dateObj)
    .replace(' ', '')
    .toLowerCase()
}

function formatDate(date: Date | string | number) {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj)
}

function formatDateTime(date: Date | string | number) {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(dateObj)
}

function formatTimer(seconds: number, withHours: boolean = true) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${withHours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export {
  formatAddress,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  formatTimer
}
