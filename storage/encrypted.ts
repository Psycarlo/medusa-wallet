import * as SecureStore from 'expo-secure-store'

const VERSION = '1'

async function setItem(key: string, value: string) {
  const vKey = `${VERSION}_${key}`
  await SecureStore.setItemAsync(vKey, value)
}

async function getItem(key: string) {
  const vKey = `${VERSION}_${key}`
  return SecureStore.getItemAsync(vKey)
}

async function deleteItem(key: string) {
  const vKey = `${VERSION}_${key}`
  return SecureStore.deleteItemAsync(vKey)
}

export { deleteItem, getItem, setItem }
