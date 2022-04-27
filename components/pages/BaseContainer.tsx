import React, { useMemo } from 'react';
import { ScaledSize, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export type BaseContainerInjectedProps = {
    size: { width: number; height: number };
    height: number;
    insets: EdgeInsets;
    dms: ScaledSize;
    abs: ViewStyle;
    zIndex: number;
}
const BaseContainer = (props: {
    position: 'top' | 'bottom';
    height?: number;
    zIndex?: number;
    renderContentComponent: (props: any) => any;
    renderBackdropComponent: (props: any) => any;
}) => {

    const {
        position,
        height = 50,
        zIndex = 99,
        renderContentComponent,
        renderBackdropComponent,
    } = props;
    const insets = useSafeAreaInsets();
    const dms = useWindowDimensions();
    const size = useMemo(() => ({
        height: (position == 'top' ? insets.top : insets.bottom) + height,
        width: dms.width
    }), [insets, dms]);
    const abs = useMemo(() => {
        let _abs = {
            position: 'absolute',
            left: 0,
            right: 0
        }
        return (position == 'top' ? Object.assign(_abs, { top: 0 }) : Object.assign(_abs, { bottom: 0 }))
    }, [])
    const injectedProps = useMemo(() => ({ size, insets, height, dms, abs, zIndex }), [size, insets, dms, zIndex,height])

    return (
        <>
            {renderContentComponent(injectedProps)}
            {renderBackdropComponent(injectedProps)}
        </>
    )
}
export default BaseContainer;