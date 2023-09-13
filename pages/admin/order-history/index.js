import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
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
  HelpOutline, Search, Star, AddShoppingCart, ExpandMore, HighlightOff
} from '@mui/icons-material';
import ReactFlagsSelect from 'react-flags-select';
import axios from 'axios';
import moment from 'moment';
import {filter, keys, map, size} from 'lodash';
import {number_format} from '@/functions/helpers/general'
import CryptoJS from "crypto-js";
import parsePhoneNumber from 'libphonenumber-js'

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
  

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [datas, setDatas] = React.useState([]);
  const [datasAll, setDatasAll] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [countrySelected, setCountrySelected] = React.useState(undefined);
  const [statusSelected, setStatusSelected] = React.useState(undefined);
  const [serviceSelected, setServiceSelected] = React.useState(undefined);

  const columns = [
    { field: 'no', headerName: 'No', width: 70 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'service_name', headerName: 'Service Name', width: 200 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'phone', headerName: 'Phone Number', width: 250 },
    { field: 'sms_text', headerName: 'SMS Text', width: 550 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'date', headerName: 'Order Date', width: 250 },
    // { field: 'action', headerName: filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '20'])[0]?.translated_text, width: 100 },
  ];

  const getDatas = () => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/List_orders_all`, {
      token_login: Store.get('token'),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        alert('Token is not valid or User has been logged in other Device!')
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth');
        Store.remove('token');
        Store.remove('api_key');
        setTimeout(() => {
          window.location.href = '/admin/auth/login'
        }, 500)
        return false
      }
      const _data = res?.data?.data
      const __data = []
      let _loop = 1
      _data?.map(item => {
        item.no = _loop
        item.phone = parsePhoneNumber(`+${item?.number}`).formatInternational()
        item.date = moment(item?.created_date).format('ddd, DD MMMM YYYY - HH:mm:ss')
        __data.push(item)
        _loop++
      })
      setDatas(__data)
      setDatasAll(__data)
      getListServices()
    }).catch(() => setLoading(false))
  }
  
  const getListServices = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/List_services`, {
      token_login: Store.get('token'),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.error === 'Token is not valid!') {
        alert('Token is not valid or User has been logged in other Device!')
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth');
        Store.remove('token');
        Store.remove('api_key');
        setTimeout(() => {
          window.location.href = '/admin/auth/login'
        }, 500)
        return false
      }
      // console.log(dataX)
      const _dataX = []
      const _data = res?.data?.data
      _data?.map(item => {
        item.label = item?.service_name
        _dataX.push(item)
      })
      setServices(_dataX)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  React.useEffect(() => {
    if (!Store.get('auth')) {
      window.location.href='/admin/auth/login'
    }
    getDatas()
  }, [])

  React.useEffect(() => {
    if (countrySelected) {
      let _loop = 1
      const results = filter(datasAll, (obj) => {
          if (obj['country']?.toLowerCase()?.indexOf(countrySelected?.toLowerCase()) > -1) {
            obj['no'] = _loop++
            return obj
          }
      })
      setDatas([...results])
    } else {
      setDatas([...datasAll])
    }
  }, [countrySelected])

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
    if (serviceSelected) {
      let _loop = 1
      const results = filter(datasAll, (obj) => {
          if (obj['service_name']?.toLowerCase()?.indexOf(serviceSelected?.toLowerCase()) > -1) {
            obj['no'] = _loop++
            return obj
          }
      })
      setDatas([...results])
    } else {
      setDatas([...datasAll])
    }
  }, [serviceSelected])
  

  return (
    <Box sx={{ display: 'flex' }}>
    <Topbar />
    <Sidebar />
      <Main className='main'>
        <Box>
            <div>
                <p style={{textAlign: 'left'}}>
                    <h1 style={{fontSize: '28px'}}><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '12'])[0]?.translated_text}</b></h1>
                </p>
                <br/>
                <p>
                    {/* <h1><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '13'])[0]?.translated_text}</b></h1> */}
                    <br/>
                           
                    <Button size="small" style={{background: '#0EAC40', color: '#FFFFFF', float: 'right', marginTop: '10px'}} disabled>Download CSV</Button> &nbsp;
                    
                    <Autocomplete
                      id="country-select-demo"
                      sx={{ width: 230 }}
                      style={{'display': 'inline-block'}}
                      size="small"
                      onChange={(i, val) => setCountrySelected(val?.label)}
                      options={Store.get('list_countries')?.map(item => ({"label":item.country, "code":item.country_code}))}
                      autoHighlight
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          <img
                            loading="lazy"
                            width="20"
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            alt=""
                          />
                          {option.label} ({option.code})
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Filter Country"
                          inputProps={{
                            ...params.inputProps,
                            // autoComplete: 'new-password', // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
              
               &nbsp;
                    <Autocomplete
                      sx={{ width: 150 }}
                      style={{'display': 'inline-block'}}
                      disablePortal
                      size="small"
                      fullWidth={false}
                      id="combo-box-demo"
                      options={[{'label': 'Complete'},{'label': 'Waiting for SMS'},{'label': 'Cancel'}]}
                      onChange={(i, val) => setStatusSelected(val?.label)}
                      renderInput={(params) => <TextField {...params} label="Filter Status" />}
                    />
                    
                    &nbsp;
                    
                    <Autocomplete
                      sx={{ width: 250 }}
                      style={{'display': 'inline-block'}}
                      disablePortal
                      size="small"
                      fullWidth={false}
                      id="combo-box-demo"
                      options={services}
                      onChange={(i, val) => setServiceSelected(val?.label)}
                      renderInput={(params) => <TextField {...params} label="Filter Service" />}
                    />
              
               &nbsp;
               <br/><br/>
                </p>
                <div>
                    <Paper sx={{padding: '20px'}}>
                        <DataGrid
                            rows={datas}
                            columns={columns}
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