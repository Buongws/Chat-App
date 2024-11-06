import {useState} from 'react';

export const useToggle = (initialValue = false) => {
    const [on, setOn] = useState(initialValue);
    const toggle = () => setOn(!on);
    return [on, {toggle}];
}