import React, {useLayoutEffect} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  IconButton, Stack, Grid, Avatar,
  Badge, Chip, Menu, MenuItem, Backdrop, CircularProgress, Dialog, DialogTitle, DialogActions,
  DialogContent, Divider, FormControl, InputLabel, OutlinedInput, InputAdornment, Button, TextField
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Nightlight, Close, Refresh,
  CurrencyExchange, AccountBalanceWallet, VisibilityOff, Visibility
} from '@mui/icons-material';
import Store from 'store';
import axios from 'axios';
import {number_format} from '@/functions/helpers/general'
import {filter} from 'lodash'
import JWT from 'expo-jwt'
import ReactFlagsSelect from 'react-flags-select';
import CryptoJS from "crypto-js";
import Notif from '/functions/helpers/notif'

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `100%`,
    marginLeft: `${drawerWidth}px`,
    backgroundColor: '#FFFFFF',
    color: '#0EAC40',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const router = useRouter();

  let _authUser = {}
  let authUser = '{}'
  let _currSymbol = {}
  let currSymbol = '{}'
  if (Store.get('currency')) {
    currSymbol = CryptoJS.AES.decrypt(`${Store.get('currency')}`, `${process.env.SECRET_KEY}`)?.toString(CryptoJS.enc.Utf8) ?? {}
    _currSymbol = (currSymbol) ? JSON?.parse(currSymbol) : {}
    authUser = CryptoJS.AES.decrypt(`${Store.get('auth-user')}`, `${process.env.SECRET_KEY}`)?.toString(CryptoJS.enc.Utf8) ?? {}
    _authUser = (authUser) ? JSON?.parse(authUser) : {}
  }

  const [isOpenMessage, setIsOpenMessage] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(true);
  const [anchorElMenu, setAnchorElMenu] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [languages, setLanguages] = React.useState(false);
  const [countrySelected, setCountrySelected] = React.useState('');
  const [dataUser, setDataUser] = React.useState(_authUser);
  const [showPassword, setShowPassword] = React.useState(true);
  const [newPassword, setNewPassword] = React.useState('');
  const [openDialogDetail, setOpenDialogDetail] = React.useState(false)
  const [randomNumber, setRandomNumber] = React.useState(Math.floor(Math.random() * 100) + 1)
  const handleClickMenu = (event) => {
    setAnchorElMenu(event.currentTarget);
    setOpenMenu(true)
  };
  const handleCloseMenu = () => {
    setOpenMenu(false)
    setAnchorElMenu(undefined)
  };

  const updateCountry = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}basedata/list_countries`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`)?.toString(CryptoJS.enc.Utf8)
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth-user');
        Store.remove('token');
        Store.remove('api_key');
        setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        setTimeout(() => window.location.href=('/auth/login'), 500)
        return false
      }
      Store.set('list_countries', res?.data?.data)
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/list_setting_app`, {
        token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then((res) => {
        if (res?.data?.error === 'Token is not valid!') {
          setLoading(false)
          Store.set('myInterval', 0);
          Store.remove('auth-user');
          Store.remove('token');
          Store.remove('api_key');
          setIsOpenMessage(true)
          setTimeout(() => setIsOpenMessage(false), 1000)
          setTimeout(() => window.location.href=('/auth/login'), 500)
          return false
        }
        const _dataCurrency = filter(res?.data?.data?.setting_app, ['key_setting', 'Currency'])[0]?.val_setting
        const dataCurrency = filter(res?.data?.data?.base_currencies, ['currency_code', _dataCurrency])[0]
        const dataApp = filter(res?.data?.data?.setting_app, ['key_setting', 'App Name'])[0]
        const dataTheme = filter(res?.data?.data?.setting_app, ['key_setting', 'Theme'])[0]
        const dataLanguage = filter(res?.data?.data?.setting_app, ['key_setting', 'User Language'])[0]
        // Store.set('currency', JWT.encode(dataCurrency, process.env.SECRET_KEY))
        // Store.set('app', JWT.encode(dataApp, process.env.SECRET_KEY))
        // Store.set('theme', JWT.encode(dataTheme, process.env.SECRET_KEY))
        // Store.set('language', JWT.encode(dataLanguage, process.env.SECRET_KEY))
        // console.log('dataLanguage: ', dataLanguage)
        // console.log('dataLanguage: ', dataLanguage)
          if (!Store.get('id_base_language')) {
            setCountrySelected(dataLanguage?.val_setting)
          }
        Store.set('currency', CryptoJS.AES.encrypt(`${JSON.stringify(dataCurrency)}`, `${process.env.SECRET_KEY}`).toString())
        Store.set('app', CryptoJS.AES.encrypt(`${JSON.stringify(dataApp)}`, `${process.env.SECRET_KEY}`).toString())
        Store.set('theme', CryptoJS.AES.encrypt(`${JSON.stringify(dataTheme)}`, `${process.env.SECRET_KEY}`).toString())
        Store.set('language', CryptoJS.AES.encrypt(`${JSON.stringify(dataLanguage)}`, `${process.env.SECRET_KEY}`).toString())

        
        axios.post(`${process.env.NEXT_PUBLIC_API_APP}basedata/list_languages`, {
          token_login: Store.get('token')
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        })
        .then((res) => {
          if (res?.data?.error === 'Token is not valid!') {
            setLoading(false)
            Store.set('myInterval', 0);
            Store.remove('auth-user');
            Store.remove('token');
            Store.remove('api_key');
            localStorage.clear()
            setIsOpenMessage(true)
            setTimeout(() => setIsOpenMessage(false), 1000)
            // alert('Token is not valid or User has been logged in other Device!')
            setTimeout(() => window.location.href=('/auth/login'), 500)
            return false
          }
          setLanguages(res?.data?.data?.setting_language)
          const _idDataLang = filter(res?.data?.data?.base_languages, ['language_code', dataLanguage?.val_setting])[0]?.id
          Store.set('all_languages', res?.data?.data?.setting_language)
          if (!Store.get('id_base_language')) {
            Store.set('id_base_language', _idDataLang)
            // setTimeout(() => window.location.href=('/'), 1000)
          }
          Store.set('languages', filter(res?.data?.data?.setting_language, ['id_base_language', _idDataLang]))
          Store.set('myIntervalUser', 0)
        })
      })  
    })  
  }

  const updateSaldo = () => {
    // setLoading(true)
    // axios.post(`http://fi.bestpva.org/service/get_operators`, {
    axios.post(`${process.env.NEXT_PUBLIC_API_FINANCE}saldo/get_user_saldo`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth-user');
        Store.remove('token');
        Store.remove('api_key');
        localStorage.clear()
        setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        // alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => window.location.href=('/auth/login'), 500)
        return false
      }
      // Store.set('chipper', JWT.encode(number_format(res?.data?.data?.saldo), process.env.SECRET_KEY))
      Store.set('chipper', CryptoJS.AES.encrypt(`${number_format(res?.data?.data?.saldo)}`, `${process.env.SECRET_KEY}`).toString())
    
      // updateCountry()
      // setTimeout(() => setLoading(false), 100)
      if (Store.get(randomNumber)) {
        const timer = setTimeout(() => {
          updateSaldo()
        }, 5000);
        return () => clearTimeout(timer);
      }
    })
  }

  const updateValue = () => {
    setLoading(true)
    // axios.post(`http://fi.bestpva.org/service/get_operators`, {
    axios.post(`${process.env.NEXT_PUBLIC_API_FINANCE}saldo/get_user_saldo`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth-user');
        Store.remove('token');
        Store.remove('api_key');
        localStorage.clear()
        setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        // alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => window.location.href=('/auth/login'), 500)
        return false
      }
      // Store.set('chipper', JWT.encode(number_format(res?.data?.data?.saldo), process.env.SECRET_KEY))
      Store.set('chipper', CryptoJS.AES.encrypt(`${number_format(res?.data?.data?.saldo)}`, `${process.env.SECRET_KEY}`).toString())
    
      updateCountry()
      setTimeout(() => setLoading(false), 100)
    })
  }

  React.useEffect(() => {    
    if (Store.get('id_base_language')) {
      // console.log(Store.get('id_base_language'))
      if (Store.get('id_base_language') === "1") {
        setCountrySelected('ID')
      } else if (Store.get('id_base_language') === "2") {
        setCountrySelected('GB')
      } else if (Store.get('id_base_language') === "3") {
        setCountrySelected('US')
      } else if (Store.get('id_base_language') === "4") {
        setCountrySelected('CN')
      } else if (Store.get('id_base_language') === "5") {
        setCountrySelected('RU')
      }
    }
  }, [Store.get('id_base_language')])

  React.useEffect(() => {
    if (!Store.get('auth-user')) {
      window.location.href='/auth/login'
      return false;
    } else if (Store.get('auth-user') && (!Store.get('myIntervalUser') || Store.get('myIntervalUser') < 1)) {
      Store.set('myIntervalUser', 1)
      setLoading(true)
      updateValue()
    }
    // updateValue()
      
      Store.set(randomNumber, true);
      const timer = setTimeout(() => {
        updateSaldo()
      }, 1000);
      return () => clearTimeout(timer);
  }, [])

  useLayoutEffect(() => {
      return () => {
        Store.remove(randomNumber)
      }
  }, [])

  const generateAPIKey = () => {
    const x = confirm('Are you sure you want to Re-Generate API-Key?')
    if (x) {
      setOpenDialogDetail(false)
      setLoading(true)
      const data = new FormData()
      data.append('token_login', CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8))
      fetch(`${process.env.NEXT_PUBLIC_API_APP}users/generate_api_key`, {
          method: 'POST',
          body: data,
      }).then((res) => res.json())
      .then((res) =>  {
        if (res?.data?.error === 'Token is not valid!') {
          setLoading(false)
          Store.set('myInterval', 0);
          Store.remove('auth');
          Store.remove('token');
          Store.remove('api_key');
          localStorage.clear()
          setIsOpenMessage(true)
          setTimeout(() => setIsOpenMessage(false), 1000)
          // alert('Token is not valid or User has been logged in other Device!')
          setTimeout(() => window.location.href=('/admin/auth/login'), 500)
          return false
        }
        const authUser = CryptoJS.AES.encrypt(`${JSON.stringify(res?.data)}`, `${process.env.SECRET_KEY}`).toString()
        Store.set('auth-user', authUser)
        setTimeout(() => {
          setLoading(false)
          setOpenDialogDetail(true)
        }, 1500)            
      })
    }
  }

  const handleChangePassword = () => {
    if (newPassword != '') {
      const x = confirm('Are you sure you want to Change Password?')
      if (x) {
        setOpenDialogDetail(false)
        setLoading(true)
        const data = new FormData()
        data.append('token_login', CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8))
        data.append('password', newPassword)
        fetch(`${process.env.NEXT_PUBLIC_API_APP}users/change_password_user`, {
            method: 'POST',
            body: data,
        }).then((res) => res.json())
        .then((res) =>  {
          if (res?.data?.error === 'Token is not valid!') {
            setLoading(false)
            Store.set('myInterval', 0);
            Store.remove('auth');
            Store.remove('token');
            Store.remove('api_key');
            localStorage.clear()
            setIsOpenMessage(true)
            setTimeout(() => setIsOpenMessage(false), 1000)
            // alert('Token is not valid or User has been logged in other Device!')
            setTimeout(() => window.location.href=('/admin/auth/login'), 500)
            return false
          }
          setNewPassword('')
          setTimeout(() => {
            setLoading(false)
            setOpenDialogDetail(true)
          }, 1500)            
        })
      }
    }
  }

  // console.log(Store.get('chipper'))
  // console.log(CryptoJS.AES.decrypt(`${Store.get('currency')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8))

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="span" className='pointer' component="div" onClick={()=>window.location.href=('/')} style={{fontSize: '28px'}}>
            <b>{Store.get('app')?.val_setting}</b>
          </Typography>
          &emsp;&emsp;
          <Typography variant="span" component="div" style={{fontSize: '28px'}}>
          <Stack direction="row" spacing={4} style={{fontSize: '12px'}}>
            <Grid container spacing={2}>
              <Grid item className="pointer menu-item" onClick={()=>window.location.href=('/')} style={{textDecoration: router.pathname === '/' ? 'underline' : 'normal'}}>
                {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '1'])[0]?.translated_text}
              </Grid>
              <Grid item className="pointer menu-item" onClick={()=>window.location.href=('/history')} style={{textDecoration: router.pathname === '/history' ? 'underline' : 'normal'}}>
              {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '2'])[0]?.translated_text}
              </Grid>
              <Grid item className="pointer menu-item" onClick={()=>window.location.href=('/user-deposit')} style={{textDecoration: router.pathname === '/user-deposit' ? 'underline' : 'normal'}}>
              {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '3'])[0]?.translated_text}
              </Grid>
              <Grid item className="pointer menu-item" onClick={()=>window.location.href=('/api')} style={{textDecoration: router.pathname === '/api' ? 'underline' : 'normal'}}>
                API
              </Grid>
            </Grid>
          </Stack>
          </Typography>
          
          <Box variant="span" component="div" style={{position: 'absolute',right: '20px', minWidth: '450px'}}>
            <Stack direction="row" spacing={4} style={{fontSize: '12px', minWidth: '350px'}}>
              <Grid container spacing={1} style={{minWidth: '300px'}}>
                <Grid item  style={{minWidth: '200px'}}>
                  <ReactFlagsSelect
                    countries={['US','GB','RU','CN','ID']}
                    customLabels={{ US: "EN-US", GB: "EN-UK", RU: "Russian", CN: "Chinese", ID: "Bahasa Indonesia" }}
                    placeholder="Select Language"
                    onSelect={(i)=>  {
                      if (i === 'US') {
                        Store.set('id_base_language', '3')
                        setCountrySelected(i)
                      } else if (i === 'GB') {
                        Store.set('id_base_language', '2')
                        setCountrySelected(i)
                      } else if (i === 'RU') {
                        Store.set('id_base_language', '5')
                        setCountrySelected(i)
                      } else if (i === 'CN') {
                        Store.set('id_base_language', '4')
                        setCountrySelected(i)
                      } else if (i === 'ID') {
                        Store.set('id_base_language', '1')
                        setCountrySelected(i)
                      }
                      window.location.reload()
                    }}
                    selected={countrySelected}
                  />
                </Grid>
                <Grid item>
                  <Nightlight color="action" style={{marginTop: '10px'}} />
                </Grid>
                <Grid item>
                  <Badge badgeContent={0} color="primary" style={{marginTop: '10px'}}>
                    <Notifications color="action" />
                  </Badge>
                </Grid>
              </Grid>
              <Box style={{backgroundColor: '#0EAC40', color: '#FFFFFF', borderRadius: '10px', padding: '5px', paddingTop: '9px', minWidth: '150px', width: 'auto', height: '50px'}}>
                <Grid container spacing={1}>
                  <Grid item>
                    <AccountBalanceWallet color="#FFFFFF" style={{marginTop: '4px'}} />
                  </Grid>
                  <Grid item>
                    <p style={{marginTop:'0px'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '11'])[0]?.translated_text}</p>
                    {
                      (Store.get('currency')) && 
                      <p style={{marginTop:'-5px'}}><b>{_currSymbol?.currency_symbol} {CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)}</b></p>
                    }
                  {/* <p style={{marginTop:'-5px'}}><b>{CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)}</b></p> */}
                  </Grid>
                </Grid>
              </Box>
              <Grid container spacing={1} 
                aria-controls={openMenu ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleClickMenu}
                className="pointer"
                style={{minWidth: '200px'}}
                >
                <Grid item><Avatar></Avatar></Grid>
                <Grid item style={{minWidth: '0px'}}>
                {
                  (Store.get('currency')) && 
                  <p style={{marginTop:'4px'}}>{JSON.parse(authUser)?.username}{Store.get('auth-user')?.username}</p>
                }
                <p style={{marginTop:'-5px'}}><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '36'])[0]?.translated_text}</b></p>
                </Grid>
              </Grid>
              <Menu
                  id="demo-positioned-menu"
                  aria-labelledby="demo-positioned-button"
                  anchorEl={anchorElMenu}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  {/* <MenuItem onClick={handleCloseMenu}>Profile</MenuItem> */}
                  <MenuItem onClick={() => {setOpenDialogDetail(true); handleCloseMenu()}}>My account</MenuItem>
                  <MenuItem onClick={() => {
                    Store.set('myInterval', 0);
                    Store.remove('auth-user');
                    Store.remove('token');
                    Store.remove('api_key');
                    localStorage.clear()
                    setTimeout(() => window.location.href=('/auth/login'), 500)}
                  }>Logout</MenuItem>
                </Menu>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

          
