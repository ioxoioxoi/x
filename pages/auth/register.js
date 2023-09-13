import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, TextField, Button, Link, Backdrop, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/PersonAdd';
import { styled } from '@mui/system';
import Store from 'store';
import CryptoJS from "crypto-js";
import ReactWaterMark from 'react-watermark-component';

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

const makeid = (length) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState('');
  const [captcha1, setCaptcha1] = useState(makeid(1));
  const [captcha2, setCaptcha2] = useState(makeid(1));
  const [captcha3, setCaptcha3] = useState((eval(captcha1) + eval(captcha2)).toString())
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (Store.get('auth-user')) {
      router.push('/');
    }
  }, [])

  const handleClick = () => {
    const _captcha1 = makeid(1)
    const _captcha2 = makeid(1)
    const _captcha3 = eval(_captcha1) + eval(_captcha2)
    setCaptcha1(_captcha1)
    setCaptcha2(_captcha2)
    setCaptcha3(_captcha3.toString())
  }

  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault();

    if (captcha !== captcha3.toString()) {
      alert('Wrong Captcha!')
      handleClick()
      setCaptcha('')
      setLoading(false)
      return false
    }
    fetch(`${process.env.NEXT_PUBLIC_API_APP}users/register_user`, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      body: JSON.stringify({
        email: email,
        username: username,
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
        Store.set('auth-user', authUser)
        Store.set('token-user', tokenUser)
        setTimeout(() => window.location.href='/', 1000)
      } else {
        alert(res.error)
      }
    }).catch(() => setLoading(false))
  };

  const handleChangeData = (e, _type) => {
    setLoading(true)
    e.preventDefault()
    fetch(`${process.env.NEXT_PUBLIC_API_APP}users/is_exist`, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      body: JSON.stringify({
        type: _type,
        value: e.target.value
      })
    }).then((res) => 
       res.json()
    ).then((res) => {
      setLoading(false)
      if (res.code === 1) {
        alert(res.error)
        if (_type === 'email') {
          setEmail('')
        } else {
          setUsername('')
        }
      }
    })
  };

  return (
    <StyledContainer>
      <StyledBox>
        <StyledLockOutlinedIcon />
        <Typography variant="h5" component="h1" align="center">
          Register New User
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={(e) => handleChangeData(e, 'email')}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={(e) => handleChangeData(e, 'username')}
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
          <TextField
            label={`Captcha ( ${captcha1} + ${captcha2} )`}
            type="text"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            margin="normal"
            required
          />
          <Button onClick={() => handleClick()} style={{marginTop: '25px'}}>Generate New Captcha</Button>
          <br/><br/>
          <Button  onClick={handleSubmit} type="submit" variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </form>
        <Link href="#" underline="none"></Link>
        <Button onClick={() => router.push('/auth/login')} variant="contained" color="secondary" style={{backgroundColor: 'gray !important'}} fullWidth>
          Login
        </Button>
      </StyledBox>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </StyledContainer>
  );
};

export default LoginPage;