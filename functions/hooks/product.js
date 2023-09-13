import { useEffect, useState } from "react"

const Hooks = (props) => {
    const [stepTabs, setStepTabs] = useState(1)

    return {
        state: {
            stepTabs: stepTabs,
        }, 
        handler: {
            setStepTabs: setStepTabs,
        }
    }
}

export default Hooks