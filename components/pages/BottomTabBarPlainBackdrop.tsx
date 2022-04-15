import React from 'react';
import { BaseContainerInjectedProps } from './BaseContainer';
import HeaderPlainBackdrop,{ HeaderPlainBackdropProps } from './HeaderPlainBackdrop';

export type BottomTabBarPlainBackdropProps = HeaderPlainBackdropProps;
type BottomTabBarPlainBackdropComposeProps = BaseContainerInjectedProps & BottomTabBarPlainBackdropProps;

const DEF_SHADOW = {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 }
}
const BottomTabBarPlainBackdrop = (props: BottomTabBarPlainBackdropComposeProps) => {
    const shadowOpts = props.shadow ?? DEF_SHADOW;
    return (
       <HeaderPlainBackdrop {...props} shadow={shadowOpts}/>
    )
}
export default BottomTabBarPlainBackdrop;