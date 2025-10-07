import React from 'react'
import AppNavigatorNew from './src/navigation/AppNavigator-new'
import { UserProvider } from './src/context/UserContext'

export default function App() {
  return (
    <UserProvider>
      <AppNavigatorNew />
    </UserProvider>
  )
}
