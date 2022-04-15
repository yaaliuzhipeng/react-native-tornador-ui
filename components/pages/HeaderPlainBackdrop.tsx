import React, { useMemo } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { BaseContainerInjectedProps } from './BaseContainer';

export type HeaderPlainBackdropProps = {
    backgroundColor?: string;
    shadow?: Tornador.ShadowOpts;
    enableShadow?: boolean;
}
type HeaderPlainBackdropComposeProps = BaseContainerInjectedProps & HeaderPlainBackdropProps

const DEF_SHADOW = {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
}
// import { Shadow, Rect, Canvas } from "@shopify/react-native-skia";
// <Canvas pointerEvents='none' style={[styles.abs, { width: size.width, height: size.height + 8 * 2 + 6 }, { zIndex: zIndex - 1 }]}>
//                 <Rect x={0} y={0} width={size.width} height={size.height} color={"#FFFFFF"}>
//                     <Shadow dx={0} dy={6} blur={8} color="#00000022" />
//                 </Rect>
//             </Canvas>

const HeaderPlainBackdrop = (props: HeaderPlainBackdropComposeProps) => {
    const {
        size,
        abs,
        zIndex,
        shadow = DEF_SHADOW,
        enableShadow = false,
        backgroundColor = '#FFFFFF'
    } = props;
    const viewStyle: ViewStyle = useMemo(() => ({
        zIndex: zIndex - 1,
        backgroundColor: backgroundColor,
        ...Platform.select({
            ios: enableShadow ? shadow : {}
        })
    }), [enableShadow, backgroundColor])

    return (
        <View style={[size, abs, viewStyle]} />
    )
}
export default HeaderPlainBackdrop;