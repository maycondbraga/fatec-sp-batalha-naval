import { AppBar, Typography, Container } from "@mui/material"
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#083E57',
    },
  },
});

const Footer = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="relative" style={{top: '-10%'}}>
        <Container maxWidth="xl">
          <Typography textAlign="center" style={{ fontFamily: "bungee", color: "white" }}>© 2022 - Encouraçado Valente</Typography>
        </Container>
      </AppBar>
    </ ThemeProvider >
  )
}

export default Footer