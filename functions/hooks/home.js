import { useEffect, useState } from "react"

const Hooks = (props) => {
    const [lang, setLang] = useState(props)
    const [stepTestimoni, setStepTestimoni] = useState(1)
    
    const handleStepTestimoni = (_type, maxVal) => {
        if (_type === '+') {
            if (stepTestimoni >= maxVal) {
                setStepTestimoni(1)
            } else {
                setStepTestimoni(stepTestimoni + 1)
            }
        } else {
            if (stepTestimoni <= 1) {
                setStepTestimoni(maxVal)
            } else {
                setStepTestimoni(stepTestimoni - 1)
            }
        }
    }

    useEffect(() => {
        setLang(props?.lang)
    }, [props?.lang])

    return {
        state: {
            lang: lang,
            stepTestimoni: stepTestimoni,
        }, 
        handler: {
            setLang: setLang,
            handleStepTestimoni: handleStepTestimoni
        }
    }
}

export default Hooks