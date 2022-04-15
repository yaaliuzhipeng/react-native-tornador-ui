import React from 'react';
import BaseContainer from './BaseContainer';
import BottomTabBarPlainBackdrop, { BottomTabBarPlainBackdropProps } from './BottomTabBarPlainBackdrop';
import BottomTabBarPlainContent, { BottomTabBarPlainContentProps } from './BottomTabBarPlainContent';

export const PlainBottomTabBarHeight = 56;
const PlainBottomTabBar = (props: {
    height?: number;
    zIndex?: number;
    backdropConfigs?: BottomTabBarPlainBackdropProps;
    contentConfigs?: BottomTabBarPlainContentProps;
}) => {
    const {
        height = PlainBottomTabBarHeight,
        zIndex = 999,
        backdropConfigs = {},
        contentConfigs = {}
    } = props;

    return (
        <BaseContainer
            position='bottom'
            height={height}
            zIndex={zIndex}
            renderBackdropComponent={(props) => (
                <BottomTabBarPlainBackdrop {...props} {...backdropConfigs} />
            )}
            renderContentComponent={(props) => (
                <BottomTabBarPlainContent {...props} {...contentConfigs} />
            )}
        />
    )
}
export default PlainBottomTabBar;