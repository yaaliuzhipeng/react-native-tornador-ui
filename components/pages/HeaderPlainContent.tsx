import React, { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet, TextStyle } from 'react-native';
import SvgIcon from '../svg/SvgIcon';
import { BaseContainerInjectedProps } from './BaseContainer';

const ICON_LEFT = [
    'M299.52 521.728c-3.2768-13.9264 0.512-29.184 11.3664-40.0384l341.9136-341.9136c16.6912-16.6912 43.7248-16.6912 60.3136 0s16.6912 43.7248 0 60.3136L401.3056 512l311.9104 311.9104c16.6912 16.6912 16.6912 43.7248 0 60.3136s-43.7248 16.6912-60.3136 0l-342.016-341.9136c-5.632-5.632-9.6256-12.8-11.3664-20.5824z'
];

export type HeaderPlainContentProps = {
    title?: string;
    titleStyle?: TextStyle;
    onPressBack?: () => void;
    HeaderLeftComponent?: (props) => any;
    HeaderCenterComponent?: (props) => any;
    HeaderRightComponent?: (props) => any;
    widthScales?: [string, string, string]; //三个组件宽度占比: '25%','50%','25%'
}

type HeaderPlainContentComposeProps = HeaderPlainContentProps & BaseContainerInjectedProps;

const HeaderPlainContent = (props: HeaderPlainContentComposeProps) => {
    const {
        size,
        abs,
        zIndex,
        insets,
        title = '',
        titleStyle = {},
        widthScales = ['25%', '50%', '25%'],
        onPressBack,
        HeaderLeftComponent,
        HeaderCenterComponent,
        HeaderRightComponent
    } = props;

    const _titleStyle: TextStyle = useMemo(() => ({
        fontSize: font(17),
        color: '#000000',
        fontWeight: '500',
        ...titleStyle
    }), [])
    return (
        <View style={[styles.row_c, size, abs, {
            zIndex,
            paddingTop: insets.top
        }]}>
            <View style={[styles.row_c, { width: widthScales[0], height: '100%' }]}>
                {(!isNil(HeaderLeftComponent)) ? HeaderRightComponent : (
                    <Pressable onPress={onPressBack} style={{ paddingHorizontal: ft(10) }}>
                        <SvgIcon name={ICON_LEFT} size={ft(22)} color={'#000'} />
                    </Pressable>
                )}
            </View>
            <View style={[styles.c, { width: widthScales[1], height: '100%' }]}>
                {(!isNil(HeaderCenterComponent)) ? HeaderCenterComponent : (
                    <Text style={_titleStyle}>{title}</Text>
                )}
            </View>
            <View style={[styles.row_c, { width: widthScales[2], height: '100%' }]}>
                {!isNil(HeaderRightComponent) && HeaderRightComponent}
            </View>
        </View>
    )
}
export default HeaderPlainContent;

const styles = StyleSheet.create({
    c: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    row_c: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})