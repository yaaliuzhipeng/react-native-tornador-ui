import React, { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlainPageHeaderHeight } from './PlainPageHeader';
import { PlainBottomTabBarHeight } from './PlainBottomTabBar';

type Edges = 'top' | 'bottom';
const PlainPageContainer = React.memo((props: {
    children?: any;
    headerHeight?: number;
    tabBarHeight?: number;
    edges?: Edges[];
}) => {
    const {
        headerHeight = PlainPageHeaderHeight,
        tabBarHeight = PlainBottomTabBarHeight,
        children,
        edges = ['top']
    } = props;
    const insets = useSafeAreaInsets();
    const safeEdges = useMemo(() => {
        return ({
            top: edges.indexOf('top') != -1 ? (insets.top + headerHeight) : 0,
            bottom: edges.indexOf('bottom') != -1 ? (insets.bottom + tabBarHeight) : 0
        })
    }, [insets, edges]);
    return (
        <View style={{ flex: 1, marginTop: safeEdges.top,marginBottom: safeEdges.bottom }}>
            {children}
        </View>
    )
});
export default PlainPageContainer;