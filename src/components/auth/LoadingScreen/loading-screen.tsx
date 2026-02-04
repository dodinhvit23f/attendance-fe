"use client"

import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

export function LoadingScreen() {
  return (
      <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            gap: 3,
          }}
      >
        <Box sx={{ position: "relative", width: 60, height: 60 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: "primary.main" }} />
          <Box
            component="img"
            src="/favicon.ico"
            alt="logo"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
            }}
          />
        </Box>
        <Typography variant="h6" color="text.secondary" fontWeight="medium">
          Đang tải...
        </Typography>
      </Box>
  )
}