<Dialog
    aria-labelledby="customized-dialog-title"
    open={openDialogDetail}
    maxWidth="lg"
  >
    <DialogTitle sx={{ m: 0, p: 2 }}>
      My Account
      <IconButton
        aria-label="close"
        onClick={() => setOpenDialogDetail(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          Username
        </Grid>
        <Grid item xs={10}>
          : {_authUser?.username}
        </Grid>
        <hr />
        <Grid item xs={2}>
          Email
        </Grid>
        <Grid item xs={10}>
        : {_authUser?.email}
        </Grid>
        <hr />
        <Grid item xs={2}>
          API-Key <Refresh onClick={generateAPIKey} />
        </Grid>
        <Grid item xs={10}>
        : {_authUser?.token_api}
        </Grid>
        <hr />
        <Grid item xs={2}>
          Password
        </Grid>
        <Grid item xs={5}>
        <FormControl fullWidth size="small" sx={{ m: 1, mt: '-10px' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((show) => !show)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormControl>
        </Grid>
        <Grid item xs={5}>
          {((newPassword != '')) && <Button sx={{ m: 1, mt: '-10px' }} variant='contained' onClick={(e) => handleChangePassword(dataUser)}>
            Change Password
          </Button>}
        </Grid>
        <hr />
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialogDetail(false)}>Close</Button>
    </DialogActions>
  </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
      </Backdrop>
      
      <Notif type="error" title="Error" message="Token is not valid or User has been logged in other Device!" isOpen={isOpenMessage} />
    </Box>
  );
}