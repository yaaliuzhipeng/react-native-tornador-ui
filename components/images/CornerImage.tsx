import React, { useMemo } from 'react';
import { Image, Text, ViewStyle, ImageStyle, Pressable, View, TextStyle } from 'react-native';
import FastImage, { ResizeMode } from 'react-native-fast-image';

const Hidden = (props: {
    children?: any;
    show?: boolean;
}) => {
    if (props.show) {
        return props?.children;
    } else {
        return null;
    }
};

function isNetImage(url: string) {
    return (url.indexOf('http://') != -1) || (url.indexOf('https://') != -1)
}

const IImage = React.memo((props: {
    isFile: boolean;
    isRawAsset: boolean;
    src: any;
    text: string;
    height: number;
    width: number;
    radius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    resizeMode: ResizeMode | undefined;
    style: ImageStyle;
    textStyles: TextStyle[];
    children?: any;
}) => {

    const { isFile, isRawAsset, text, src, resizeMode, height, width, radius, borderWidth, borderColor, backgroundColor, style, textStyles } = props;

    const viewStyle: any = useMemo(() => ({
        height: height,
        width: width,
        borderRadius: radius,
        overflow: 'hidden',
        borderWidth: borderWidth,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        justifyContent: 'center',
        alignItems: 'center'
    }), [height, width, radius, borderWidth, borderColor, backgroundColor]);

    const source = useMemo(() => {
        if (isRawAsset) return { uri: src };
        //non raw
        if (isFile) {
            return src
        } else {
            return isNetImage(src) ? ({ uri: src }) : ({ uri: 'file://' + src })
        }
    }, [isFile, src, isRawAsset])

    return (
        <>
            <Hidden show={text.length == 0}>
                <Hidden show={src == undefined || src == null || src == ''}>
                    <View style={[viewStyle, style]} >
                        {props?.children}
                    </View>
                </Hidden>
                <Hidden show={!(src == undefined || src == null || src == '')}>
                    <Hidden show={isFile || isRawAsset}>
                        <Image source={source} resizeMode={resizeMode} style={[viewStyle, style]} />
                    </Hidden>
                    <Hidden show={!isFile && !isRawAsset}>
                        <FastImage source={source} resizeMode={resizeMode} style={[viewStyle, style]} />
                    </Hidden>
                </Hidden>
            </Hidden>
            <Hidden show={text.length > 0}>
                <View style={[viewStyle, style]}>
                    <Text adjustsFontSizeToFit style={[{ fontSize: font(18), color: '#232323' }, ...textStyles]}>{text}</Text>
                </View>
            </Hidden>
        </>
    )
})

const CornerImage = React.memo((props: {
    src?: any;
    isRawAsset?: boolean;
    text?: string;
    size?: number;
    height?: number;
    width?: number;
    radius?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
    resizeMode?: string;
    style?: ImageStyle;
    containerStyles?: ViewStyle[];
    textStyles?: TextStyle[];
    onPress?: any;
    onLongPress?: any;
    disabled?: boolean;
    children?: any;
}) => {
    let isRawAsset = props?.isRawAsset ?? false;
    let isFile = typeof (props.src) != 'string';
    let size = props.size ?? 0;
    let height = props?.height ?? size;
    let width = props?.width ?? size;
    let radius = props.radius ?? size / 2;
    let borderWidth = props.borderWidth ?? 0;
    let borderColor = props.borderColor ?? '#f1f1f1';
    let style: ImageStyle = props.style ?? {};
    let resizeMode: any = props?.resizeMode ?? 'cover';
    let backgroundColor = props?.backgroundColor ?? 'transparent'
    let containerStyles = props?.containerStyles ?? [];
    let textStyles = props?.textStyles ?? [];
    const __handleNothing = () => { return; };


    const t = useMemo(() => {
        if (!props.text || props?.text?.length < 1) return '';
        return props.text.charAt(0)
    }, [props.text])

    return (
        <>
            <Hidden show={props?.onPress || props?.onLongPress}>
                <Pressable
                    disabled={props?.disabled}
                    onPress={props?.onPress ?? __handleNothing}
                    onLongPress={props?.onPress ?? __handleNothing}
                    style={[...containerStyles]}>
                    <IImage
                        textStyles={textStyles}
                        backgroundColor={backgroundColor}
                        text={t}
                        src={props.src}
                        isFile={isFile}
                        isRawAsset={isRawAsset}
                        height={height}
                        width={width}
                        radius={radius}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                        style={style}
                        resizeMode={resizeMode}
                    >
                        {props?.children}
                    </IImage>
                </Pressable>
            </Hidden>
            <Hidden show={!(props?.onPress || props?.onLongPress)}>
                <View style={[...containerStyles]}>
                    <IImage
                        textStyles={textStyles}
                        backgroundColor={backgroundColor}
                        text={t}
                        src={props.src}
                        isFile={isFile}
                        isRawAsset={isRawAsset}
                        height={height}
                        width={width}
                        radius={radius}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                        style={style}
                        resizeMode={resizeMode}
                    >
                        {props?.children}
                    </IImage>
                </View>
            </Hidden>
        </>
    )
});

export default CornerImage;
