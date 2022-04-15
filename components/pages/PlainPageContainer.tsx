import React, { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlainPageHeaderHeight } from './PlainPageHeader';

const PlainPageContainer = React.memo((props: {
    children?: any;
    headerHeight?: number;
}) => {
    const { headerHeight = PlainPageHeaderHeight, children } = props;
    const insets = useSafeAreaInsets();
    const safeAreaTop = useMemo(() => insets.top + headerHeight, [insets]);
    return (
        <View style={{ flex: 1, marginTop: safeAreaTop }}>
            {children}
        </View>
    )
});
export default PlainPageContainer;