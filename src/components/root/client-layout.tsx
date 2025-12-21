"use client"
import * as React from "react";
import {createContext, useContext, useState} from "react";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "@/app/page";
import {LoadingScreen} from "@/components/auth/LoadingScreen/loading-screen";
import {NotificationProvider} from "@/components/notification/NotificationProvider";

const LoadingContext = createContext<any>(null)

export function useLoading() {
  return useContext(LoadingContext)
}

export default function ClientLayout({children}: { children: React.ReactNode; }) {
  const [isLoading, setLoading] = useState(true)

  return (
      <LoadingContext.Provider value={{setLoading}}>
        <NotificationProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline/>
            {isLoading ? <LoadingScreen/> : <></>}
            {children}
          </ThemeProvider>
        </NotificationProvider>
      </LoadingContext.Provider>
  )
}