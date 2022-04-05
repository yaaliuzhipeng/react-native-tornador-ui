declare namespace TornadorUI {
  type ColorSchemeName = 'light' | 'dark';
  type Colors = {
    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;
    background: string;
    border: string;
    surface: string;
    error: string;
    onPrimary: string;
    onPrimaryVariant: string;
    onSecondary: string;
    onSecondaryVariant: string;
    onBackground: string;
    onSurface: string;
  };
  type Theme = {
    colors: Colors | any;
    schema: ColorSchemeName;
  };
}

// largeTitle
// title1
// title2
// title3
// headline
// body
// callout
// subhead
// footnote
// caption1
// caption2