import React, { memo, createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const DefaultColors = {
    light: {
        primary: '#FF6374',
        primaryVariant: '#E14556',
        secondary: '#71B8FF',
        secondaryVariant: '#549AE1',
        background: '#F9FBFC',
        border: '#EDEDED',
        surface: '#FFFFFF',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onPrimaryVariant: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onSecondaryVariant: '#FFFFFF',
        onBackground: '#000000',
        onSurface: '#000000',
    },
    dark: {
        primary: '#FF6374',
        primaryVariant: '#E14556',
        secondary: '#71B8FF',
        secondaryVariant: '#549AE1',
        background: '#F9FBFC',
        border: '#EDEDED',
        surface: '#FFFFFF',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onPrimaryVariant: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onSecondaryVariant: '#FFFFFF',
        onBackground: '#000000',
        onSurface: '#000000',
    }
}
const DefaultTheme: TornadorUI.Theme = {
    colors: DefaultColors.light,
    schema: 'light'
};
const ThemeContext = createContext(DefaultTheme);

const ThemeProvider = memo((props: {
    children?: any;
    enableDynamic?: boolean;
    colors?: { light: TornadorUI.Colors; dark: TornadorUI.Colors }
}) => {
    const schema = useColorScheme();
    const [theme, setTheme] = useState(function () {
        return ({
            colors: props.colors?.light ?? DefaultColors.light,
            schema: schema
        })
    })
    useEffect(() => {
        let t = { ...theme }
        if (props.enableDynamic) {
            t.schema = schema;
            t.colors = schema === 'light' ? (props.colors?.light ?? DefaultColors.light) : (props.colors?.dark ?? DefaultColors.dark)
            setTheme(t);
        } else {
            t.colors = props.colors?.light ?? DefaultColors.light;
            setTheme(t);
        }
    }, [schema, props.enableDynamic])

    return (
        <ThemeContext.Provider value={theme}>
            {props.children}
        </ThemeContext.Provider>
    )
});

const useTheme: () => TornadorUI.Theme = () => useContext(ThemeContext);

export { useTheme };
export default ThemeProvider;