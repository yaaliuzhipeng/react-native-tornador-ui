import React from 'react';
import { Svg, Path } from 'react-native-svg'
import { ViewStyle, View, StyleSheet } from 'react-native';

const VIEW_BOX = '0 0 1024 1024'
const VIEW_BOX2x = '0 0 2048 2048'
export { VIEW_BOX, VIEW_BOX2x }
export interface SvgIconProps {
    name: string[];
    size?: number;
    color?: string;
    viewBox?: string;
    style?: ViewStyle;
    offset?: {
        top?: number;
        left?: number;
    }
}
const SvgIcon = (props: SvgIconProps) => {
    let n = props.name;
    let size = props.size ?? 20;
    let color = props.color ?? "#222";
    let top = props.offset?.top ?? 0;
    let left = props.offset?.left ?? 0;
    return (
        <View style={[styles.center, { height: size, width: size }, props.style]}>
            <View style={{ position: 'absolute', top: top, left: left }}>
                <Svg
                    height={size}
                    width={size}
                    fill={color}
                    viewBox={props.viewBox ?? VIEW_BOX}
                >
                    {n.map((item: string, index: number) => {
                        return <Path key={index.toString()} d={item} translateY={10} />
                    })}
                </Svg>
            </View>
        </View>
    )
};
export default SvgIcon;

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})
