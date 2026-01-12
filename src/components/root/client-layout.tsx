"use client"
import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {Box, CssBaseline, ThemeProvider} from "@mui/material";

import {LoadingScreen} from "@/components/auth/LoadingScreen/loading-screen";
import {NotificationProvider} from "@/components/notification/NotificationProvider";
import {createTheme} from "@mui/material/styles";


const LoadingContext = createContext<any>(null)

export function useLoading() {
  return useContext(LoadingContext)
}

export const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#6D4C41',
      dark: '#4E342E',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#D7CCC8',
      contrastText: '#3E2723',
    },

    background: {
      default: '#FFFFFF',
      paper: '#FAF7F5',
    },

    text: {
      primary: '#3E2723',
      secondary: '#6D4C41',
    },

    divider: '#E0D7D3',

    error: {
      main: '#C62828',
    },
  },

  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,

    h1: {
      fontWeight: 700,
      color: '#3E2723',
    },
    h2: {
      fontWeight: 600,
      color: '#3E2723',
    },
  },
})

export default function ClientLayout({children}: { children: React.ReactNode; }) {
  const [isLoading, setLoading] = useState(true)

  return (

      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <LoadingContext.Provider value={{isLoading, setLoading}}>
            <CssBaseline/>
            <Box
              sx={{
                minHeight: '100vh',
                background: 'linear-gradient(151deg, #ffffff 0%, #fff5f5 30%, #fdfdfd 55%, #ebebeb 80%, #F1F1F1 100%)',
              }}
            >
              {isLoading ? <LoadingScreen/> : <></>}
              {children}
            </Box>
          </LoadingContext.Provider>
        </NotificationProvider>
      </ThemeProvider>

  )
}