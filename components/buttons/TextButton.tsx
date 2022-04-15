import React from "react";
import { Pressable, PressableProps, View, Text, ViewProps, ViewStyle } from "react-native";

interface TextButtonProps extends PressableProps, Omit<ViewStyle, 'style'> {
    label: string;
    color?: string;
    fontSize?: number;
    bold?: boolean;
    style?: ViewStyle;
}
const TextButton = React.memo((props: TextButtonProps) => {
    const { label, color = '#238CFF', fontSize = font(16), bold = false, style = {} } = props;
    return (
        <Pressable {...props} style={{ marginVertical: 8, ...style }}>
            <Text style={{
                color: color,
                fontSize: fontSize,
                fontWeight: bold ? 'bold' : 'normal'
            }}>{label}</Text>
        </Pressable>
    )
});
export default TextButton;