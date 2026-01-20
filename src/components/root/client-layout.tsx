"use client"
import * as React from "react";
import {createContext, Suspense, useContext, useState} from "react";
import {Box, CssBaseline, ThemeProvider} from "@mui/material";

import {LoadingScreen} from "@/components/auth/LoadingScreen/loading-screen";
import {NotificationProvider} from "@/components/notification/NotificationProvider";
import {AuthProvider} from "@/components/auth/AuthProvider";
import {theme} from "@/theme";


const LoadingContext = createContext<any>(null)

export function useLoading() {
  return useContext(LoadingContext)
}

export default function ClientLayout({children}: { children: React.ReactNode; }) {
  const [isLoading, setLoading] = useState(true)

  return (

      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <LoadingContext.Provider value={{isLoading, setLoading}}>
            <AuthProvider>
              <CssBaseline/>
              <Box
                sx={{
                  minHeight: '100vh',
                  background: 'linear-gradient(151deg, #ffffff 0%, #fff5f5 30%, #fdfdfd 55%, #ebebeb 80%, #F1F1F1 100%)',
                }}
              >
                {isLoading ? <LoadingScreen/> : <></>}
                <Suspense fallback={null}>
                {children}
                </Suspense>
              </Box>
            </AuthProvider>
          </LoadingContext.Provider>
        </NotificationProvider>
      </ThemeProvider>

  )
}