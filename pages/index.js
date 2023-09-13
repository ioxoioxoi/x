import React, {useLayoutEffect} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Topbar from '@/components/user/topbar'
import { useRouter } from 'next/router';
import Store from 'store';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import {
  IconButton, Stack, Grid, Avatar, Select, Autocomplete, Fab,
  Badge, Chip, Menu, MenuItem, Paper, Button, Switch, Tooltip,
  TextField, InputAdornment, Checkbox, FormGroup, FormControlLabel,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Accordion, AccordionSummary, Typography, AccordionDetails, Backdrop, CircularProgress
} from '@mui/material';
import {
  HelpOutline, Search, Star, AddShoppingCart, ExpandMore, HighlightOff, Refresh,
  DoneAll, Replay
} from '@mui/icons-material';
import ReactFlagsSelect from 'react-flags-select';
import axios from 'axios';
import {filter, keys, map, size, first, includes, pull, unescape} from 'lodash';
import {number_format} from '@/functions/helpers/general'
import moment from 'moment'
import CryptoJS from "crypto-js";
import Countdown from 'react-countdown'
import parsePhoneNumber from 'libphonenumber-js'
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

const spanStyle = {
  padding: '20px',
  background: '#efefef',
  color: '#000000'
}

const divStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  height: '500px'
}

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const router = useRouter();
  const [isOpenMessage, setIsOpenMessage] = React.useState(false)
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [countrySelected, setCountrySelected] = React.useState('US');
  const [countryDataSelected, setCountryDataSelected] = React.useState({"label":'USA', "code":'US'});
  const [operatorsData, setOperatorsData] = React.useState(Store.get('operators') ?? []);
  const [operatorsSelected, setOperatorsSelected] = React.useState([]);
  const [operatorSelected, setOperatorSelected] = React.useState('');
  const [filterService, setFilterService] = React.useState('');
  const [services, setServices] = React.useState([]);
  const [servicesAll, setServicesAll] = React.useState([]);
  const [serviceFav, setServiceFav] = React.useState(Store.get('service_favourites'));
  const [multiServices, setMultiServices] = React.useState([]);
  const [listActivation, setListActivation] = React.useState([]);
  const [listActivation5, setListActivation5] = React.useState([]);
  const [slideImages, setSlideImages] = React.useState([]);
  const [isMultiService, setIsMultiService] = React.useState(false);
  const [randomNumber, setRandomNumber] = React.useState(Math.floor(Math.random() * 100) + 1)
  
  let _dataCurrency = '{}'
  let dataCurrency = {}
  if (Store.get('currency')) {
    _dataCurrency = CryptoJS.AES.decrypt(`${Store.get('currency')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8) ?? {}
    dataCurrency = JSON.parse(_dataCurrency)
  }
  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function parseHtmlEntities(str) {
    if (size(str) > 3) {
      return str?.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
    }
  }

  const getDatas = () => {
    if (!Store.get('operators')) {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/get_operators`, {
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
        
            localStorage.clear()
            setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        // alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
        setOperatorsData(res?.data?.data)
        Store.set('operators', res.data?.data)
      })
    } else {
      setOperatorsData(Store.get('operators'))
      setLoading(false)
    }
        
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/List_setting_banner`, {
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
        
            localStorage.clear()
            setIsOpenMessage(true)
        setTimeout(() => setIsOpenMessage(false), 1000)
        // alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      setSlideImages(res?.data?.data)
      setLoading(false)
    })
  }

  const getNumberStatus = () => {
    if (operatorSelected) {
      const countries = Store.get('list_countries')
      const _countryDataSelected = filter(countries, ['country_code', countrySelected])[0]
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/get_number_status`, {
        token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
        country: _countryDataSelected?.id ?? 187,
        operator: operatorSelected
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
          setTimeout(() => router.push('/auth/login'), 500)
          return false
        }
        const _data = (res?.data?.data)
        const dataX = []
        let itemX = ""
        let _loop = 0
        const resource = keys(res?.data?.data) || []
        map(resource, item => {
          const _item = {service_code: item.substr(0,2), avail: number_format(_data[item])}
          dataX.push(_item)
          if (_loop > 0) {itemX += ","}
          itemX += "'" + [item.substr(0,2)] + "'"
          _loop++
        })
        getListServices(itemX, dataX)
      }).catch(() => setLoading(false))
    }
  }

  const reSendSMS = (orderID, newTime=0) => {
    const x = confirm('Are you sure you want to Re-Send SMS to This Number?')
    if (x) {
      axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/re_order`, {
        token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
        order_id: orderID,
        new_time: newTime
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then((res) => {
        if (res?.data?.code === 1) {
          alert(res.data?.error)
          setLoading(false)
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
          setTimeout(() => router.push('/auth/login'), 500)
          return false
        }
        } else {
          checkStatusActivation()
        }
      }).catch(() => setLoading(false))
    }
  }
  
  const orderNumbers = () => {
    let _loop = 1
    // console.log('multiServices: ',multiServices)
    multiServices?.map(serviceCode => {
      const _service = filter(services, ['service_code', serviceCode])[0]
      const _avail = _service?.avail
      orderNumber(_service, _avail, size(multiServices), _loop)
      _loop++
    })
    setMultiServices([])
    setTimeout(() => {
      setServices([...servicesAll])
    }, 1000)
  }

  const orderNumber = (dataX, avail, isMulti=false, _loop) => {
    setLoading(true)
    if (avail === 0 || avail === '0') {
      alert("Service " + dataX['service_name'] + " is not available!")
      setLoading(false)
      return false 
    }
    if (eval(CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8).replace(',', '')) < eval(dataX?.selling_price)) {
      alert("Your Balance is not enough to Order Service: " + dataX['service_name'])
      setLoading(false)
      return false 
    }
    // const x = confirm("Are you sure you want to order " + dataX['service_name'] + " activation?")
    // if (!x) {
    //   setLoading(false)
    //   return false
    // }
    const countries = Store.get('list_countries')
    const _countryDataSelected = filter(countries, ['country_code', countrySelected])[0]
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/Order_number`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      country: _countryDataSelected?.id,
      operator: operatorSelected,
      service: dataX?.service_code,
      service_id: dataX?.id
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
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      Store.set('last_order_date', moment(Date()).format('YYYY-MM-DD'));
      if (isMulti && isMulti === _loop) {
        checkStatusActivation()
      } else if (!isMulti) {
        checkStatusActivation()
      }
    }).catch(() => setLoading(false))
  }

  const reOrderNumber = (dataX) => {
    setLoading(true)
    if (eval(CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8).replace(',', '')) < eval(dataX?.selling_price)) {
      alert("Service " + dataX['service_name'] + " is not available!")
      setLoading(false)
      return false 
    }
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/Order_number`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      country: dataX?.id_country,
      operator: dataX?.operator,
      service: dataX?.service_code,
      service_id: dataX?.id_app_service
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
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      Store.set('last_order_date', moment(Date()).format('YYYY-MM-DD'));
      checkStatusActivation()
    }).catch(() => setLoading(false))
  }

  const handleCancelOrder = (orderID, serviceName) => {
    setLoading(true)
    const x = confirm("Are you sure you want to CANCEL order " + serviceName + " activation?")
    if (!x) {
      setLoading(false)
      return false
    }
    axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/cancel_order`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      order_id: orderID,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      if (res?.data?.code === 1) {
        alert(res.data?.error)
        setLoading(false)
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
        setTimeout(() => router.push('/auth/login'), 500)
        return false
      }
      } else {
        checkStatusActivation()
      }
    }).catch(() => setLoading(false))
  }

  const handleCancelOrder2 = (orderID, serviceName) => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/cancel_order`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      order_id: orderID,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      checkStatusActivation()
    }).catch(() => setLoading(false))
  }

  const checkStatusActivationSilent = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/Update_status_activation?timestamp=${new Date().getTime()}`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      setListActivation([...res?.data?.data])
      setListActivation5([...res?.data?.data5])
      Store.set('last_refresh', moment(Date()).format('YYYY-MM-DD HH:mm:ss'))
      
      if (Store.get(randomNumber)) {
        const timer = setTimeout(() => {
          checkStatusActivationSilent()
        }, 5000);
        return () => clearTimeout(timer);
      } 
      // clearTimeout(myTimeout)
    }).catch(() => {
      setLoading(false)
      if (Store.get(randomNumber)) {
        const timer = setTimeout(() => {
          checkStatusActivationSilent()
        }, 5000);
        return () => clearTimeout(timer);
      } 
      // clearTimeout(myTimeout)
    })
  }

  const checkStatusActivation = () => {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}orders/Update_status_activation?timestamp=${new Date().getTime()}`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      setListActivation([...res?.data?.data])
      setListActivation5([...res?.data?.data5])
      Store.set('last_refresh', moment(Date()).format('YYYY-MM-DD HH:mm:ss'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const getListServices = (itemX, dataX) => {
    axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/List_services`, {
      token_login: CryptoJS.AES.decrypt(`${Store.get('token-user')}`, `${process.env.SECRET_KEY}`).toString(CryptoJS.enc.Utf8),
      service_codes: itemX
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then((res) => {
      // console.log(dataX)
      const _dataX = []
      const _data = res?.data?.data
      _data?.map(item => {
        item.avail = filter(dataX, ['service_code', item?.service_code])[0]?.avail
        _dataX.push(item)
      })
      setServices(_dataX)
      setServicesAll(_dataX)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleShowFav = (e) => {
    if (e?.target?.checked) {
      const _services = []
      serviceFav?.map(item => {
        _services.push(filter(servicesAll, ['service_code', item])[0])
      })
      setServices(_services)
    } else {
      setServices(servicesAll)
    }
  }

  const handleFav = (itemCode) => {
    const _dataCodes = Store.get('service_favourites') ?? []
    const _services = services
    if (includes(_dataCodes, itemCode)) {
      setServices([])
      pull(_dataCodes, itemCode)
      Store.set('service_favourites', _dataCodes)
      setServiceFav(_dataCodes)
      setServices(_services)
    } else {
      setServices([])
      _dataCodes.push(itemCode)
      Store.set('service_favourites', _dataCodes)
      setServiceFav(_dataCodes)
      setServices(_services)
    }
  }

  const handleMultiService = (itemCode) => {
    const _multiServices = multiServices ?? []
    if (includes(_multiServices, itemCode)) {
      pull(_multiServices, itemCode)
    } else {
      _multiServices.push(itemCode)
    }
    setMultiServices([..._multiServices])
  }

  React.useEffect(() => {
    if (!Store.get('auth-user')) {
      localStorage.clear()
      router.push('/auth/login')
      window.location.href='/auth/login'
      return false
    } else {
      checkStatusActivation()
      setOperatorsData(Store.get('operators'))
      setSlideImages(Store.get('banner_list'))
      // getDatas()
      
      Store.set(randomNumber, true);
      const timer = setTimeout(() => {
        checkStatusActivationSilent()
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [])

  useLayoutEffect(() => {
      return () => {
        Store.remove(randomNumber)
      }
  }, [])

  React.useEffect(() => {
    setFilterService('')
    const countries = Store.get('list_countries')
    const _countryDataSelected = filter(countries, ['country_code', countrySelected])[0]
    // console.log(operatorsData[_countryDataSelected?.id])
    setOperatorsSelected(filter(operatorsData, ['id_country', _countryDataSelected?.id]))
    setOperatorSelected(first(filter(operatorsData, ['id_country', _countryDataSelected?.id]))?.operator_code)
  }, [countrySelected])

  React.useEffect(() => {
    if (operatorSelected) {
      setLoading(true)
      getNumberStatus()
      setFilterService('')
    }
  }, [operatorSelected])

  React.useEffect(() => {
    // if(!open) {
      // console.log('operatorsData', operatorsData)
      const countries = Store.get('list_countries')
      const _countryDataSelected = filter(countries, ['country_code', countrySelected])[0]
      setOperatorsSelected(filter(operatorsData, ['id_country', _countryDataSelected?.id]))
      setTimeout(() => {
        setOperatorSelected(first(filter(operatorsData, ['id_country', _countryDataSelected?.id]))?.operator_code)
      }, 500)
    //   setOpen(true)
    // }
  }, [operatorsSelected])

  React.useEffect(() => {
    const results = filter(servicesAll, (obj) => {
        if (obj['service_name']?.toLowerCase()?.indexOf(filterService?.toLowerCase()) > -1) {
          return obj
        }
    })
    setServices([...results])
  }, [filterService])
  

  return (<>
    {Store.get('auth-user') && <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Main className='main2'>
        <Box
          style={{
            position: 'absolute',
            left: '-10px',
            top: '0px',
            width: '300px', 
            height: '100%',
            fontSize: '14px',
            }}>
          <Paper style={{padding: '15px', paddingTop: '30px', minHeight: '1000px',}}>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" style={{width: '125px', color: '#FFFFFF', backgroundColor: '#0EAC40'}}>
            {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '4'])[0]?.translated_text}
            </Button>
            <Button variant="contained" style={{width: '125px', color: '#000000', backgroundColor: '#F3F3F9', fontSize: '10.5px'}}>
            {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '5'])[0]?.translated_text}
            </Button>
          </Stack>

          <br/>

          <div> 
          <div style={{paddingTop: '20px'}}>
            <b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '6'])[0]?.translated_text}</b> <Tooltip title="To buy several services for one number"><HelpOutline style={{fontSize: '16px'}}/></Tooltip>
            <div style={{float: 'right', marginTop: '-10px'}}>
              <Switch checked={isMultiService} onChange={(e) => {setIsMultiService(e?.target?.checked); setMultiServices([])}}/>
            </div>
          </div>
          </div>

          <br/>

          {(Store.get('list_countries')) && <p> 
            {/* <b>Select a Country</b> */}
            <p>{Store.get('list_countries')?.length} {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '7'])[0]?.translated_text}</p>         
              <br/>
              <Autocomplete
                disableClearable
                id="country-select-demo"
                // sx={{ width: 300 }}
                size="small"
                onAbort={() => {setCountrySelected('US'); setCountryDataSelected({"label":"USA", "code": "US"});}}
                value={countryDataSelected || []}
                onChange={(i, val) => {setOperatorSelected(''); setCountrySelected(val?.code); setCountryDataSelected(val);}}
                options={Store.get('list_countries')?.map(item => ({"label":item?.country, "code":item?.country_code}))}
                autoHighlight
                getOptionLabel={(option) => option?.label}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${option?.code?.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${option?.code?.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    {option.label} ({option.code})
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '37'])[0]?.translated_text}
                    inputProps={{
                      ...params.inputProps,
                      // autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                  />
                )}
              />

            {/* <ReactFlagsSelect
              countries={Store.get('list_countries')?.map(item => item.country_code)}
              placeholder="Select Country"
              // onSelect={(i)=>  console.log(i)}
              onSelect={(i) => {setOperatorSelected(''); setCountrySelected(i);}}
              selected={countrySelected}
            /> */}
          </p>}

          <br/>

          <p> 
            <b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '8'])[0]?.translated_text}</b> 
            <Select
              size='small'
              onChange={(item) => setOperatorSelected(item?.target?.value)}
              value={operatorSelected}
              fullWidth
            >
              {
                operatorsSelected?.map((item) => (<MenuItem key={item?.operator_code} value={item?.operator_code}>{item?.operator_name}</MenuItem>))
              }
            </Select>
            
            <TextField
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
              placeholder={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '38'])[0]?.translated_text}
              variant="outlined"
              size="small"
              style={{marginTop: '10px'}}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={()=>true}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </p>

          <br/>

          {operatorSelected && (<p> 
          <FormGroup>
            <FormControlLabel control={<Checkbox onChange={(e) => handleShowFav(e)} />} label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '9'])[0]?.translated_text} />
          </FormGroup>
          
          <List
            sx={{ width: '100%', bgcolor: 'background.paper', border: '1px solid black', borderRadius: '10px',
            overflow: 'auto', maxHeight: 500, }}
            aria-label="contacts"
          >
            {
              size(services) > 0 && services?.map((item, index) => (<>
                <ListItem key={item?.service_code} disablePadding 
                  sx={{bgcolor: (index%2==0) && '#F6F6FF'}}
                  secondaryAction={<>
                  {(!isMultiService) && <IconButton aria-label="comment" 
                    onClick={() => orderNumber(item, item?.avail)}
                  >
                    <AddShoppingCart style={{color: '#0EAC40'}} />
                  </IconButton>}
                  </>
                  }>
                  <ListItemButton>
                    
                      {(isMultiService) && <ListItemIcon style={{minWidth: '30px !important'}}><Checkbox
                        edge="start"
                        checked={multiServices.indexOf(item?.service_code) !== -1}
                        tabIndex={-1}
                        disableRipple
                        onChange={() => handleMultiService(item?.service_code)}
                        disabled={eval(item?.avail.replace(',', '')) < 1}
                        // inputProps={{ 'aria-labelledby': labelId }}
                      /></ListItemIcon>}
                    
                    <ListItemIcon style={{minWidth: '30px !important'}}>
                      {
                        (includes(serviceFav, item?.service_code)) ?
                        <Star style={{color: '#0EAC40'}} onClick={() => handleFav(item?.service_code)} /> :
                        <Star style={{color: '#999999'}} onClick={() => handleFav(item?.service_code)} />
                      }
                      {/* <Star style={{color: (includes(serviceFav ?? [], item?.service_code)) ? '#0EAC40' : '#999999'}} onClick={() => handleFav(item?.service_code)} /> */}
                    </ListItemIcon>
                    {
                      (Store.get('currency')) && (
                        <ListItemText primary={item?.service_name} secondary={item?.avail + ' pcs / ' + dataCurrency?.currency_symbol + ' ' + item?.selling_price} />
                      )
                    }
                  </ListItemButton>
                </ListItem>
                <Divider />
                </>))
            }
          </List>
          </p>)}
          </Paper>
        </Box>

          {(size(multiServices) > 0 && isMultiService) && <Fab color="primary" aria-label="add"
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '200px',
          }}>
          <AddShoppingCart onClick={orderNumbers} />
        </Fab>}

        <Box style={{marginLeft: '300px'}}>
          {(Store.get('last_order_date') != moment(Date()).format('YYYY-MM-DD')) && <>
            <h1 style={{fontSize: '28px'}}><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '29'])[0]?.translated_text}</b></h1>
            <br/>
            {/* <img src="images/user/dashboard/dashboard-banner.png" /> */}
            
            {size(slideImages) > 0 && <Slide>
            {slideImages.map((slideImage, index)=> (
                <div key={index}>
                  <div style={{ ...divStyle, 'backgroundImage': `url(${process.env.NEXT_PUBLIC_API_APP}..${slideImage?.url_image})` }}>
                    {/* <span style={spanStyle}>{slideImage.alt_text}</span> */}
                  </div>
                </div>
              ))} 
            </Slide>}
            <br/>
            <hr/>
            <br/>
            <p><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '10'])[0]?.translated_text}</b> &emsp; <Refresh onClick={checkStatusActivation} /></p>
            
          </>}
          <br/>
          <div>
            {/* <p  onClick={checkStatusActivation} className='pointer'><Refresh /> Refresh List</p>
            <br/><br/> */}
            {(size(listActivation) > 0) && <><b>Active Orders</b><br/><br/></>}
            {
              listActivation?.map(item => (<>
                <Accordion expanded={expanded === item?.order_id} onChange={handleChangeAccordion(item?.order_id)}>
                  <AccordionSummary
                    expandIcon={
                      item?.status === 'Waiting for SMS' ? 
                      <HighlightOff onClick={() => handleCancelOrder(item?.order_id, item?.service_name)} sx={{color: '#DC362E'}}/> :
                      <DoneAll onClick={() => handleCancelOrder(item?.order_id, item?.service_name)} sx={{color: '#0EAC40'}}/>
                    }
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    <Typography sx={{ width: '400px', flexShrink: 0 }}>
                      <u>{item?.country_code}</u> &emsp;
                      <b>{parsePhoneNumber(`+${item?.number}`).formatInternational()}</b>&nbsp;-&nbsp;
                      <i>{item?.service_name}</i>
                      {(item?.status != 'Waiting for SMS' && item?.status != 'Waiting for Retry SMS') && <> &emsp; <Replay onClick={() => reSendSMS(item?.order_id)} sx={{ color: '#0EAC40' }} /></>}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }} style={{width: '150px'}}>
                      <div style={{display: 'inline-block', width: '40px'}}>
                        <Countdown date={moment(item?.created_date).valueOf() + 1200000}
                          renderer={({ hours, minutes, seconds, completed }) => {
                            if (completed){
                              handleCancelOrder2(item?.order_id, item?.service_name)
                            } else {
                              return <span>{minutes}:{seconds}</span>
                            }
                          }}
                        />
                      </div>
                       &emsp;&emsp; {dataCurrency?.currency_symbol} {item?.price_user}</Typography>
                    <Typography sx={{ color: '#0EAC40', marginLeft: '150px' }}>{item?.status === 'Waiting for SMS' ? filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '32'])[0]?.translated_text : item?.status} <ExpandMore sx={{ color: '#0EAC40' }} /></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <i>{parseHtmlEntities(item?.sms_text) ?? filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '33'])[0]?.translated_text}</i>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              
              </>))
            }
            {(size(listActivation) < 1) && <><b>Last 5 Orders</b><br/><br/></>}
            {
              (size(listActivation) < 1) &&
                listActivation5?.map(item => (<>
                  <Accordion expanded={expanded === item?.order_id} onChange={handleChangeAccordion(item?.order_id)}>
                    <AccordionSummary
                      expandIcon={<AddShoppingCart onClick={() => reOrderNumber(item)} sx={{ color: '#0EAC40' }} />}
                      aria-controls="panel1bh-content"
                      id="panel1bh-header"
                    >
                      <Typography sx={{ width: '400px', flexShrink: 0 }}>
                        <u>{item?.country_code}</u> &emsp;
                        <b>{parsePhoneNumber(`+${item?.number}`).formatInternational()}</b>&nbsp;-&nbsp;
                        <i>{item?.service_name}</i>
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }} style={{width: '150px'}}>
                        {dataCurrency?.currency_symbol} {item?.price_user}</Typography>
                      <Typography sx={{ color: '#0EAC40', marginLeft: '150px' }}>{item?.status === 'Waiting for SMS' ? filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '32'])[0]?.translated_text : item?.status} <ExpandMore sx={{ color: '#0EAC40' }} /></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <i>{parseHtmlEntities(item?.sms_text) ?? filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '33'])[0]?.translated_text}</i>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>                
                </>))
            }
            <i>{
              // size(listActivation) < 1 && filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '31'])[0]?.translated_text
            }</i>
          </div>
        </Box>
      </Main>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
      </Backdrop>
    </Box>}
      <Notif type="error" title="Error" message="Token is not valid or User has been logged in other Device!" isOpen={isOpenMessage} />
  </>);
}