import React, { useMemo } from 'react';
import { ScaledSize, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export type BaseHeaderInjectedProps = {
    size: { width: number; height: number };
    height: number;
    insets: EdgeInsets;
    dms: ScaledSize;
    abs: ViewStyle;
    zIndex:number;
}
export type BaseHeaderProps = {
    zIndex?: number;
    height?: number;
    renderContentComponent: (props: any) => any;
    renderBackdropComponent: (props: any) => any;
}
const HeaderBase = React.memo((props: BaseHeaderProps) => {

    const { height = 50, zIndex = 99, renderContentComponent, renderBackdropComponent } = props;
    const insets = useSafeAreaInsets();
    const dms = useWindowDimensions();
    const size = useMemo(() => ({ height: insets.top + height, width: dms.width }), [insets, dms]);
    const injectedProps = useMemo(() => ({ size, insets, height, dms, abs: styles.abs,zIndex }), [size])

    return (
        <>
            <View style={[styles.abs, size, { zIndex }]}>
                {renderContentComponent(injectedProps)}
            </View>
            {renderBackdropComponent(injectedProps)}
        </>
    )
})
export default HeaderBase;

const styles = StyleSheet.create({
    abs: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
    }
})