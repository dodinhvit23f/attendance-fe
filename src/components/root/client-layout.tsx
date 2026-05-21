"use client"
import * as React from "react";
import {Suspense} from "react";
import {Box, CssBaseline, ThemeProvider} from "@mui/material";

import {NotificationProvider} from "@/components/notification/NotificationProvider";
import {AuthProvider} from "@/components/auth/AuthProvider";
import {LoadingProvider} from "@/components/root/LoadingProvider";
import {theme} from "@/theme";

export {useLoading} from "@/components/root/LoadingProvider";

export default function ClientLayout({children}: { children: React.ReactNode; }) {
  return (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <LoadingProvider>
            <AuthProvider>
              <CssBaseline/>
              <Box
                sx={{
                  minHeight: '100vh',
                  background: 'linear-gradient(151deg, #ffffff 0%, #fff5f5 30%, #fdfdfd 55%, #ebebeb 80%, #F1F1F1 100%)',
                }}
              >
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </Box>
            </AuthProvider>
          </LoadingProvider>
        </NotificationProvider>
      </ThemeProvider>
  )
}
