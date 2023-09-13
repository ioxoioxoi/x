import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, TextField, Button, Link, Backdrop, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/Login';
import { styled } from '@mui/system';
import Store from 'store';
import CryptoJS from "crypto-js";
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

  useEffect(() => {
    if (Store.get('auth-user')) {
      // router.push('/');
      window.location.href='/'
    } else {
      localStorage.clear()
    }
  }, [])

  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault();
    // fetch(`http://localhost:8080/users/login`, {
    fetch(`${process.env.NEXT_PUBLIC_API_APP}users/login`, {
      method: 'POST',
      redirect: 'error',
      base: process.env.NEXT_PUBLIC_API_APP,
      // mode: 'no-cors',
      headers: {
      },
      body: JSON.stringify({
        email: email,
        password: password,
        user_role: 2
      })
    }).then((res) => 
       res.json()
    ).then((res) => {
      setTimeout(() => setLoading(false), 1500)
      if (res.code === 0) {
        const authUser = CryptoJS.AES.encrypt(`${JSON.stringify(res.data)}`, `${process.env.SECRET_KEY}`).toString()
        const tokenUser = CryptoJS.AES.encrypt(`${res.data.token_login}`, `${process.env.SECRET_KEY}`).toString()
        
        Store.set('operators', res.operators)
        Store.set('banner_list', res.banner_list)
        // const api_key = CryptoJS.AES.encrypt(res.data.api_key, key).toString()
        // console.log(authUser + "\n" + tokenUser)
        // // const tokenUser = CryptoJS.AES.encrypt(
        // //   res.data.token_login,
        // //   CryptoJS.enc.Utf8.parse(process.env.SECRET_KEY)
        // // ).toString()
        // // const api_key = CryptoJS.AES.encrypt(
        // //   res.data.api_key,
        // //   CryptoJS.enc.Utf8.parse(process.env.SECRET_KEY)
        // // ).toString()

        Store.set('auth-user', authUser)
        Store.set('token-user', tokenUser)
        // Store.set('api_key', api_key)
        
        setIsOpenMessage2(true)
        setTimeout(() => setIsOpenMessage2(false), 1000)
        // setTimeout(() => window.location.href='/', 1000)
        setTimeout(() => router.push('/'), 1000)
        
      } else {
        setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        // alert(res.error)
      }
    }).catch(() => setLoading(false))
  };

  return (<>
    <StyledContainer>
      <StyledBox>
        <StyledLockOutlinedIcon />
        <Typography variant="h5" component="h1" align="center">
          Log in User
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
        <Button onClick={() => router.push('/auth/register')} variant="contained" color="secondary" style={{backgroundColor: 'gray !important'}} fullWidth>
          Register
        </Button>
      </StyledBox>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </StyledContainer>
    <Notif type="error" title="Error" message="Incorect Email or Password!" isOpen={isOpenMessage} />
    <Notif type="success" title="Success" message="Login success." isOpen={isOpenMessage2} />
  </>);
};

export default LoginPage;