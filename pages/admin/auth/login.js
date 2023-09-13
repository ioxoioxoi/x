import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, TextField, Button, Link, Backdrop, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import Store from 'store';
import Notif from '/functions/helpers/notif'

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 16px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const StyledLockOutlinedIcon = styled(LockOutlinedIcon)`
  font-size: 48px;
`;

const LoginPage = () => {
  const [isOpenMessage, setIsOpenMessage] = useState(false)
  const [isOpenMessage2, setIsOpenMessage2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault();
      fetch(`${process.env.NEXT_PUBLIC_API_APP}users/login`, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      body: JSON.stringify({
        email: email,
        password: password,
        user_role: 1
      })
    }).then((res) => 
       res.json()
    ).then((res) => {
      setTimeout(() => setLoading(false), 1500)
      if (res.code === 0) {
          Store.set('auth', res.data)
          Store.set('token', res.data.token_login)
          Store.set('api_key', res.data.api_key)
          setIsOpenMessage2(true)
          setTimeout(() => setIsOpenMessage2(false), 1000)
          setTimeout(() => router.push('/admin/'), 1000)
      } else {
        // alert(res.error)
        setIsOpenMessage(true)
      }
    }).catch(() => setLoading(false))
  };

  useEffect(() => {
    if (Store.get('aut')) {
      // router.push('/');
      window.location.href='/admin'
    } else {
      localStorage.clear()
    }
  }, [])

  return (
    <StyledContainer>
      <StyledBox>
        <StyledLockOutlinedIcon />
        <Typography variant="h5" component="h1" align="center">
          Log in Admin
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <br/><br/>
          <Button  onClick={handleSubmit} type="submit" variant="contained" color="primary" fullWidth>
            Log in
          </Button>
        </form>
        <Link href="#" underline="none">
          Forgot password?
        </Link>
      </StyledBox>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
          <Notif type="error" title="Error" message="Incorect Email or Password!" isOpen={isOpenMessage} />
          <Notif type="success" title="Success" message="Login success." isOpen={isOpenMessage2} />
    </StyledContainer>
  );
};

export default LoginPage;