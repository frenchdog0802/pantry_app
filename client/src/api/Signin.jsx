import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  CardActions,
  Button,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import auth from "./auth-helper.js";
import { Navigate, useLocation, Link as RouterLink } from "react-router-dom";
import { signin } from "./api-auth.js";

// Full-page wrapper
const SigninContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(120deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

// Card styling
const SigninCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[5],
}));

// Header typography
const Header = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginTop: theme.spacing(2),
  color: theme.palette.primary.dark,
}));

export default function Signin() {
  const theme = useTheme();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "", error: "", redirectToReferrer: false });

  const { from } = location.state || { from: { pathname: "/" } };
  const { redirectToReferrer } = values;

  if (redirectToReferrer) return <Navigate to={from} />;

  const handleChange = (name) => (event) => setValues({ ...values, [name]: event.target.value });

  const clickSubmit = () => {
    const user = { email: values.email, password: values.password };
    signin(user).then((data) => {
      if (data.error) setValues({ ...values, error: data.error });
      else auth.authenticate(data, () => setValues({ ...values, error: "", redirectToReferrer: true }));
    });
  };

  return (
    <SigninContainer>
      <SigninCard>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Header variant="h5">Welcome Back</Header>
          <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            Sign in to continue your adventure in MapleWorld.
          </Typography>

          <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={values.email}
            onChange={handleChange('email')}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            value={values.password}
            onChange={handleChange('password')}
          />
          {values.error && (
            <Typography component="p" color="error" sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon sx={{ mr: 0.5 }}>error</Icon>{values.error}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" size="large" onClick={clickSubmit} sx={{ px: 5, py: 1.5 }}>
            Sign In
          </Button>
        </CardActions>
      </SigninCard>
    </SigninContainer>
  );
}