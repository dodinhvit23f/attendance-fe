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
        <CircularProgress size={60} thickness={4} sx={{ color: "primary.main" }} />
        <Typography variant="h6" color="text.secondary" fontWeight="medium">
          Đang tải...
        </Typography>
      </Box>
  )
}
