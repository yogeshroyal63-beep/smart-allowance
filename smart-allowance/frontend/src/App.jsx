import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import Landing from './components/Landing'
import ParentDashboard from './components/dashboard/ParentDashboard'
import ChildDashboard from './components/dashboard/ChildDashboard'
import Layout from './components/shared/Layout'

function AppRoutes() {
  const { role } = useApp()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/parent" element={
        <Layout role="parent">
          <ParentDashboard />
        </Layout>
      } />
      <Route path="/child" element={
        <Layout role="child">
          <ChildDashboard />
        </Layout>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111a19',
              color: '#e8f5f3',
              border: '1px solid #2a4040',
              fontFamily: 'Space Grotesk',
              fontSize: '14px'
            }
          }}
        />
      </AppProvider>
    </BrowserRouter>
  )
}
