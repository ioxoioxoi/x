import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  IconButton, Stack, Grid, Avatar,
  Badge, Chip, Menu, MenuItem, Backdrop, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Nightlight,
  CurrencyExchange, AccountBalanceWallet
} from '@mui/icons-material';
import Store from 'store';
import axios from 'axios';
import {filter} from 'lodash';
import {number_format} from '@/functions/helpers/general'

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
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    backgroundColor: '#FFFFFF',
    color: '#0EAC40',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function PersistentDrawerLeft() {
  const controller = new AbortController();
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(true);
  const [anchorElMenu, setAnchorElMenu] = React.useState(null);
  const [openMenu, setOpenMenu] = React.useState(false);

  const [exchangeRate, setExchangeRate] = React.useState(Store.get('exchangeRate') || '0');
  const [mainBalance, setMainBalance] = React.useState(Store.get('mainBalance') || '0');
  const [cashbackBalance, setCashbackBalance] = React.useState(Store.get('cashbackBalance') || '0');

  const handleClickMenu = (event) => {
    setAnchorElMenu(event.currentTarget);
    setOpenMenu(true)
  };
  const handleCloseMenu = () => {
    setOpenMenu(false)
    setAnchorElMenu(undefined)
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const updateCountry = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}basedata/list_countries`, {
      token_login: Store.get('token')
    }, {
      signal: controller.signal,
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
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/admin/auth/login'), 500)
        return false
      }
      Store.set('list_countries', res?.data?.data)
    })  
  }

  const updateValue = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/get_exchange_rate`, {
      token_login: Store.get('token')
    }, {
      signal: controller.signal,
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
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/admin/auth/login'), 500)
        return false
      }
      const _dataCurrency = filter(res?.data?.data?.setting_app, ['key_setting', 'Currency'])[0]?.val_setting
      const dataCurrency = filter(res?.data?.data?.base_currencies, ['currency_code', _dataCurrency])[0]

      setExchangeRate(res?.data?.data?.exchange_rate)
      
      setMainBalance(res?.data?.data?.balance?.split(':')[1])
      setCashbackBalance(res?.data?.data?.balance_cashback?.split(':')[1])

      Store.set('dataCurrency', dataCurrency)
      Store.set('exchangeRate', res?.data?.data?.exchange_rate)
      Store.set('mainBalance', res?.data?.data?.balance?.split(':')[1])
      Store.set('cashbackBalance', res?.data?.data?.balance_cashback?.split(':')[1])
    
      // if (Store.get('myInterval') === 1) {
        // let timer = setTimeout(() => updateValue(), 10000)
        // return () => clearTimeout(timer)
      // }
      if (!Store.get('list_countries')) {
        updateCountry()
      }
      // Store.set('myInterval', 0)
      setTimeout(() => setLoading(false), 100)
    })
  }

  React.useEffect(() => {
    if (Store.get('myInterval') != 1) {
      setLoading(true)
      Store.set('myInterval', 1)
      // updateValue()
    }
    updateValue()
  }, [])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="span" component="div">
            Rate USD/RUB : <b>{number_format(exchangeRate)}</b>
          </Typography>
          <Typography variant="span" component="div" style={{position: 'absolute',right: '20px'}}>
            <Stack direction="row" spacing={2} style={{fontSize: '12px'}}>
              <Box style={{backgroundColor: '#0EAC40', color: '#FFFFFF', borderRadius: '10px', padding: '5px', paddingTop: '9px', height: '45px', minWidth: '125px'}}>
                <Grid container spacing={1} style={{minWidth: '100px'}}>
                  <Grid item>
                    <AccountBalanceWallet color="#FFFFFF" style={{marginTop: '4px'}} />
                  </Grid>
                  <Grid item>
                    <p style={{marginTop:'0px'}}>Main Balance</p>
                    <p style={{marginTop:'-5px'}}><b>{Store.get('dataCurrency')?.currency_symbol} {number_format(mainBalance)}</b></p>
                  </Grid>
                </Grid>
              </Box>
              <Box style={{backgroundColor: '#F3F3F9', borderRadius: '10px', padding: '5px', paddingTop: '9px', height: '45px', minWidth: '210px'}}>
                <Grid container spacing={1}>
                  <Grid item>
                    <CurrencyExchange color="action" style={{marginTop: '4px'}} />
                  </Grid>
                  <Grid item>
                    <p style={{marginTop:'0px'}}>Cashback Balance</p>
                    <p style={{marginTop:'-5px'}}><b>{Store.get('dataCurrency')?.currency_symbol} {number_format(cashbackBalance-mainBalance)}</b></p>
                  </Grid>
                  <Grid item>
                    <Chip label="Use" size="small" onClick={() => alert(123)} style={{marginTop: '2px', backgroundColor: '#0EAC40'}} />
                  </Grid>
                </Grid>
              </Box>
              <Grid container spacing={1} style={{width: '80px'}}>
                <Grid item>
                  <Nightlight color="action" style={{marginTop: '6px'}} />
                </Grid>
                <Grid item>
                  <Badge badgeContent={4} color="primary" style={{marginTop: '6px'}}>
                    <Notifications color="action" />
                  </Badge>
                </Grid>
              </Grid>
              <Grid container spacing={1} 
                aria-controls={openMenu ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleClickMenu}
                className="pointer"
                style={{width: '160px'}}
                >
                <Grid item><Avatar></Avatar></Grid>
                <Grid item>
                  <p style={{marginTop:'4px'}}>{Store.get('auth')?.username}</p>
                  <p style={{marginTop:'-5px'}}><b>Administrator</b></p>
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
                  {/* <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
                  <MenuItem onClick={handleCloseMenu}>My account</MenuItem> */}
                  <MenuItem onClick={() => {
                    Store.set('myInterval', 0);
                    Store.remove('auth');
                    Store.remove('token');
                    Store.remove('api_key');
                    setTimeout(() => router.push('/admin/auth/login'), 500)}
                  }>Logout</MenuItem>
                </Menu>
            </Stack>
          </Typography>
        </Toolbar>
      </AppBar>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </Box>
  );
}