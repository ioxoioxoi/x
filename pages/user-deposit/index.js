import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Topbar from '@/components/user/topbar'
import { useRouter } from 'next/router';
import Store from 'store';
import {
  IconButton, StackGrid, Avatar, Select, Autocomplete,
  Badge, Chip, Menu, MenuItem, Paper, Button, Switch, Tooltip,
  TextField, InputAdornment, Checkbox, FormGroup, FormControlLabel,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Accordion, AccordionSummary, Typography, AccordionDetails, Backdrop, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  HelpOutline, Search, Star, AddShoppingCart, ExpandMore, HighlightOff, Refresh
} from '@mui/icons-material';
import ReactFlagsSelect from 'react-flags-select';
import axios from 'axios';
import moment from 'moment';
import {filter, keys, map, size} from 'lodash';
import {number_format} from '@/functions/helpers/general'
import CryptoJS from "crypto-js";

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const countryOptions = [
  { value: 'ID', label: 'Indonesia' },
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  // Add more country options as needed
];

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [amountTopup, setAmountTopup] = React.useState('');
  const [datas, setDatas] = React.useState([]);
  const [datasAll, setDatasAll] = React.useState([]);
  const [statusSelected, setStatusSelected] = React.useState(undefined);
  const [pgSelected, setPgSelected] = React.useState(undefined);
  const currSymbol = CryptoJS.AES.decrypt(`${Store.get('currency')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8) ?? {}

  const columns2 = [
    { field: 'no', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '14'])[0]?.translated_text, width: 70 },
    { field: 'date', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '19'])[0]?.translated_text, width: 250 },
    { field: 'name', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '21'])[0]?.translated_text, width: 250 },
    { field: 'amount', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '23'])[0]?.translated_text, width: 100 },
    { field: 'status', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '18'])[0]?.translated_text, width: 200 },
    { field: 'expired_date', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '30'])[0]?.translated_text, width: 250 },
    { field: 'invoice_number', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '24'])[0]?.translated_text, width: 250 },
    // { field: 'action', headerName: 'Action', width: 100 },
  ];
  
  const getDatas = () => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_FINANCE}topup/List`, {
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
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      const _data = res?.data?.data
      const __data = []
      let _loop = 1
      _data?.map(item => {
        item.no = _loop
        item.date = moment(item?.created_datetime).format('ddd, DD MMMM YYYY - HH:mm:ss')
        item.expired_date = moment(item?.expired_date).format('ddd, DD MMMM YYYY - HH:mm:ss')
        item.amount = JSON.parse(currSymbol)?.currency_symbol + ' ' + number_format(item?.amount)
        __data.push(item)
        _loop++
      })
      setDatas(__data)
      setDatasAll(__data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  
  const refreshDatas = () => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_FINANCE}topup/check_binance_order`, {
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
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      getDatas()
    }).catch(() => setLoading(false))
  }
  
  const createOrderBinanceTopUp = () => {
    console.log('amountTopup: ', amountTopup)
    if (eval(amountTopup) < 10 || !amountTopup || amountTopup === '') {
      alert('Minimum topup USD 10')
      return false
    }
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_FINANCE}topup/Create_binance_order`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      amount: amountTopup
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
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      setAmountTopup('')
      const _data = res?.data?.data
      const __data = []
      let _loop = 1
      _data?.map(item => {
        item.no = _loop
        item.date = moment(item?.created_datetime).format('ddd, DD MMMM YYYY - HH:mm:ss')
        item.amount = JSON.parse(currSymbol)?.currency_symbol + ' ' + number_format(item?.amount)
        __data.push(item)
        _loop++
      })
      setDatas(__data)
      setDatasAll(__data)

      window.open(res?.data?.url, '_blank');
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  React.useEffect(() => {
    if (!Store.get('auth-user')) {
      window.location.href='/auth/login'
    }
    refreshDatas()
  }, [])

  React.useEffect(() => {
    if (statusSelected) {
      let _loop = 1
      const results = filter(datasAll, (obj) => {
          if (obj['status']?.toLowerCase()?.indexOf(statusSelected?.toLowerCase()) > -1) {
            obj['no'] = _loop++
            return obj
          }
      })
      setDatas([...results])
    } else {
      setDatas([...datasAll])
    }
  }, [statusSelected])

  React.useEffect(() => {
    if (pgSelected) {
      let _loop = 1
      const results = filter(datasAll, (obj) => {
          if (obj['name']?.toLowerCase()?.indexOf(pgSelected?.toLowerCase()) > -1) {
            obj['no'] = _loop++
            return obj
          }
      })
      setDatas([...results])
    } else {
      setDatas([...datasAll])
    }
  }, [pgSelected])

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Main className='main2'>
        <Box style={{textAlign: 'center'}}>
            <br/><br/>
            <div style={{width: '700px', display: 'inline-block'}}>
                <p style={{textAlign: 'left'}}>
                    <h1 style={{fontSize: '28px'}}><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '34'])[0]?.translated_text}</b></h1>
                </p>
                <br/>
                <div>
                    <Paper sx={{padding: '20px'}}>
                        <p>
                            <h1 style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</h1>
                        </p>
                        <br/>
                        <Paper sx={{padding: '20px', bgcolor: '#F3F3F9'}}>
                            <p style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '27'])[0]?.translated_text}</p>
                            <br />
                            {
                              (Store.get('currency')) &&
                              <p style={{fontSize: '28px', textAlign: 'left'}}><b>{JSON.parse(currSymbol)?.currency_symbol} {CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)}</b></p>
                            }
                            
                        </Paper>

                        <br/>

                        <TextField
                            label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '28'])[0]?.translated_text}
                            placeholder="Min. USD 10"
                            variant="outlined"
                            size="small"
                            fullWidth
                            style={{marginTop: '10px'}}
                            onChange={(e) => setAmountTopup(e?.target?.value)}
                            value={amountTopup}
                            InputProps={{
                                endAdornment: (
                                <>USD</>
                                ),
                            }}
                        />
                        <br/><br/><br/>
                        <Button onClick={createOrderBinanceTopUp} style={{background: '#0EAC40', color: '#FFFFFF', float: 'right', marginTop: '-30px'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</Button>
                    </Paper>
                </div>
            </div>
            <br/><br/><br/>
                <p style={{textAlign: 'left'}}>
                    <h1><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '35'])[0]?.translated_text}</b> &emsp; <Refresh onClick={refreshDatas} /></h1>
                    <br/>
                           
                    <Button size="small" style={{background: '#0EAC40', color: '#FFFFFF', float: 'right', marginTop: '10px'}} disabled>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '25'])[0]?.translated_text}</Button> &nbsp;
                    
                    <Autocomplete
                      sx={{ width: 250 }}
                      style={{'display': 'inline-block'}}
                      disablePortal
                      size="small"
                      fullWidth={false}
                      id="combo-box-demo"
                      options={[{'label': 'success'},{'label': 'Waiting for Payment'},{'label': 'cancel'}]}
                      onChange={(i, val) => setStatusSelected(val?.label)}
                      renderInput={(params) => <TextField {...params} label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '18'])[0]?.translated_text} />}
                    />
                    
                    &nbsp;
                    
                    <Autocomplete
                      sx={{ width: 250 }}
                      style={{'display': 'inline-block'}}
                      disablePortal
                      size="small"
                      fullWidth={false}
                      id="combo-box-demo"
                      options={[{'label': 'Binance Pay'},{'label': 'Perfect Money'},{'label': 'DUITKU Pay'},{'label': 'QRIS'},{'label': 'Refund'}]}
                      onChange={(i, val) => setPgSelected(val?.label)}
                      renderInput={(params) => <TextField {...params} label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '21'])[0]?.translated_text} />}
                    />
              
               &nbsp;
               <br/><br/>
                </p>
                <div>
                    <Paper sx={{padding: '20px'}}>
                        <DataGrid
                            rows={datas}
                            columns={columns2}
                            initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                            }}
                            pageSizeOptions={[10, 20]}
                            // checkboxSelection
                        />
                    </Paper>
                </div>
          
        </Box>
      </Main>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
      </Backdrop>
    </Box>
  );
}